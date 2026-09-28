export const STATUS_LABEL: Record<string, string> = {
  pending: "Laukia mokėjimo",
  paid: "Apmokėta",
  preparing: "Ruošiama",
  shipped: "Išsiųsta",
  cancelled: "Atšaukta",
  failed: "Nepavyko",
};

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function isPaid(status: string): boolean {
  return status === "paid" || status === "preparing" || status === "shipped";
}

export function canPay(status: string): boolean {
  return status === "pending" || status === "failed";
}

/** Short messages for `?klaida=` in the address bar. */
export const ERROR_MESSAGES: Record<string, string> = {
  bankas: "Banko atsakymo patikrinti nepavyko. Pabandykite apmokėti dar kartą arba parašykite mums.",
};
