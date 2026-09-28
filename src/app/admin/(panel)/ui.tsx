import { orderStatuses } from "@/config/store";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-4xl">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = orderStatuses[status] ?? { label: status, tone: "bg-stone-100" };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${s.tone}`}>{s.label}</span>;
}
