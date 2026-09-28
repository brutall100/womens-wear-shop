import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, PhoneCall } from "lucide-react";

export default async function OrderCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; paymentId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-12 h-12" />
      </div>

      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Mokėjimas atšauktas
        </h1>
        <p className="text-stone-600 text-sm mt-2 max-w-md mx-auto">
          Mokėjimo procesas per SEB banką buvo nutrauktas. Jūsų banko sąskaita nebuvo nuskaičiuota.
        </p>
      </div>

      {orderId && (
        <p className="text-xs text-stone-400 font-mono">
          Užsakymo identifikatorius: {orderId}
        </p>
      )}

      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/atsiskaitymas"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Bandyti apmokėti iš naujo</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 text-stone-800 rounded-xl text-sm font-semibold hover:bg-stone-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grįžti į parduotuvę</span>
        </Link>
      </div>
    </div>
  );
}
