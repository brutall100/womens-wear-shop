import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatPrice, vatAmountCents } from "@/lib/money";
import { PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Užsakymas" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <nav className="text-xs text-muted">
        <Link href="/admin/uzsakymai" className="link-underline hover:text-ink">
          Užsakymai
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{order.number}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl">{order.number}</h1>
        <p className="text-sm text-muted">
          {order.createdAt.toLocaleString("lt-LT", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-line bg-shell">
            <h2 className="border-b border-line px-5 py-3.5 text-lg">Prekės</h2>
            <ul className="divide-y divide-line/70">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-sand">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{item.productName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.size ? `Dydis ${item.size} · ` : ""}
                      {item.quantity} vnt. × {formatPrice(item.unitPriceCents)}
                    </p>
                  </div>
                  <span className="text-sm">{formatPrice(item.totalCents)}</span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Prekės</dt>
                <dd>{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">
                  Pristatymas ({order.shippingMethodName})
                </dt>
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
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt>Iš viso</dt>
                <dd className="font-display text-xl">{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-line bg-shell">
            <h2 className="border-b border-line px-5 py-3.5 text-lg">
              SEB mokėjimo operacijos
            </h2>
            {order.transactions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Mokėjimo bandymų nėra
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {order.transactions.map((transaction) => (
                  <li key={transaction.id} className="px-5 py-4 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span>
                        {PAYMENT_STATUS_LABELS[transaction.status] ?? transaction.status}
                        {transaction.bankTransactionNo && (
                          <span className="text-muted">
                            {" "}
                            · banko Nr. {transaction.bankTransactionNo}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted">
                        {transaction.createdAt.toLocaleString("lt-LT", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt>Suma</dt>
                        <dd className="text-ink">
                          {formatPrice(transaction.amountCents)} {transaction.currency}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Mokėjimo kodas</dt>
                        <dd className="text-ink">{transaction.reference}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>VK_STAMP</dt>
                        <dd className="text-ink">{transaction.stamp}</dd>
                      </div>
                      {transaction.payerName && (
                        <div className="flex gap-2">
                          <dt>Mokėtojas</dt>
                          <dd className="text-ink">{transaction.payerName}</dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Būsena</h2>
            <div className="mt-4">
              <OrderStatusForm
                orderId={order.id}
                status={order.status}
                paymentStatus={order.paymentStatus}
              />
            </div>
            {order.paidAt && (
              <p className="mt-4 text-xs text-muted">
                Apmokėta {order.paidAt.toLocaleString("lt-LT")}
              </p>
            )}
          </section>

          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Pirkėjas</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                {order.firstName} {order.lastName}
              </p>
              <p>
                <a href={`mailto:${order.email}`} className="link-underline">
                  {order.email}
                </a>
              </p>
              <p>
                <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="link-underline">
                  {order.phone}
                </a>
              </p>
            </div>

            <h3 className="mt-5 eyebrow">Pristatymas</h3>
            <div className="mt-2 space-y-1 text-sm text-muted">
              <p>{order.shippingMethodName}</p>
              {order.address && <p>{order.address}</p>}
              {(order.postalCode || order.city) && (
                <p>{[order.postalCode, order.city].filter(Boolean).join(" ")}</p>
              )}
            </div>

            {order.comment && (
              <>
                <h3 className="mt-5 eyebrow">Komentaras</h3>
                <p className="mt-2 text-sm text-muted">{order.comment}</p>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
