import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { ERROR_MESSAGES } from "@/lib/labels";
import { shopConfig } from "@/lib/db";

export const metadata: Metadata = { title: "Krepšelis" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ klaida?: string }> }) {
  const { klaida } = await searchParams;
  const message = klaida ? ERROR_MESSAGES[klaida] : "";
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Jūsų pasirinkimai</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Krepšelis</h1>
      {message ? (
        <p role="alert" className="notice notice--danger mt-6 max-w-2xl">
          {message}
        </p>
      ) : null}
      <CartView freeShippingCents={shopConfig().freeShippingCents} />
    </div>
  );
}
