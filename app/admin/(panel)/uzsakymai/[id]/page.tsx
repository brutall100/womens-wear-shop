import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/admin/orders-view";
import { getOrder } from "@/lib/db";

export default async function OrderAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  return <OrderDetailView order={order} />;
}
