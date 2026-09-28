/** Kainos visoje sistemoje saugomos centais (Int), valiuta – EUR. */

const formatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
});

/** 4990 -> „49,90 €“ */
export function formatPrice(cents: number): string {
  return formatter.format(cents / 100);
}

/** 4990 -> „49.90“ (SEB banklink VK_AMOUNT formatas) */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** „49,90“ arba „49.90“ -> 4990. Grąžina null, jei įvestis netinkama. */
export function parsePriceToCents(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input * 100) : null;
  }
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "" || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number.parseFloat(normalized) * 100);
}

/** Kaina redagavimo laukams: 4990 -> „49.90“ */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}

/** PVM dalis kainoje su PVM (21 %). */
export function vatAmountCents(grossCents: number, vatRate = 21): number {
  return Math.round(grossCents - grossCents / (1 + vatRate / 100));
}
