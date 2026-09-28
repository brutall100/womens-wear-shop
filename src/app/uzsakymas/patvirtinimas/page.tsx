import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Printer } from "lucide-react";
import { getDb, Order } from "@/lib/db";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; status?: string; paymentId?: string }>;
}) {
  const { orderId, paymentId } = await searchParams;

  let order: Order | null = null;
  if (orderId) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Record<string, unknown> | undefined;
    if (row) {
      order = {
        id: row.id as string,
        orderNumber: row.orderNumber as string,
        customerName: row.customerName as string,
        customerEmail: row.customerEmail as string,
        customerPhone: row.customerPhone as string,
        shippingAddress: row.shippingAddress as string,
        city: row.city as string,
        postalCode: row.postalCode as string,
        deliveryMethod: row.deliveryMethod as Order["deliveryMethod"],
        deliveryDetails: (row.deliveryDetails as string) || "",
        paymentMethod: row.paymentMethod as Order["paymentMethod"],
        paymentStatus: row.paymentStatus as Order["paymentStatus"],
        sebTransactionId: (row.sebTransactionId as string) || undefined,
        sebPaymentReference: (row.sebPaymentReference as string) || undefined,
        items: JSON.parse((row.items as string) || "[]"),
        subtotal: Number(row.subtotal),
        shippingFee: Number(row.shippingFee),
        totalAmount: Number(row.totalAmount),
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string,
      };
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Apmokėjimas sėkmingas
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-3">
            Dėkojame už Jūsų užsakymą!
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Jūsų mokėjimas per <strong>SEB banką</strong> sėkmingai patvirtintas ir užsakymas perduotas ruošimui.
          </p>
        </div>

        {/* Order details badge */}
        {order && (
          <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-200 text-sm space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200 font-semibold">
              <span>Užsakymo numeris:</span>
              <span className="font-mono text-stone-900 text-base">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Gavėjas:</span>
              <span className="font-medium text-stone-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>El. paštas:</span>
              <span className="font-medium text-stone-900">{order.customerEmail}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Pristatymo adresas:</span>
              <span className="font-medium text-stone-900">{order.shippingAddress}, {order.city}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>SEB Tranzakcijos ID:</span>
              <span className="font-mono text-emerald-700 text-xs">{paymentId || order.sebTransactionId || "SEB-OK"}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-200 font-bold text-base text-stone-900">
              <span>Apmokėta suma:</span>
              <span className="text-emerald-700">{order.totalAmount.toFixed(2)} €</span>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition shadow-md"
          >
            <span>Grįžti į parduotuvę</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-sm font-semibold transition"
          >
            <Package className="w-4 h-4" />
            <span>Peržiūrėti užsakymą Admin pultelyje</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
