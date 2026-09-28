import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { startPayment, syncPayment } from "@/lib/payments";
import { formatPrice, orderNumber } from "@/lib/format";
import { orderStatuses } from "@/config/store";

export const metadata: Metadata = { title: "Užsakymas", robots: { index: false } };

async function retryPayment(formData: FormData) {
  "use server";
  const publicId = String(formData.get("publicId"));
  const order = await prisma.order.findUnique({ where: { publicId } });
  if (!order) notFound();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  redirect(await startPayment(order.id, ip));
}

export default async function OrderPage(props: PageProps<"/uzsakymas/[id]">) {
  const { id } = await props.params;
  const { klaida } = await props.searchParams;

  let order = await prisma.order.findUnique({
    where: { publicId: id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) notFound();

  const lastPayment = order.payments[0];
  if (order.status === "PENDING_PAYMENT" && lastPayment?.paymentReference) {
    await syncPayment({ paymentReference: lastPayment.paymentReference }).catch(() => null);
    order = (await prisma.order.findUnique({
      where: { publicId: id },
      include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    }))!;
  }

  const paid = !["PENDING_PAYMENT", "PAYMENT_FAILED", "CANCELLED"].includes(order.status);
  const canRetry = order.status === "PENDING_PAYMENT" || order.status === "PAYMENT_FAILED";
  const processing = order.status === "PENDING_PAYMENT" && order.payments[0]?.state === "sent_for_processing";
  const status = orderStatuses[order.status];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <div className="text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {paid ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12l5 5L20 7" />
            </svg>
          ) : (
            <span className="text-2xl font-bold">!</span>
          )}
        </div>
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl">
          {paid
            ? "Ačiū, užsakymas gautas!"
            : processing
              ? "Mokėjimas apdorojamas"
              : order.status === "CANCELLED"
                ? "Užsakymas atšauktas"
                : "Užsakymas neapmokėtas"}
        </h1>
        <p className="mt-3 text-muted">
          Užsakymo nr. <strong className="text-ink">{orderNumber(order.id)}</strong>
          {paid && <> · Informaciją apie siuntą atsiųsime adresu {order.email}</>}
        </p>
        {klaida === "mokejimas" && (
          <p className="mt-4 text-sm text-accent">Nepavyko prisijungti prie banko. Bandykite apmokėti dar kartą.</p>
        )}
        {processing && (
          <p className="mt-4 text-sm text-muted">Bankas dar tvirtina mokėjimą. Atnaujinkite puslapį po kelių minučių.</p>
        )}
        {canRetry && !processing && (
          <form action={retryPayment} className="mt-6">
            <input type="hidden" name="publicId" value={order.publicId} />
            <button className="btn-primary">Apmokėti {formatPrice(order.total)}</button>
          </form>
        )}
      </div>

      <div className="card mt-12 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Užsakymo informacija</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status?.tone}`}>{status?.label}</span>
        </div>
        <ul className="mt-6 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.productName} <span className="text-muted">· {item.size} · {item.quantity} vnt.</span>
              </span>
              <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Pristatymas ({order.shippingMethod})</dt>
            <dd>{order.shippingPrice === 0 ? "Nemokamai" : formatPrice(order.shippingPrice)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Iš viso</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-line pt-6 text-sm">
          <p className="label">Pristatymo adresas</p>
          <p>
            {order.firstName} {order.lastName}
            <br />
            {order.address}, {order.city} {order.postalCode}
            <br />
            {order.phone}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/parduotuve" className="text-sm font-medium underline underline-offset-4">
          Tęsti apsipirkimą
        </Link>
      </div>
    </div>
  );
}
