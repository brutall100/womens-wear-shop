import Link from "next/link";
import { statusLabel } from "@/lib/labels";
import { formatDate, formatEur } from "@/lib/money";
import { routes } from "@/lib/routes";
import type { Order } from "@/lib/types";
import { OrderStatusForm } from "./order-status-form";

export function OrdersView({ orders }: { orders: Order[] }) {
  return (
    <div>
      <p className="eyebrow">Pirkėjos</p>
      <h1 className="mt-3 text-5xl">Užsakymai</h1>
      {orders.length === 0 ? (
        <p className="pattern-card mt-8 max-w-2xl">Užsakymų dar nėra. Kai kas nors apmokės krepšelį, užsakymas atsiras čia.</p>
      ) : (
        <ul className="panel mt-8 grid gap-1 p-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={routes.adminOrder(order.id)} className="data-row flex-wrap">
                <span className="min-w-0 flex-1">
                  <span className="price block text-lg">MOT-{order.stamp.slice(0, 8)}</span>
                  <span className="text-sm text-muted">
                    {order.name} · {formatDate(order.createdAt)}
                  </span>
                </span>
                <span className={`badge badge--${order.status}`}>{statusLabel(order.status)}</span>
                <span className="price text-sm">{formatEur(order.amountCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrderDetailView({ order }: { order: Order }) {
  return (
    <div className="max-w-3xl">
      <Link href={routes.adminOrders} className="link text-sm">
        ← Visi užsakymai
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-4xl font-medium tracking-tight">MOT-{order.stamp.slice(0, 8)}</h1>
        <span className={`badge badge--${order.status}`}>{statusLabel(order.status)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {formatDate(order.createdAt)}
        {order.paidAt ? ` · apmokėta ${formatDate(order.paidAt)}` : ""}
      </p>

      <div className="pattern-card mt-6">
        <ul className="divide-y divide-dashed divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <span>
                {item.name}
                <span className="block text-sm text-muted">
                  {item.size} · {item.qty} vnt.
                </span>
              </span>
              <span className="price">{formatEur(item.priceCents * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-dashed border-line pt-4 text-sm">
          <span>{order.deliveryLabel}</span>
          <span className="price">{order.deliveryCents === 0 ? "Nemokamai" : formatEur(order.deliveryCents)}</span>
        </p>
        <p className="mt-2 flex items-baseline justify-between">
          <span className="font-semibold">Iš viso</span>
          <span className="price text-3xl">{formatEur(order.amountCents)}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="panel p-5 text-sm">
          <h2 className="font-sans text-base font-semibold tracking-normal">Pirkėja</h2>
          <p className="mt-3">{order.name}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          {order.city ? (
            <p className="mt-2">
              {order.address}, {order.city} {order.postal}
            </p>
          ) : null}
          {order.note ? <p className="mt-3 text-muted">„{order.note}“</p> : null}
        </div>
        <div className="panel p-5 text-sm">
          <h2 className="font-sans text-base font-semibold tracking-normal">Mokėjimas</h2>
          <p className="mt-3 text-muted">Paskirtis banke</p>
          <p className="price">{order.vkMsg}</p>
          <Link href={routes.order(order.stamp)} className="link mt-3 inline-block">
            Pirkėjos užsakymo puslapis
          </Link>
        </div>
      </div>

      <OrderStatusForm id={order.id} status={order.status} />
    </div>
  );
}
