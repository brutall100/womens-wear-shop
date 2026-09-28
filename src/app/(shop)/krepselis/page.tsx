import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Krepšelis" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow">Jūsų pasirinkimas</p>
      <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">Krepšelis</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
