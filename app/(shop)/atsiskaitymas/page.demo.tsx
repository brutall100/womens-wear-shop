import type { Metadata } from "next";
import { DemoCheckout } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Atsiskaitymas" };

export default function DemoCheckoutPage() {
  return <DemoCheckout />;
}
