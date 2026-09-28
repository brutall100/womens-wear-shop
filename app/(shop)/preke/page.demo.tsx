import type { Metadata } from "next";
import { DemoProduct } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Prekė" };

/** Demo product page: /preke/?p=<slug>, so products added in the browser work too. */
export default function DemoProductPage() {
  return <DemoProduct />;
}
