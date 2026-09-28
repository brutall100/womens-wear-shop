import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listProducts, sortOptions } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";

export async function generateMetadata(props: PageProps<"/kategorija/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category?.name ?? "Kategorija" };
}

export default async function CategoryPage(props: PageProps<"/kategorija/[slug]">) {
  const { slug } = await props.params;
  const { rikiuoti } = await props.searchParams;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await listProducts(
    { categoryId: category.id },
    typeof rikiuoti === "string" ? rikiuoti : undefined,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <nav className="mb-4 text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Pradžia
        </Link>{" "}
        /{" "}
        <Link href="/parduotuve" className="hover:text-ink">
          Prekės
        </Link>{" "}
        / <span className="text-ink">{category.name}</span>
      </nav>
      <div className="mb-10 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-5xl">{category.name}</h1>
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
