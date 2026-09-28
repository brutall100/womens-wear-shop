import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getActiveShippingMethods } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atsiskaitymas",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const methods = await getActiveShippingMethods();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl">Atsiskaitymas</h1>
      <p className="mt-2 text-sm text-muted">
        Užpildykite duomenis ir apmokėkite užsakymą SEB banke.
      </p>

      <div className="mt-8">
        <CheckoutForm
          methods={methods.map((method) => ({
            code: method.code,
            name: method.name,
            description: method.description,
            priceCents: method.priceCents,
            freeFromCents: method.freeFromCents,
          }))}
        />
      </div>
    </div>
  );
}
