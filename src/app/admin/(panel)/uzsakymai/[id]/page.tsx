import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  formatDate,
  formatEur,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
} from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { markOrderPaidManually, updateOrderStatus } from "../../actions";

export const metadata: Metadata = { title: "Užsakymas" };
export const dynamic = "force-dynamic";

const NEXT_STATUSES: Record<string, { status: string; label: string; primary?: boolean }[]> = {
  NEW: [{ status: "CANCELLED", label: "Atšaukti užsakymą" }],
  PAID: [
    { status: "SHIPPED", label: "Pažymėti kaip išsiųstą", primary: true },
    { status: "CANCELLED", label: "Atšaukti" },
  ],
  SHIPPED: [{ status: "COMPLETED", label: "Pažymėti kaip įvykdytą", primary: true }],
  COMPLETED: [],
  CANCELLED: [],
};

export default async function OrderDetailPage({ params }: PageProps<"/admin/uzsakymai/[id]">) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { id: true, slug: true } } } } },
  });
  if (!order) notFound();

  const actions = NEXT_STATUSES[order.status] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/uzsakymai" className="text-sm text-ink-muted hover:text-ink">← Užsakymai</Link>
          <h1 className="mt-1 font-display text-3xl font-medium">Užsakymas {order.number}</h1>
          <p className="text-sm text-ink-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="order" value={order.status} label={ORDER_STATUS_LABELS[order.status]} />
          <StatusBadge kind="payment" value={order.paymentStatus} label={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="border-b border-ink/8 px-5 py-4 font-medium">Prekės</div>
            <ul className="divide-y divide-ink/8">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-sand">
                    {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    {item.product ? (
                      <Link href={`/admin/prekes/${item.product.id}`} className="hover:underline">{item.name}</Link>
                    ) : (
                      <span>{item.name}</span>
                    )}
                    <p className="text-xs text-ink-muted">Dydis {item.size} · {item.quantity} × {formatEur(item.priceCents)}</p>
                  </div>
                  <span className="font-medium">{formatEur(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-ink/8 bg-cream-dark/40 px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Prekės</dt><dd>{formatEur(order.subtotalCents)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Pristatymas · {SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}</dt>
                <dd>{formatEur(order.shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 font-medium"><dt>Iš viso</dt><dd>{formatEur(order.totalCents)}</dd></div>
            </dl>
          </div>

          <div className="card p-5 text-sm">
            <h2 className="font-medium">Mokėjimo informacija</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div><dt className="text-xs text-ink-muted">Tiekėjas</dt><dd>{order.paymentProvider === "seb" ? "SEB e. prekyba" : "Demo"}</dd></div>
              <div><dt className="text-xs text-ink-muted">Būdas</dt><dd>{order.paymentMethod ?? "—"}</dd></div>
              <div><dt className="text-xs text-ink-muted">Būsena (gateway)</dt><dd>{order.paymentState ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-ink-muted">Mokėjimo nuoroda</dt><dd className="break-all font-mono text-xs">{order.paymentReference ?? "—"}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 text-sm">
            <h2 className="font-medium">Pirkėjas</h2>
            <p className="mt-3">{order.customerName}</p>
            <p className="text-ink-soft"><a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a></p>
            <p className="text-ink-soft"><a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a></p>
            <h3 className="mt-5 text-xs uppercase tracking-[0.14em] text-ink-muted">Pristatymas</h3>
            <p className="mt-1">{SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}</p>
            <p className="text-ink-soft">{order.address}</p>
            <p className="text-ink-soft">{order.postalCode} {order.city}</p>
            {order.note && (
              <>
                <h3 className="mt-5 text-xs uppercase tracking-[0.14em] text-ink-muted">Pastaba</h3>
                <p className="mt-1 whitespace-pre-line text-ink-soft">{order.note}</p>
              </>
            )}
          </div>

          <div className="card space-y-2 p-5">
            <h2 className="font-medium">Veiksmai</h2>
            {actions.map((a) => (
              <form key={a.status} action={updateOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={a.status} />
                <button type="submit" className={`${a.primary ? "btn-primary" : "btn-outline"} w-full text-sm`}>
                  {a.label}
                </button>
              </form>
            ))}
            {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
              <form action={markOrderPaidManually}>
                <input type="hidden" name="id" value={order.id} />
                <button type="submit" className="btn-ghost w-full text-xs">Pažymėti apmokėtu rankiniu būdu</button>
              </form>
            )}
            {actions.length === 0 && order.paymentStatus === "PAID" && (
              <p className="text-xs text-ink-muted">Užsakymas užbaigtas – daugiau veiksmų nėra.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
