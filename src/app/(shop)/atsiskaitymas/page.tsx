import type { Metadata } from "next";
import { shopConfig } from "@/lib/config";
import { getSebConfig } from "@/lib/payments/seb";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Atsiskaitymas" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow">Paskutinis žingsnis</p>
      <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">Atsiskaitymas</h1>
      <div className="mt-8">
        <CheckoutForm shipping={shopConfig.shipping} demoMode={getSebConfig() === null} />
      </div>
    </div>
  );
}
