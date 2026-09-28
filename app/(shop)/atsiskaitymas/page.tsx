import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { shopConfig } from "@/lib/db";

export const metadata: Metadata = { title: "Atsiskaitymas" };

export default function CheckoutPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Beveik viskas</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Atsiskaitymas</h1>
      <p className="mt-4 max-w-xl text-muted">Užpildykite duomenis. Toliau patvirtinsite mokėjimą SEB banke.</p>
      <CheckoutForm freeShippingCents={shopConfig().freeShippingCents} />
    </div>
  );
}
