import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate, formatEur, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Užsakymai" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "Visi" },
  { key: "PAID", label: "Apmokėti" },
  { key: "SHIPPED", label: "Išsiųsti" },
  { key: "COMPLETED", label: "Įvykdyti" },
  { key: "NEW", label: "Neapmokėti" },
  { key: "CANCELLED", label: "Atšaukti" },
];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/uzsakymai">) {
  const sp = await searchParams;
  const status = typeof sp.busena === "string" ? sp.busena : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) where.OR = [{ number: { contains: q } }, { customerName: { contains: q } }, { customerEmail: { contains: q } }];

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">Užsakymai</h1>
        <p className="text-sm text-ink-muted">{orders.length} užsakymų</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/uzsakymai?busena=${f.key}` : "/admin/uzsakymai"}
            className={`rounded-full px-4 py-2 text-sm transition ${
              status === f.key ? "bg-ink text-cream" : "bg-white text-ink-soft hover:bg-cream-dark"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <form className="ml-auto flex gap-2">
          {status && <input type="hidden" name="busena" value={status} />}
          <input type="search" name="q" defaultValue={q} placeholder="Nr., vardas, el. paštas…" className="input w-64" />
          <button type="submit" className="btn-outline">Ieškoti</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-cream-dark/50 text-left text-xs uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-3">Užsakymas</th>
              <th className="px-4 py-3">Pirkėjas</th>
              <th className="px-4 py-3">Būsena</th>
              <th className="px-4 py-3">Apmokėjimas</th>
              <th className="px-4 py-3">Prekės</th>
              <th className="px-4 py-3 text-right">Suma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-cream-dark/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/uzsakymai/${o.id}`} className="font-medium hover:underline">{o.number}</Link>
                  <p className="text-xs text-ink-muted">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{o.customerName}</p>
                  <p className="text-xs text-ink-muted">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge kind="order" value={o.status} label={ORDER_STATUS_LABELS[o.status]} /></td>
                <td className="px-4 py-3"><StatusBadge kind="payment" value={o.paymentStatus} label={PAYMENT_STATUS_LABELS[o.paymentStatus]} /></td>
                <td className="px-4 py-3 text-ink-soft">{o._count.items}</td>
                <td className="px-4 py-3 text-right font-medium">{formatEur(o.totalCents)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-muted">Užsakymų nerasta.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
