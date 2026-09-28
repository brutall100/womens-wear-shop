import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RetryPaymentButton } from "@/components/checkout/retry-payment-button";
import { formatPrice, vatAmountCents } from "@/lib/money";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Užsakymas",
  robots: { index: false },
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ busena?: string }>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { busena } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const paid = order.paymentStatus === "PAID";
  const cancelled = order.paymentStatus === "CANCELLED" || busena === "atsaukta";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div
        className={`border px-6 py-8 text-center ${
          paid ? "border-success/30 bg-success/5" : "border-line bg-shell"
        }`}
      >
        <p className="eyebrow">Užsakymas {order.number}</p>
        <h1 className="mt-3 text-4xl">
          {paid
            ? "Ačiū už užsakymą!"
            : cancelled
              ? "Mokėjimas neužbaigtas"
              : "Laukiama apmokėjimo"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {paid
            ? `Apmokėjimą gavome. Užsakymo patvirtinimą išsiuntėme adresu ${order.email}. Prekes išsiųsime per 1–2 darbo dienas.`
            : cancelled
              ? "Mokėjimas banke nebuvo užbaigtas. Užsakymas išsaugotas – galite pabandyti apmokėti dar kartą."
              : "Užsakymas sukurtas, tačiau apmokėjimo dar negavome."}
        </p>

        {!paid && (
          <div className="mt-6 flex justify-center">
            <RetryPaymentButton orderId={order.id} />
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="eyebrow">Būsena</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Užsakymas</dt>
              <dd>{ORDER_STATUS_LABELS[order.status] ?? order.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Apmokėjimas</dt>
              <dd>{PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Data</dt>
              <dd>{order.createdAt.toLocaleDateString("lt-LT")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Mokėjimo būdas</dt>
              <dd>SEB bankas</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="eyebrow">Pristatymas</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              {order.firstName} {order.lastName}
            </p>
            <p className="text-muted">{order.shippingMethodName}</p>
            {order.address && <p className="text-muted">{order.address}</p>}
            {(order.city || order.postalCode) && (
              <p className="text-muted">
                {[order.postalCode, order.city].filter(Boolean).join(" ")}
              </p>
            )}
            <p className="text-muted">{order.phone}</p>
            <p className="text-muted">{order.email}</p>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="eyebrow">Prekės</h2>
        <ul className="mt-3 border-t border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-b border-line py-4">
              <div className="relative h-20 w-[60px] shrink-0 overflow-hidden bg-sand">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-sm">
                {item.productSlug ? (
                  <Link href={`/preke/${item.productSlug}`} className="hover:text-clay">
                    {item.productName}
                  </Link>
                ) : (
                  <span>{item.productName}</span>
                )}
                <p className="mt-0.5 text-xs text-muted">
                  {item.size ? `${item.size} · ` : ""}
                  {item.quantity} vnt. × {formatPrice(item.unitPriceCents)}
                </p>
              </div>
              <span className="text-sm">{formatPrice(item.totalCents)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Prekės</dt>
            <dd>{formatPrice(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Pristatymas</dt>
            <dd>
              {order.shippingPriceCents === 0
                ? "Nemokamai"
                : formatPrice(order.shippingPriceCents)}
            </dd>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <dt>Iš jų PVM ({order.vatRate} %)</dt>
            <dd>{formatPrice(vatAmountCents(order.totalCents, order.vatRate))}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt>Iš viso</dt>
            <dd className="font-display text-2xl">{formatPrice(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link href="/parduotuve" className={buttonClass("secondary", "lg")}>
          Tęsti apsipirkimą
        </Link>
        <p className="text-xs text-muted">
          Klausimai? {site.email} · {site.phone}
        </p>
      </div>
    </div>
  );
}
