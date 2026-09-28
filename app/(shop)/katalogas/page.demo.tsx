import type { Metadata } from "next";
import { DemoCatalog } from "@/components/demo/demo-shop";

export const metadata: Metadata = { title: "Katalogas" };

export default function DemoCatalogPage() {
  return <DemoCatalog />;
}
