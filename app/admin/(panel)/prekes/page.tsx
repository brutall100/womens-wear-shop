import { ProductsView } from "@/components/admin/products-view";
import { listProducts } from "@/lib/db";

export default function ProductsPage() {
  return <ProductsView products={listProducts()} />;
}
