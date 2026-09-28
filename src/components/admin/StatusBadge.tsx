const ORDER_STYLES: Record<string, string> = {
  NEW: "bg-sand text-ink-soft",
  PAID: "bg-success/10 text-success",
  SHIPPED: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-ink text-cream",
  CANCELLED: "bg-danger/10 text-danger",
};

const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-sand text-ink-soft",
  PAID: "bg-success/10 text-success",
  FAILED: "bg-danger/10 text-danger",
};

export function StatusBadge({
  kind,
  value,
  label,
}: {
  kind: "order" | "payment";
  value: string;
  label?: string;
}) {
  const styles = kind === "order" ? ORDER_STYLES : PAYMENT_STYLES;
  return <span className={`badge ${styles[value] ?? "bg-sand text-ink-soft"}`}>{label ?? value}</span>;
}
