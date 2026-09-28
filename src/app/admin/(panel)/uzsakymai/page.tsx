import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, orderNumber } from "@/lib/format";
import { orderStatuses } from "@/config/store";
import { PageHeader, StatusBadge } from "../ui";

export default async function OrdersPage(props: PageProps<"/admin/uzsakymai">) {
  const { busena, q } = await props.searchParams;
  const status = typeof busena === "string" && orderStatuses[busena] ? busena : "";
  const query = typeof q === "string" ? q.trim() : "";
  const numeric = Number(query.replace("#", "")) - 1000;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { email: { contains: query } },
              { lastName: { contains: query } },
              { firstName: { contains: query } },
              ...(Number.isInteger(numeric) && numeric > 0 ? [{ id: numeric }] : []),
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Užsakymai" />
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterLink href="/admin/uzsakymai" active={!status} label="Visi" />
        {Object.entries(orderStatuses).map(([key, s]) => (
          <FilterLink key={key} href={`/admin/uzsakymai?busena=${key}`} active={status === key} label={s.label} />
        ))}
      </div>
      <form className="mb-4">
        {status && <input type="hidden" name="busena" value={status} />}
        <input name="q" defaultValue={query} placeholder="Ieškoti: nr., pavardė, el. paštas" className="input max-w-sm" />
      </form>

      <div className="card overflow-x-auto">
        {orders.length === 0 ? (
          <p className="px-6 py-16 text-center text-muted">Užsakymų nerasta.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3">Nr.</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Klientas</th>
                <th className="px-3 py-3">Pristatymas</th>
                <th className="px-3 py-3">Būsena</th>
                <th className="px-5 py-3 text-right">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream">
                  <td className="px-5 py-3">
                    <Link href={`/admin/uzsakymai/${o.id}`} className="font-semibold hover:underline">
                      {orderNumber(o.id)}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-3">
                    {o.firstName} {o.lastName}
                    <span className="block text-xs text-muted">{o.email}</span>
                  </td>
                  <td className="px-3 py-3 text-muted">{o.shippingMethod}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
        active ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );
}
