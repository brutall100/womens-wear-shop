const eur = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
});

export function formatEur(cents: number): string {
  return eur.format(cents / 100);
}

export function parseEurToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("lt-LT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z",
  };
  return input
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (ch) => map[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Naujas",
  PAID: "Apmokėtas",
  SHIPPED: "Išsiųstas",
  COMPLETED: "Įvykdytas",
  CANCELLED: "Atšauktas",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Laukiama apmokėjimo",
  PAID: "Apmokėta",
  FAILED: "Nepavyko",
};

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  courier: "Kurjeris į namus",
  parcel_locker: "Paštomatas",
};
