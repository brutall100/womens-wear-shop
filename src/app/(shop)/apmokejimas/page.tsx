import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";
import { shippingMethods, store } from "@/config/store";

export const metadata: Metadata = { title: "Apmokėjimas" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="mb-10 font-serif text-5xl">Apmokėjimas</h1>
      <CheckoutForm shippingMethods={shippingMethods} freeShippingFrom={store.freeShippingFrom} />
    </div>
  );
}
