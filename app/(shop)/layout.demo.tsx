import type { ReactNode } from "react";
import { DemoShopFrame } from "@/components/demo/demo-shop";

export default function DemoShopLayout({ children }: { children: ReactNode }) {
  return <DemoShopFrame>{children}</DemoShopFrame>;
}
