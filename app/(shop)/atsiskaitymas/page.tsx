import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { shopConfig } from "@/lib/db";

export const metadata: Metadata = { title: "Atsiskaitymas" };

export default function CheckoutPage() {
  const shop = shopConfig();
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <h1 className="font-serif text-5xl">Atsiskaitymas</h1>
      <p className="mt-3 max-w-xl text-muted">Užpildykite duomenis. Toliau patvirtinsite mokėjimą SEB.</p>
      <CheckoutForm freeShippingCents={shop.freeShippingCents} />
    </div>
  );
}
