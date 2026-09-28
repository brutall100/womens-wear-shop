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
