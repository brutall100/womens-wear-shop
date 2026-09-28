import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatEur, SHIPPING_METHOD_LABELS } from "@/lib/format";
import { startPayment, syncOrderPayment } from "@/lib/orders";
import { RetryPaymentButton } from "@/components/shop/RetryPaymentButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Užsakymas", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/uzsakymas/[number]">) {
  const { number } = await params;
  const sp = await searchParams;

  let order = await prisma.order.findUnique({ where: { number }, include: { items: true } });
  if (!order) notFound();

  // Customer returned from SEB: the return URL contains payment_reference.
  // Callbacks are not signed, so we always re-fetch the payment state from the API.
  if (order.paymentStatus === "PENDING") {
    const ref = typeof sp.payment_reference === "string" ? sp.payment_reference : null;
    if (ref && !order.paymentReference) {
      order = await prisma.order.update({
        where: { id: order.id },
        data: { paymentReference: ref },
        include: { items: true },
      });
    }
    try {
      order = await syncOrderPayment(order);
    } catch (err) {
      console.error("Payment sync failed", err);
    }
  }

  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED" || order.status === "CANCELLED";

  async function retry() {
    "use server";
    const fresh = await prisma.order.findUnique({ where: { number }, include: { items: true } });
    if (!fresh || fresh.paymentStatus !== "PENDING") return null;
    return startPayment(fresh);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
            paid ? "bg-success/10 text-success" : failed ? "bg-danger/10 text-danger" : "bg-sand text-ink-soft"
          }`}
          aria-hidden
        >
          {paid ? "✓" : failed ? "✕" : "…"}
        </div>
        <p className="eyebrow mt-6">Užsakymas Nr. {order.number}</p>
        <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">
          {paid ? "Ačiū! Užsakymas apmokėtas" : failed ? "Apmokėjimas nepavyko" : "Laukiame apmokėjimo"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-ink-soft">
          {paid && (
            <>
              Patvirtinimą išsiuntėme į <strong>{order.customerEmail}</strong>. Prekes išsiųsime per 1–3 darbo dienas.
            </>
          )}
          {failed && "Mokėjimas buvo atšauktas arba nepatvirtintas. Pinigai nebuvo nuskaityti – galite bandyti dar kartą."}
          {!paid && !failed && "Jei jau apmokėjote, būsena atsinaujins per kelias minutes. Galite bandyti apmokėti dar kartą."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!paid && order.status !== "CANCELLED" && <RetryPaymentButton action={retry} />}
          {failed && <Link href="/prekes" className="btn-outline">Grįžti į parduotuvę</Link>}
          {paid && <Link href="/prekes" className="btn-primary">Tęsti apsipirkimą</Link>}
        </div>
      </div>

      <div className="card mt-12 overflow-hidden">
        <ul className="divide-y divide-ink/10 px-6">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p>{item.name}</p>
                <p className="text-xs text-ink-muted">Dydis {item.size} · {item.quantity} vnt.</p>
              </div>
              <p className="text-sm font-medium">{formatEur(item.priceCents * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-ink/10 bg-cream-dark/40 px-6 py-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Prekės</dt><dd>{formatEur(order.subtotalCents)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Pristatymas ({SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod})</dt>
            <dd>{order.shippingCents === 0 ? "Nemokamai" : formatEur(order.shippingCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 font-medium">
            <dt>Iš viso</dt><dd>{formatEur(order.totalCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <p className="label">Pristatymo adresas</p>
          <p>{order.customerName}</p>
          <p className="text-ink-soft">{order.address}</p>
          <p className="text-ink-soft">{order.postalCode} {order.city}</p>
        </div>
        <div>
          <p className="label">Kontaktai</p>
          <p className="text-ink-soft">{order.customerEmail}</p>
          <p className="text-ink-soft">{order.customerPhone}</p>
        </div>
      </div>
    </div>
  );
}
