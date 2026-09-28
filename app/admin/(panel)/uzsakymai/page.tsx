import { OrdersView } from "@/components/admin/orders-view";
import { listOrders } from "@/lib/db";

export default function OrdersPage() {
  return <OrdersView orders={listOrders()} />;
}
