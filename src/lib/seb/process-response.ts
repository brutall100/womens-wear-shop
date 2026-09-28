import { prisma } from "@/lib/prisma";
import { getSebConfig } from "@/lib/seb/config";
import { getBankPublicKey } from "@/lib/seb/keys";
import {
  FAILURE_SERVICES,
  SUCCESS_SERVICES,
  verifyBankResponse,
  type VkFields,
} from "@/lib/seb/ipizza";
import { centsToDecimalString } from "@/lib/money";

export type ProcessedResponse = {
  outcome: "paid" | "cancelled" | "invalid";
  orderId?: string;
  orderNumber?: string;
  reason?: string;
  /** VK_AUTO=Y reiškia automatinį banko pranešimą be naršyklės */
  automatic: boolean;
};

/**
 * Patikrina banko atsakymo parašą ir atnaujina užsakymo būseną.
 * Pakartotinai gavus tą patį atsakymą būsena nekeičiama antrą kartą.
 */
export async function processSebResponse(fields: VkFields): Promise<ProcessedResponse> {
  const config = getSebConfig();
  const automatic = fields.VK_AUTO === "Y";
  const service = fields.VK_SERVICE ?? "";

  if (!SUCCESS_SERVICES.has(service) && !FAILURE_SERVICES.has(service)) {
    return { outcome: "invalid", reason: "Nežinomas VK_SERVICE", automatic };
  }

  if (!verifyBankResponse(fields, getBankPublicKey(), config.algorithm, config.macLengthMode)) {
    return { outcome: "invalid", reason: "Neteisingas banko parašas", automatic };
  }

  const stamp = fields.VK_STAMP;
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { stamp },
    include: { order: { include: { items: true } } },
  });

  if (!transaction) {
    return { outcome: "invalid", reason: "Mokėjimas nerastas", automatic };
  }

  const orderNumber = transaction.order.number;
  const orderId = transaction.orderId;

  if (FAILURE_SERVICES.has(service)) {
    if (transaction.status === "PENDING") {
      await prisma.$transaction([
        prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: "CANCELLED", responsePayload: JSON.stringify(fields) },
        }),
        prisma.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: "CANCELLED" },
        }),
      ]);
    }
    return { outcome: "cancelled", orderId, orderNumber, automatic };
  }

  // Sėkmingas atsakymas – papildomai tikriname sumą ir valiutą
  const expectedAmount = centsToDecimalString(transaction.amountCents);
  if (fields.VK_AMOUNT !== expectedAmount || fields.VK_CURR !== transaction.currency) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED", responsePayload: JSON.stringify(fields) },
    });
    return {
      outcome: "invalid",
      orderId,
      orderNumber,
      reason: "Nesutampa mokėjimo suma",
      automatic,
    };
  }

  if (transaction.status === "PAID") {
    return { outcome: "paid", orderId, orderNumber, automatic };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "PAID",
        bankTransactionNo: fields.VK_T_NO ?? null,
        payerName: fields.VK_SND_NAME ?? null,
        payerAccount: fields.VK_SND_ACC ?? null,
        responsePayload: JSON.stringify(fields),
      },
    });

    await tx.order.update({
      where: { id: transaction.orderId },
      data: { paymentStatus: "PAID", status: "PROCESSING", paidAt: new Date() },
    });

    for (const item of transaction.order.items) {
      if (!item.productId || !item.size) continue;
      const variant = await tx.productVariant.findFirst({
        where: { productId: item.productId, size: item.size },
      });
      if (!variant) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: Math.max(0, variant.stock - item.quantity) },
      });
    }
  });

  return { outcome: "paid", orderId, orderNumber, automatic };
}

/** Surenka VK_ laukus iš POST formos arba GET užklausos. */
export function collectVkFields(source: URLSearchParams | FormData): VkFields {
  const fields: VkFields = {};
  source.forEach((value, key) => {
    if (key.startsWith("VK_") && typeof value === "string") {
      fields[key] = value;
    }
  });
  return fields;
}
