import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { PayAgain } from "@/components/pay-again";
import { canPay, ERROR_MESSAGES, isPaid, statusLabel } from "@/lib/labels";
import { formatDate, formatEur } from "@/lib/money";
import { routes } from "@/lib/routes";
import type { Order } from "@/lib/types";

export function OrderView({ order, error }: { order: Order; error?: string }) {
  const paid = isPaid(order.status);
  const message = error ? ERROR_MESSAGES[error] : "";
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <div className="pattern-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Užsakymas</p>
          <span className={`badge badge--${order.status}`}>{statusLabel(order.status)}</span>
        </div>
        <h1 className="mt-4 font-mono text-4xl font-medium tracking-tight sm:text-5xl">MOT-{order.stamp.slice(0, 8)}</h1>
        {paid ? (
          <p className="mt-5 flex items-center gap-3 text-xl font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ok text-surface">
              <CheckIcon size={22} />
            </span>
            Mokėjimas gautas. Ačiū!
          </p>
        ) : (
          <p className="mt-5 text-lg">{order.status === "failed" ? "Mokėjimas neįvyko." : "Užsakymas laukia mokėjimo."}</p>
        )}
        <p className="mt-2 text-sm text-muted">
          {formatDate(order.createdAt)} · {order.email}
        </p>
        {message ? (
          <p role="alert" className="notice notice--danger mt-5">
            {message}
          </p>
        ) : null}

        <ul className="mt-8 divide-y divide-dashed divide-line border-y border-dashed border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-4">
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
        <div className="mt-4 flex justify-between text-sm">
          <span>{order.deliveryLabel}</span>
          <span className="price">{order.deliveryCents === 0 ? "Nemokamai" : formatEur(order.deliveryCents)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-semibold">Iš viso</span>
          <span className="price text-3xl">{formatEur(order.amountCents)}</span>
        </div>
        <p className="mt-6 text-sm text-muted">
          {order.name}, {order.phone}
          {order.city ? ` · ${order.address}, ${order.city} ${order.postal}` : ""}
        </p>
        {!paid && canPay(order.status) ? <PayAgain stamp={order.stamp} /> : null}
      </div>
      <Link href={routes.catalog} className="btn btn-ghost mt-8">
        Grįžti į katalogą
      </Link>
    </div>
  );
}
