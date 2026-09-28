import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    ordersTotal,
    ordersPending,
    revenueAll,
    revenueMonth,
    productsActive,
    productsInactive,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", paidAt: { gte: monthStart } },
      _sum: { totalCents: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 2 }, product: { isActive: true } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        number: true,
        firstName: true,
        lastName: true,
        totalCents: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Pajamos (šį mėnesį)", value: formatPrice(revenueMonth._sum.totalCents ?? 0) },
    { label: "Pajamos (viso)", value: formatPrice(revenueAll._sum.totalCents ?? 0) },
    { label: "Užsakymų", value: String(ordersTotal), hint: `${ordersPending} laukia apmokėjimo` },
    {
      label: "Prekių",
      value: String(productsActive),
      hint: productsInactive > 0 ? `${productsInactive} paslėptos` : "visos matomos",
    },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Apžvalga</h1>
          <p className="mt-1 text-sm text-muted">Parduotuvės būklė šiandien</p>
        </div>
        <Link href="/admin/prekes/nauja" className={buttonClass("primary", "md")}>
          + Nauja prekė
        </Link>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line bg-shell p-5">
            <p className="eyebrow">{stat.label}</p>
            <p className="mt-2 font-display text-3xl">{stat.value}</p>
            {stat.hint && <p className="mt-1 text-xs text-muted">{stat.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-shell">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg">Naujausi užsakymai</h2>
            <Link href="/admin/uzsakymai" className="text-xs text-muted link-underline hover:text-ink">
              Visi užsakymai
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Užsakymų kol kas nėra
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2.5 font-normal">Numeris</th>
                  <th className="px-3 py-2.5 font-normal">Pirkėjas</th>
                  <th className="px-3 py-2.5 font-normal">Apmokėjimas</th>
                  <th className="px-5 py-2.5 text-right font-normal">Suma</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/admin/uzsakymai/${order.id}`} className="hover:text-clay">
                        {order.number}
                      </Link>
                      <span className="block text-xs text-muted">
                        {order.createdAt.toLocaleDateString("lt-LT")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {order.firstName} {order.lastName}
                      <span className="block text-xs text-muted">
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-3 text-right">{formatPrice(order.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="border border-line bg-shell">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-lg">Baigiasi likučiai</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Visų dydžių likučiai pakankami
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {lowStock.map((variant) => (
                <li key={variant.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <Link
                    href={`/admin/prekes/${variant.product.id}`}
                    className="flex-1 truncate hover:text-clay"
                  >
                    {variant.product.name}
                  </Link>
                  <span className="text-xs text-muted">{variant.size}</span>
                  <span
                    className={`text-xs ${variant.stock === 0 ? "text-danger" : "text-clay"}`}
                  >
                    {variant.stock} vnt.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "border-success/40 text-success",
    PENDING: "border-line text-muted",
    CANCELLED: "border-danger/40 text-danger",
    FAILED: "border-danger/40 text-danger",
    REFUNDED: "border-line text-muted",
  };

  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[11px] ${styles[status] ?? "border-line text-muted"}`}
    >
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
