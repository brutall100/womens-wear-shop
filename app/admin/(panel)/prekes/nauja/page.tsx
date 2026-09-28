import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { categoriesOf } from "@/lib/catalog";
import { listProducts } from "@/lib/db";
import { routes } from "@/lib/routes";

export default function NewProductPage() {
  return (
    <div>
      <Link href={routes.adminProducts} className="link text-sm">
        ← Visos prekės
      </Link>
      <h1 className="mt-4 text-5xl">Nauja prekė</h1>
      <ProductForm product={null} categories={categoriesOf(listProducts())} />
    </div>
  );
}
