import type { Metadata } from "next";
import { DemoOrder } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Užsakymas", robots: { index: false } };

export default function DemoOrderPage() {
  return <DemoOrder />;
}
