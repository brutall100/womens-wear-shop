"use server";

import { prisma } from "@/lib/prisma";
import { getSebConfig, sebCancelUrl, sebReturnUrl } from "@/lib/seb/config";
import { buildPaymentRequest, referenceWithCheckDigit } from "@/lib/seb/ipizza";
import { getMerchantPrivateKey } from "@/lib/seb/keys";

export type RetryResult =
  | { ok: true; payment: { url: string; fields: Record<string, string> } }
  | { ok: false; message: string };

/** Pakartotinis apmokėjimas, jei pirmas bandymas buvo atšauktas. */
export async function retryPayment(orderId: string): Promise<RetryResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) return { ok: false, message: "Užsakymas nerastas" };
  if (order.paymentStatus === "PAID") {
    return { ok: false, message: "Užsakymas jau apmokėtas" };
  }
  if (order.status === "CANCELLED") {
    return { ok: false, message: "Užsakymas atšauktas" };
  }

  const config = getSebConfig();
  const stamp = `${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
  const reference = referenceWithCheckDigit(order.number.replace(/\D/g, ""));

  const payment = buildPaymentRequest({
    config,
    privateKeyPem: getMerchantPrivateKey(),
    stamp,
    amountCents: order.totalCents,
    reference,
    message: `Užsakymas ${order.number}`,
    returnUrl: sebReturnUrl(config),
    cancelUrl: sebCancelUrl(config),
  });

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "SEB",
      stamp,
      reference,
      amountCents: order.totalCents,
      currency: "EUR",
      status: "PENDING",
      requestPayload: JSON.stringify(payment.fields),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PENDING" },
  });

  return { ok: true, payment };
}
