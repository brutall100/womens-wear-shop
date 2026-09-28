import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatEur, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/format";
import { getSebConfig } from "@/lib/payments/seb";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [productCount, activeCount, newOrders, revenue, recentOrders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 2 }, product: { isActive: true } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
  ]);

  const seb = getSebConfig();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-medium">Apžvalga</h1>
        <p className="text-sm text-ink-muted">Sveiki sugrįžę. Štai, kas vyksta parduotuvėje.</p>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          seb ? "border-success/30 bg-success/5 text-success" : "border-rose/30 bg-rose-soft text-rose-dark"
        }`}
      >
        {seb ? (
          <>SEB e. prekyba prijungta ({seb.environment === "live" ? "gyva aplinka" : "demo aplinka"}, sąskaita {seb.accountName}).</>
        ) : (
          <>
            SEB mokėjimai veikia <strong>demonstraciniu režimu</strong>. Įrašykite <code>SEB_API_USERNAME</code>,{" "}
            <code>SEB_API_SECRET</code> ir <code>SEB_ACCOUNT_NAME</code> į <code>.env</code>, kad priimtumėte tikrus mokėjimus.
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Pajamos šį mėnesį" value={formatEur(revenue._sum.totalCents ?? 0)} />
        <Stat label="Apmokėti, neišsiųsti" value={String(newOrders)} href="/admin/uzsakymai?busena=PAID" />
        <Stat label="Aktyvios prekės" value={`${activeCount} / ${productCount}`} href="/admin/prekes" />
        <Stat label="Mažas likutis" value={String(lowStock.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
            <h2 className="font-medium">Naujausi užsakymai</h2>
            <Link href="/admin/uzsakymai" className="text-sm text-ink-soft hover:text-ink">Visi →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-muted">Užsakymų dar nėra.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink/8">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-dark/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/uzsakymai/${o.id}`} className="font-medium hover:underline">
                        {o.number}
                      </Link>
                      <p className="text-xs text-ink-muted">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{o.customerName}</td>
                    <td className="px-3 py-3">
                      <StatusBadge kind="order" value={o.status} label={ORDER_STATUS_LABELS[o.status]} />
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">
                      <StatusBadge kind="payment" value={o.paymentStatus} label={PAYMENT_STATUS_LABELS[o.paymentStatus]} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatEur(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="border-b border-ink/8 px-5 py-4">
            <h2 className="font-medium">Baigiasi likutis</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-muted">Visų prekių likučiai pakankami.</p>
          ) : (
            <ul className="divide-y divide-ink/8 text-sm">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-5 py-3">
                  <Link href={`/admin/prekes/${v.product.id}`} className="hover:underline">
                    {v.product.name} <span className="text-ink-muted">· {v.size}</span>
                  </Link>
                  <span className={`badge ${v.stock === 0 ? "bg-danger/10 text-danger" : "bg-rose-soft text-rose-dark"}`}>
                    {v.stock} vnt.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="card p-5 transition hover:border-ink/30">{content}</Link>
  ) : (
    <div className="card p-5">{content}</div>
  );
}
