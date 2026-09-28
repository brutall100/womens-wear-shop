import Link from "next/link";
import { listOrders } from "@/lib/db";
import { statusLabel } from "@/lib/labels";
import { formatDate, formatEur } from "@/lib/money";

export default function OrdersPage() {
  const orders = listOrders();
  return (
    <div>
      <h1 className="font-serif text-5xl">Užsakymai</h1>
      {orders.length === 0 ? (
        <p className="mt-8 border border-line bg-card p-8">Užsakymų dar nėra.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/uzsakymai/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span>
                  <span className="block font-serif text-2xl">MOT-{order.stamp.slice(0, 8)}</span>
                  <span className="text-sm text-muted">
                    {order.name} · {formatDate(order.createdAt)}
                  </span>
                </span>
                <span className="text-sm">{statusLabel(order.status)}</span>
                <span className="num text-sm">{formatEur(order.amountCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
