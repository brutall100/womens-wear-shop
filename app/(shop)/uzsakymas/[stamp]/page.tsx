import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayAgain } from "@/components/PayAgain";
import { getOrderByStamp } from "@/lib/db";
import { statusLabel } from "@/lib/labels";
import { formatDate, formatEur } from "@/lib/money";

export const metadata: Metadata = { title: "Užsakymas" };

export default async function OrderPage({ params }: { params: Promise<{ stamp: string }> }) {
  const { stamp } = await params;
  const order = getOrderByStamp(stamp);
  if (!order) notFound();
  const paid = order.status === "paid" || order.status === "preparing" || order.status === "shipped";

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Užsakymas</p>
      <h1 className="mt-2 font-serif text-5xl">MOT-{order.stamp.slice(0, 8)}</h1>
      <p className="mt-4 text-lg">{paid ? "Mokėjimas gautas. Ačiū." : statusLabel(order.status)}</p>
      <p className="mt-2 text-sm text-muted">
        {formatDate(order.createdAt)} · {order.email}
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-4">
            <span>
              {item.name}
              <span className="block text-sm text-muted">
                {item.size} · {item.qty} vnt.
              </span>
            </span>
            <span className="num">{formatEur(item.priceCents * item.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between text-sm">
        <span>{order.deliveryLabel}</span>
        <span className="num">{formatEur(order.deliveryCents)}</span>
      </div>
      <div className="mt-2 flex justify-between">
        <span>Iš viso</span>
        <span className="num font-serif text-3xl">{formatEur(order.amountCents)}</span>
      </div>
      <p className="mt-6 text-sm text-muted">
        {order.name}, {order.phone}
        {order.city ? ` · ${order.city}` : ""} {order.address}
      </p>
      {!paid && (order.status === "pending" || order.status === "failed") ? <PayAgain stamp={order.stamp} /> : null}
      <Link href="/katalogas" className="mt-8 inline-block text-sm underline">
        Grįžti į katalogą
      </Link>
    </div>
  );
}
