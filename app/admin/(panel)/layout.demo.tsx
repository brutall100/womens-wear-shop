import type { ReactNode } from "react";
import { DemoAdminGate } from "@/components/demo/demo-admin";

export default function DemoPanelLayout({ children }: { children: ReactNode }) {
  return <DemoAdminGate>{children}</DemoAdminGate>;
}
