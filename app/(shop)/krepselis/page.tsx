import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Krepšelis" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <h1 className="font-serif text-5xl">Krepšelis</h1>
      <CartView />
    </div>
  );
}
