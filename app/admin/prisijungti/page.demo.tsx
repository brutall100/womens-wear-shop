import type { Metadata } from "next";
import { DemoLogin } from "@/components/demo/demo-admin";

export const metadata: Metadata = { title: "Prisijungimas" };

export default function DemoLoginPage() {
  return <DemoLogin />;
}
