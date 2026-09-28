import { prisma } from "@/lib/prisma";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Naujas",
  PROCESSING: "Ruošiamas",
  SHIPPED: "Išsiųstas",
  COMPLETED: "Įvykdytas",
  CANCELLED: "Atšauktas",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Laukiama apmokėjimo",
  PAID: "Apmokėta",
  FAILED: "Nepavyko",
  CANCELLED: "Atšaukta",
  REFUNDED: "Grąžinta",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);
export const PAYMENT_STATUSES = Object.keys(PAYMENT_STATUS_LABELS);

/** Užsakymo numeris: LT-2026-0042 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `LT-${year}-`;

  const last = await prisma.order.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const lastSeq = last ? Number.parseInt(last.number.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
