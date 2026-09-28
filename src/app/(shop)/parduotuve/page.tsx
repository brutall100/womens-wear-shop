import type { Metadata } from "next";
import { Suspense } from "react";
import { listProducts, sortOptions } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";

export const metadata: Metadata = { title: "Visos prekės" };

export default async function AllProductsPage(props: PageProps<"/parduotuve">) {
  const { rikiuoti, paieska } = await props.searchParams;
  const query = typeof paieska === "string" ? paieska.trim() : "";
  const products = await listProducts(
    query ? { OR: [{ name: { contains: query } }, { description: { contains: query } }] } : {},
    typeof rikiuoti === "string" ? rikiuoti : undefined,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-5xl">{query ? `Paieška: „${query}“` : "Visos prekės"}</h1>
          <p className="mt-2 text-sm text-muted">{products.length} prekės</p>
        </div>
        <Suspense>
          <SortSelect options={sortOptions} />
        </Suspense>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
