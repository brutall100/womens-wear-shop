import type { Metadata } from "next";
import Link from "next/link";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { ProductGrid } from "@/components/shop/product-card";
import { prisma } from "@/lib/prisma";
import { getCatalogProducts } from "@/lib/queries";
import { SIZES } from "@/lib/site";
import { cn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parduotuvė",
  description: "Moteriški drabužiai – suknelės, palaidinės, sijonai, kelnės.",
};

type SearchParams = Promise<{
  kategorija?: string;
  paieska?: string;
  rikiuoti?: string;
  dydis?: string;
}>;

function buildHref(
  current: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/parduotuve?${query}` : "/parduotuve";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const current = {
    kategorija: params.kategorija,
    paieska: params.paieska,
    rikiuoti: params.rikiuoti,
    dydis: params.dydis,
  };

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    getCatalogProducts({
      categorySlug: params.kategorija,
      search: params.paieska,
      sort: params.rikiuoti,
      size: params.dydis,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.kategorija);
  const hasFilters = Boolean(params.kategorija || params.paieska || params.dydis);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 text-xs text-muted" aria-label="Naršymo kelias">
        <Link href="/" className="hover:text-ink">
          Pradžia
        </Link>
        <span className="mx-2">/</span>
        <Link href="/parduotuve" className="hover:text-ink">
          Parduotuvė
        </Link>
        {activeCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-ink">{activeCategory.name}</span>
          </>
        )}
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl">{activeCategory ? activeCategory.name : "Visos prekės"}</h1>
        {params.paieska && (
          <p className="mt-2 text-sm text-muted">
            Paieškos rezultatai: „{params.paieska}“
          </p>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <section>
            <h2 className="eyebrow">Kategorijos</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={buildHref(current, { kategorija: undefined })}
                  className={cn(
                    "hover:text-ink",
                    params.kategorija ? "text-muted" : "text-ink",
                  )}
                >
                  Visos prekės
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={buildHref(current, { kategorija: category.slug })}
                    className={cn(
                      "flex items-baseline justify-between gap-2 hover:text-ink",
                      params.kategorija === category.slug ? "text-ink" : "text-muted",
                    )}
                  >
                    <span>{category.name}</span>
                    <span className="text-[11px] text-muted">
                      {category._count.products}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="eyebrow">Dydis</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <Link
                  key={size}
                  href={buildHref(current, {
                    dydis: params.dydis === size ? undefined : size,
                  })}
                  className={cn(
                    "border px-3 py-1.5 text-xs transition-colors",
                    params.dydis === size
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-shell text-muted hover:border-ink hover:text-ink",
                  )}
                >
                  {size}
                </Link>
              ))}
            </div>
          </section>

          {hasFilters && (
            <Link
              href="/parduotuve"
              className="mt-8 inline-block text-xs text-clay link-underline"
            >
              Išvalyti filtrus
            </Link>
          )}
        </aside>

        <div>
          <CatalogToolbar
            total={products.length}
            sort={params.rikiuoti ?? "naujausios"}
            search={params.paieska ?? ""}
          />

          <div className="mt-8">
            {products.length === 0 ? (
              <div className="border border-line bg-shell px-6 py-20 text-center">
                <p className="text-lg">Pagal pasirinktus filtrus prekių nerasta</p>
                <p className="mt-2 text-sm text-muted">
                  Pabandykite pakeisti kategoriją arba dydį.
                </p>
                <Link href="/parduotuve" className="mt-6 inline-block text-sm text-clay link-underline">
                  Rodyti visas prekes
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} columns={3} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
