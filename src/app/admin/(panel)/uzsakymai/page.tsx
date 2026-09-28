import Link from "next/link";
import { formatPrice } from "@/lib/money";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { buttonClass, cn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Užsakymai" };

type SearchParams = Promise<{
  paieska?: string;
  busena?: string;
  apmokejimas?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.paieska?.trim() ?? "";

  const orders = await prisma.order.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { number: { contains: search } },
              { email: { contains: search } },
              { lastName: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
      ...(params.busena ? { status: params.busena } : {}),
      ...(params.apmokejimas ? { paymentStatus: params.apmokejimas } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 200,
  });

  const paidTotal = orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <div>
      <header>
        <h1 className="text-3xl">Užsakymai</h1>
        <p className="mt-1 text-sm text-muted">
          {orders.length} įrašų · apmokėta {formatPrice(paidTotal)}
        </p>
      </header>

      <form className="mt-6 flex flex-wrap items-end gap-3" action="/admin/uzsakymai">
        <div>
          <label className="field-label" htmlFor="paieska">
            Paieška
          </label>
          <input
            id="paieska"
            name="paieska"
            defaultValue={search}
            className="field w-60"
            placeholder="Numeris, el. paštas, pavardė"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="busena">
            Užsakymo būsena
          </label>
          <select
            id="busena"
            name="busena"
            defaultValue={params.busena ?? ""}
            className="field w-44 cursor-pointer"
          >
            <option value="">Visos</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="apmokejimas">
            Apmokėjimas
          </label>
          <select
            id="apmokejimas"
            name="apmokejimas"
            defaultValue={params.apmokejimas ?? ""}
            className="field w-48 cursor-pointer"
          >
            <option value="">Visi</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PAYMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Filtruoti
        </button>
        {(search || params.busena || params.apmokejimas) && (
          <Link href="/admin/uzsakymai" className="pb-2.5 text-xs text-muted link-underline">
            Išvalyti
          </Link>
        )}
      </form>

      <div className="mt-6 border border-line bg-shell">
        {orders.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted">Užsakymų nerasta</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-3 font-normal">Numeris</th>
                <th className="px-3 py-3 font-normal">Pirkėjas</th>
                <th className="hidden px-3 py-3 font-normal md:table-cell">Pristatymas</th>
                <th className="px-3 py-3 font-normal">Būsena</th>
                <th className="px-3 py-3 font-normal">Apmokėjimas</th>
                <th className="px-4 py-3 text-right font-normal">Suma</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/uzsakymai/${order.id}`}
                      className="hover:text-clay"
                    >
                      {order.number}
                    </Link>
                    <span className="block text-xs text-muted">
                      {order.createdAt.toLocaleString("lt-LT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {order.firstName} {order.lastName}
                    <span className="block text-xs text-muted">{order.email}</span>
                  </td>
                  <td className="hidden px-3 py-3 text-muted md:table-cell">
                    {order.shippingMethodName}
                    <span className="block text-xs">{order._count.items} prekės</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-block border border-line px-2 py-0.5 text-[11px] text-muted">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-block border px-2 py-0.5 text-[11px]",
                        order.paymentStatus === "PAID"
                          ? "border-success/40 text-success"
                          : order.paymentStatus === "PENDING"
                            ? "border-line text-muted"
                            : "border-danger/40 text-danger",
                      )}
                    >
                      {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatPrice(order.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
