import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { listProducts } from "@/lib/db";

export default function NewProductPage() {
  const categories = [...new Set(listProducts().map((product) => product.category))];
  return (
    <div>
      <Link href="/admin/prekes" className="text-sm underline">
        Visos prekės
      </Link>
      <h1 className="mt-3 font-serif text-5xl">Nauja prekė</h1>
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
