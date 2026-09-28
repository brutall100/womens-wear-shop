const eur = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" });

export function formatPrice(cents: number) {
  return eur.format(cents / 100);
}

/** "29,99" arba "29.99" -> 2999. Grąžina null, jei reikšmė netinkama. */
export function parsePrice(input: string | null | undefined): number | null {
  if (input == null) return null;
  const normalized = String(input).trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
  if (normalized === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

export function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const dateFormat = new Intl.DateTimeFormat("lt-LT", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date) {
  return dateFormat.format(date);
}

export function orderNumber(id: number) {
  return `#${String(id + 1000)}`;
}
