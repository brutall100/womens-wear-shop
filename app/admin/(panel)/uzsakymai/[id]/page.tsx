import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { STATUS_LABEL, statusLabel } from "@/lib/labels";
import { formatDate, formatEur } from "@/lib/money";

export default async function OrderAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/uzsakymai" className="text-sm underline">
        Visi užsakymai
      </Link>
      <h1 className="mt-3 font-serif text-5xl">MOT-{order.stamp.slice(0, 8)}</h1>
      <p className="mt-2 text-sm text-muted">
        {statusLabel(order.status)} · {formatDate(order.createdAt)}
        {order.paidAt ? ` · apmokėta ${formatDate(order.paidAt)}` : ""}
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <span>
              {item.name}
              <span className="block text-sm text-muted">
                {item.size} · {item.qty}
              </span>
            </span>
            <span className="num">{formatEur(item.priceCents * item.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        {order.deliveryLabel} · {formatEur(order.deliveryCents)}
      </p>
      <p className="num mt-1 font-serif text-3xl">{formatEur(order.amountCents)}</p>
      <div className="mt-6 text-sm">
        <p>{order.name}</p>
        <p>{order.email}</p>
        <p>{order.phone}</p>
        <p>
          {order.address} {order.city} {order.postal}
        </p>
        {order.note ? <p className="mt-2 text-muted">{order.note}</p> : null}
        <p className="mt-2 text-muted">Paskirtis banke: {order.vkMsg}</p>
      </div>
      <form action={`/api/admin/orders/${order.id}`} method="post" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="grid gap-2 text-sm">
          Būsena
          <select name="status" defaultValue={order.status} className="h-12 border border-line bg-card px-3">
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-12 bg-ink px-5 text-sm text-paper">
          Išsaugoti būseną
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link href={`/uzsakymas/${order.stamp}`} className="underline">
          Pirkėjos nuoroda
        </Link>
      </p>
    </div>
  );
}
