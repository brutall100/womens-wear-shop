import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { applyPaymentResult } from "@/lib/orders";
import { getSebConfig } from "@/lib/payments/seb";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Demonstracinis apmokėjimas", robots: { index: false } };

/**
 * Simulated bank page used while SEB credentials are not configured.
 * It mirrors what the hosted SEB/EveryPay payment page does: the customer
 * either completes or abandons the payment and is redirected back to the shop.
 */
export default async function DemoPaymentPage({ params }: PageProps<"/mokejimas/demo/[orderId]">) {
  if (getSebConfig()) notFound();

  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) notFound();
  if (order.paymentStatus !== "PENDING") redirect(`/uzsakymas/${order.number}`);

  async function finish(formData: FormData) {
    "use server";
    const outcome = formData.get("outcome") === "pay" ? "settled" : "abandoned";
    const fresh = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!fresh) notFound();
    if (fresh.paymentStatus === "PENDING") {
      await applyPaymentResult(fresh, {
        status: outcome === "settled" ? "PAID" : "FAILED",
        state: outcome,
        method: outcome === "settled" ? "demo_banklink" : null,
        reference: `demo-${fresh.id}`,
      });
    }
    redirect(`/uzsakymas/${fresh.number}?payment_reference=demo-${fresh.id}&order_reference=${fresh.number}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between bg-[#60cd18]/15 px-6 py-4">
          <span className="font-semibold tracking-wide text-[#3d7f0f]">SEB · Demonstracinis mokėjimų langas</span>
          <span className="badge bg-white text-ink-soft">DEMO</span>
        </div>
        <div className="space-y-6 p-6">
          <div>
            <p className="label">Gavėjas</p>
            <p className="text-sm">{process.env.NEXT_PUBLIC_SHOP_NAME || "Mūza"}</p>
          </div>
          <div>
            <p className="label">Užsakymo nr.</p>
            <p className="text-sm">{order.number}</p>
          </div>
          <div>
            <p className="label">Suma</p>
            <p className="font-display text-3xl">{formatEur(order.totalCents)}</p>
          </div>
          <p className="rounded-lg bg-cream-dark px-3 py-2 text-xs text-ink-soft">
            Tikroje aplinkoje čia būtų SEB e. prekybos (EveryPay) puslapis su bankų, kortelių, Apple Pay ir
            Google Pay pasirinkimu. Nustatę <code>SEB_API_USERNAME</code>, <code>SEB_API_SECRET</code> ir{" "}
            <code>SEB_ACCOUNT_NAME</code>, šis langas nebebus rodomas.
          </p>
          <form action={finish} className="flex flex-col gap-2">
            <button type="submit" name="outcome" value="pay" className="btn-primary w-full">
              Patvirtinti mokėjimą
            </button>
            <button type="submit" name="outcome" value="cancel" className="btn-ghost w-full">
              Atšaukti ir grįžti į parduotuvę
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
