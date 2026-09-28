import type { Metadata } from "next";
import { DemoCart } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Krepšelis" };

export default function DemoCartPage() {
  return <DemoCart />;
}
