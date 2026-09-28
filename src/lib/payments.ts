import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createSebPayment, getSebPayment, isFailedState, isPaidState, sebMode } from "@/lib/seb";
import { orderNumber } from "@/lib/format";
import { store } from "@/config/store";

export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Sukuria naują mokėjimo bandymą ir grąžina adresą, į kurį reikia nukreipti klientą. */
export async function startPayment(orderId: number, customerIp?: string): Promise<string> {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_FAILED") {
    return `/uzsakymas/${order.publicId}`;
  }

  const orderReference = `${order.id}-${randomBytes(4).toString("hex")}`;
  const payment = await prisma.payment.create({
    data: { orderId: order.id, orderReference, amount: order.total },
  });

  if (order.status === "PAYMENT_FAILED") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "PENDING_PAYMENT" } });
  }

  if (sebMode() === "mock") {
    return `/apmokejimas/bankas?ref=${encodeURIComponent(orderReference)}`;
  }

  const seb = await createSebPayment({
    orderReference,
    amountCents: order.total,
    customerUrl: `${siteUrl()}/api/payments/seb/return`,
    email: order.email,
    customerIp,
    description: `${store.name} užsakymas ${orderNumber(order.id)}`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { paymentReference: seb.payment_reference, state: seb.payment_state },
  });

  if (!seb.payment_link) throw new Error("SEB negrąžino mokėjimo nuorodos");
  return seb.payment_link;
}

/**
 * Patikrina mokėjimo būseną SEB sistemoje ir atnaujina užsakymą.
 * Kviečiama tiek grįžus klientui, tiek gavus SEB callback'ą (jie nėra pasirašyti,
 * todėl būsena visada pertikrinama per API).
 */
export async function syncPayment(ref: { paymentReference?: string | null; orderReference?: string | null }) {
  const payment = ref.paymentReference
    ? await prisma.payment.findUnique({ where: { paymentReference: ref.paymentReference } })
    : ref.orderReference
      ? await prisma.payment.findUnique({ where: { orderReference: ref.orderReference } })
      : null;
  if (!payment) return null;

  let state = payment.state;
  if (sebMode() !== "mock") {
    if (!payment.paymentReference) return payment;
    const remote = await getSebPayment(payment.paymentReference);
    if (remote.order_reference !== payment.orderReference) {
      throw new Error("SEB mokėjimo nuoroda nesutampa su užsakymu");
    }
    const paidAmount = Math.round(Number(remote.initial_amount ?? 0) * 100);
    if (isPaidState(remote.payment_state) && paidAmount !== payment.amount) {
      throw new Error(`Apmokėta suma (${paidAmount}) nesutampa su užsakymo suma (${payment.amount})`);
    }
    state = remote.payment_state;
    if (state !== payment.state) {
      await prisma.payment.update({ where: { id: payment.id }, data: { state } });
    }
  }

  if (isPaidState(state)) {
    await markOrderPaid(payment.orderId);
  } else if (isFailedState(state)) {
    await prisma.order.updateMany({
      where: { id: payment.orderId, status: "PENDING_PAYMENT" },
      data: { status: "PAYMENT_FAILED" },
    });
  }
  return { ...payment, state };
}

async function markOrderPaid(orderId: number) {
  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING_PAYMENT", "PAYMENT_FAILED"] } },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (updated.count === 0) return;

    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      await tx.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    await tx.productVariant.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });
  });
}
