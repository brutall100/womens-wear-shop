import { prisma } from "@/lib/db";
import { shopConfig, shippingCost, type ShippingMethod } from "@/lib/config";
import {
  createOneOffPayment,
  fetchPayment,
  getSebConfig,
  normalizePaymentState,
} from "@/lib/payments/seb";
import type { Order, OrderItem, Prisma } from "@prisma/client";

export type OrderWithItems = Order & { items: OrderItem[] };

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  shippingMethod: ShippingMethod;
  address: string;
  city: string;
  postalCode: string;
  note?: string;
}

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const count = await tx.order.count();
  const year = new Date().getFullYear();
  return `${year}-${String(count + 1).padStart(5, "0")}`;
}

/**
 * Validates cart lines against the database (current prices, stock),
 * reserves stock and creates an order awaiting payment.
 */
export async function createOrder(lines: CartLine[], customer: CustomerDetails): Promise<OrderWithItems> {
  if (lines.length === 0) throw new OrderError("Krepšelis tuščias.");

  const merged = new Map<string, number>();
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) continue;
    merged.set(line.variantId, (merged.get(line.variantId) ?? 0) + line.quantity);
  }
  if (merged.size === 0) throw new OrderError("Krepšelis tuščias.");

  return prisma.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: [...merged.keys()] } },
      include: {
        product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      },
    });

    const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let subtotal = 0;

    for (const [variantId, quantity] of merged) {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant || !variant.product.isActive) {
        throw new OrderError("Kai kurių prekių krepšelyje nebėra. Atnaujinkite krepšelį.");
      }
      if (variant.stock < quantity) {
        throw new OrderError(
          `„${variant.product.name}“ (${variant.size}) likutis nepakankamas – liko ${variant.stock} vnt.`,
        );
      }
      subtotal += variant.product.priceCents * quantity;
      items.push({
        name: variant.product.name,
        size: variant.size,
        priceCents: variant.product.priceCents,
        quantity,
        imageUrl: variant.product.images[0]?.url ?? null,
        product: { connect: { id: variant.productId } },
        variant: { connect: { id: variant.id } },
      });
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: { decrement: quantity } },
      });
    }

    const shipping = shippingCost(customer.shippingMethod, subtotal);

    return tx.order.create({
      data: {
        number: await nextOrderNumber(tx),
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingMethod: customer.shippingMethod,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        note: customer.note || null,
        subtotalCents: subtotal,
        shippingCents: shipping,
        totalCents: subtotal + shipping,
        paymentProvider: getSebConfig() ? "seb" : "demo",
        items: { create: items },
      },
      include: { items: true },
    });
  });
}

export function orderReturnUrl(order: Order): string {
  return `${shopConfig.siteUrl}/uzsakymas/${order.number}`;
}

/**
 * Starts payment for an order and returns the URL the customer must be sent to.
 * Without SEB credentials the shop runs in demo mode with a simulated bank page.
 */
export async function startPayment(order: OrderWithItems, customerIp?: string): Promise<string> {
  const cfg = getSebConfig();
  if (!cfg) {
    return `/mokejimas/demo/${order.id}`;
  }

  const { paymentReference, paymentLink, raw } = await createOneOffPayment(cfg, {
    orderReference: order.number,
    amountCents: order.totalCents,
    customerUrl: orderReturnUrl(order),
    customerEmail: order.customerEmail,
    customerIp,
    description: `${shopConfig.name} uzsakymas ${order.number}`,
    billing: {
      line1: order.address,
      city: order.city,
      postcode: order.postalCode,
      country: "LT",
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference, paymentState: raw.payment_state ?? "initial" },
  });

  return paymentLink;
}

async function restoreStock(order: OrderWithItems) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

/** Applies a (normalized) payment result to the order, idempotently. */
export async function applyPaymentResult(
  order: OrderWithItems,
  result: { status: "PAID" | "FAILED" | "PENDING"; state: string; method?: string | null; reference?: string },
): Promise<OrderWithItems> {
  if (order.paymentStatus === "PAID") {
    return order;
  }
  const data: Prisma.OrderUpdateInput = {
    paymentState: result.state,
    paymentMethod: result.method ?? order.paymentMethod,
  };
  if (result.reference) data.paymentReference = result.reference;

  if (result.status === "PAID") {
    data.paymentStatus = "PAID";
    if (order.status === "NEW") data.status = "PAID";
  } else if (result.status === "FAILED") {
    data.paymentStatus = "FAILED";
    if (order.paymentStatus !== "FAILED" && order.status === "NEW") {
      data.status = "CANCELLED";
      await restoreStock(order);
    }
  }

  return prisma.order.update({ where: { id: order.id }, data, include: { items: true } });
}

/**
 * Re-fetches the payment from SEB and updates the order.
 * Safe to call from the return page and the callback endpoint.
 */
export async function syncOrderPayment(order: OrderWithItems): Promise<OrderWithItems> {
  const cfg = getSebConfig();
  if (!cfg || order.paymentProvider !== "seb" || !order.paymentReference) return order;
  if (order.paymentStatus !== "PENDING") return order;

  const payment = await fetchPayment(cfg, order.paymentReference);
  if (payment.order_reference && payment.order_reference !== order.number) {
    throw new OrderError("Mokėjimo nuoroda neatitinka užsakymo.");
  }
  return applyPaymentResult(order, {
    status: normalizePaymentState(payment.payment_state),
    state: payment.payment_state,
    method: payment.payment_method ?? null,
  });
}

export async function cancelOrder(order: OrderWithItems): Promise<OrderWithItems> {
  if (order.status === "CANCELLED") return order;
  if (order.status === "NEW" && order.paymentStatus !== "PAID") {
    await restoreStock(order);
  }
  return prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
    include: { items: true },
  });
}
