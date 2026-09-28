import type { Metadata } from "next";
import { CatalogView } from "@/components/views/catalog-view";
import { countByCategory } from "@/lib/catalog";
import { listCategories, listProducts } from "@/lib/db";

export const metadata: Metadata = { title: "Katalogas" };

type Search = Promise<{ q?: string; kategorija?: string; rikiuoti?: string }>;

export default async function CatalogPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const filters = { category: params.kategorija ?? "", q: params.q ?? "", sort: params.rikiuoti ?? "" };
  const products = listProducts({ publishedOnly: true, category: filters.category || undefined, q: filters.q, sort: filters.sort });
  return (
    <CatalogView
      products={products}
      categories={listCategories()}
      counts={countByCategory(listProducts({ publishedOnly: true }))}
      filters={filters}
    />
  );
}
