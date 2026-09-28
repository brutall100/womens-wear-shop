import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/views/order-view";
import { getOrderByStamp } from "@/lib/db";

export const metadata: Metadata = { title: "Užsakymas", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ stamp: string }>;
  searchParams: Promise<{ klaida?: string }>;
}) {
  const { stamp } = await params;
  const { klaida } = await searchParams;
  const order = getOrderByStamp(stamp);
  if (!order) notFound();
  return <OrderView order={order} error={klaida} />;
}
