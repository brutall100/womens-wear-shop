import type { Metadata } from "next";
import { DemoBank } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Bandomasis bankas", robots: { index: false } };

export default function DemoBankPage() {
  return <DemoBank />;
}
