import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, orderNumber } from "@/lib/format";
import { PageHeader, StatusBadge } from "./ui";

const PAID = ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"];

export default async function DashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [toFulfil, monthRevenue, monthOrders, activeProducts, lowStock, recent] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: PAID }, paidAt: { gte: monthStart } } }),
    prisma.order.count({ where: { status: { in: PAID }, paidAt: { gte: monthStart } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 2 }, product: { isActive: true } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const stats = [
    { label: "Laukia išsiuntimo", value: String(toFulfil), href: "/admin/uzsakymai?busena=PAID" },
    { label: "Pardavimai šį mėnesį", value: formatPrice(monthRevenue._sum.total ?? 0) },
    { label: "Apmokėti užsakymai šį mėn.", value: String(monthOrders) },
    { label: "Aktyvios prekės", value: String(activeProducts), href: "/admin/prekes" },
  ];

  return (
    <>
      <PageHeader title="Suvestinė">
        <Link href="/admin/prekes/nauja" className="btn-primary">
          + Nauja prekė
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold">{s.value}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="card p-5 transition hover:border-ink">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="card p-5">
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Naujausi užsakymai</h2>
            <Link href="/admin/uzsakymai" className="text-sm text-muted hover:text-ink">
              Visi →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Užsakymų dar nėra.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-cream">
                    <td className="px-5 py-3">
                      <Link href={`/admin/uzsakymai/${o.id}`} className="font-medium hover:underline">
                        {orderNumber(o.id)}
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      {o.firstName} {o.lastName}
                    </td>
                    <td className="hidden px-2 py-3 text-muted sm:table-cell">{formatDate(o.createdAt)}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Baigiasi likutis</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Visų prekių pakanka.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/admin/prekes/${v.product.id}`} className="truncate hover:underline">
                    {v.product.name} <span className="text-muted">· {v.size}</span>
                  </Link>
                  <span className={`font-semibold ${v.stock === 0 ? "text-accent" : ""}`}>{v.stock} vnt.</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
