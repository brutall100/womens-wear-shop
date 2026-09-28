import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, orderNumber } from "@/lib/format";
import { orderStatuses } from "@/config/store";
import { PageHeader, StatusBadge } from "../../ui";
import { refreshPayment, updateOrderStatus } from "../actions";

const PAYMENT_STATES: Record<string, string> = {
  initial: "Pradėtas",
  settled: "Apmokėta",
  authorized: "Autorizuota",
  sent_for_processing: "Apdorojama banke",
  waiting_for_sca: "Laukiama patvirtinimo",
  waiting_for_3ds_response: "Laukiama 3DS",
  failed: "Nepavyko",
  abandoned: "Nutrauktas",
  voided: "Anuliuotas",
  refunded: "Grąžinta",
  partially_refunded: "Dalinai grąžinta",
};

export default async function OrderDetailPage(props: PageProps<"/admin/uzsakymai/[id]">) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) || 0 },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/uzsakymai" className="text-sm text-muted hover:text-ink">
        ← Užsakymai
      </Link>
      <PageHeader title={`Užsakymas ${orderNumber(order.id)}`}>
        <StatusBadge status={order.status} />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3">Prekė</th>
                  <th className="px-3 py-3">Dydis</th>
                  <th className="px-3 py-3">Kiekis</th>
                  <th className="px-5 py-3 text-right">Suma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      {item.productId ? (
                        <Link href={`/admin/prekes/${item.productId}`} className="font-medium hover:underline">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}
                      <span className="block text-xs text-muted">{formatPrice(item.unitPrice)} / vnt.</span>
                    </td>
                    <td className="px-3 py-3">{item.size}</td>
                    <td className="px-3 py-3">{item.quantity}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line text-sm">
                <tr>
                  <td colSpan={3} className="px-5 pt-3 text-muted">
                    Prekės
                  </td>
                  <td className="px-5 pt-3 text-right">{formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-5 py-1 text-muted">
                    Pristatymas ({order.shippingMethod})
                  </td>
                  <td className="px-5 py-1 text-right">{formatPrice(order.shippingPrice)}</td>
                </tr>
                <tr className="text-base font-semibold">
                  <td colSpan={3} className="px-5 pt-1 pb-4">
                    Iš viso
                  </td>
                  <td className="px-5 pt-1 pb-4 text-right">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">SEB mokėjimai</h2>
              <form action={refreshPayment}>
                <input type="hidden" name="id" value={order.id} />
                <button className="text-sm font-medium underline underline-offset-4">Atnaujinti būseną</button>
              </form>
            </div>
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted">Mokėjimų nėra.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span>
                      <span className="font-medium">{PAYMENT_STATES[p.state] ?? p.state}</span>
                      <span className="ml-2 text-xs text-muted">{formatDate(p.createdAt)}</span>
                    </span>
                    <span className="font-mono text-xs text-muted" title={p.paymentReference ?? ""}>
                      {p.orderReference}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {order.note && (
            <section className="card p-5">
              <h2 className="mb-2 font-semibold">Kliento pastaba</h2>
              <p className="text-sm whitespace-pre-line">{order.note}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Būsena</h2>
            <form action={updateOrderStatus} className="flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="input" key={order.status}>
                {Object.entries(orderStatuses).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button className="btn-primary px-4 py-2">Keisti</button>
            </form>
            <p className="mt-3 text-xs text-muted">
              Sukurta {formatDate(order.createdAt)}
              {order.paidAt && <> · Apmokėta {formatDate(order.paidAt)}</>}
            </p>
          </section>

          <section className="card space-y-4 p-5 text-sm">
            <div>
              <p className="label">Klientas</p>
              <p className="font-medium">
                {order.firstName} {order.lastName}
              </p>
              <a href={`mailto:${order.email}`} className="block hover:underline">
                {order.email}
              </a>
              <a href={`tel:${order.phone}`} className="block hover:underline">
                {order.phone}
              </a>
            </div>
            <div className="border-t border-line pt-4">
              <p className="label">{order.shippingMethod}</p>
              <p>
                {order.address}
                <br />
                {order.city} {order.postalCode}
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
