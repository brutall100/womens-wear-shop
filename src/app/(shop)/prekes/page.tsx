import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Visos prekės" };

const SORT_OPTIONS: Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }> = {
  naujausios: { label: "Naujausios", orderBy: { createdAt: "desc" } },
  "kaina-didejimo": { label: "Kaina: nuo mažiausios", orderBy: { priceCents: "asc" } },
  "kaina-mazejimo": { label: "Kaina: nuo didžiausios", orderBy: { priceCents: "desc" } },
  pavadinimas: { label: "Pavadinimas A–Z", orderBy: { name: "asc" } },
};

export default async function ProductsPage({ searchParams }: PageProps<"/prekes">) {
  const sp = await searchParams;
  const categorySlug = typeof sp.kategorija === "string" ? sp.kategorija : undefined;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const sortKey = typeof sp.rikiuoti === "string" && sp.rikiuoti in SORT_OPTIONS ? sp.rikiuoti : "naujausios";

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (categorySlug) where.category = { slug: categorySlug };
  if (query) where.name = { contains: query };

  const [products, categories, activeCategory] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_OPTIONS[sortKey].orderBy,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        variants: { select: { stock: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      where: { products: { some: { isActive: true } } },
    }),
    categorySlug ? prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
  ]);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { kategorija: categorySlug, q: query || undefined, rikiuoti: sortKey, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v && !(k === "rikiuoti" && v === "naujausios")) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/prekes?${qs}` : "/prekes";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Katalogas</p>
          <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">
            {activeCategory?.name ?? (query ? `Paieška: „${query}“` : "Visos prekės")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {products.length} {products.length === 1 ? "prekė" : products.length < 10 ? "prekės" : "prekių"}
          </p>
        </div>

        <form action="/prekes" className="flex w-full max-w-md gap-2 lg:w-auto">
          {categorySlug && <input type="hidden" name="kategorija" value={categorySlug} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Ieškoti prekių…"
            className="input"
            aria-label="Paieška"
          />
          <button type="submit" className="btn-primary shrink-0">Ieškoti</button>
        </form>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-y border-ink/10 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <Link
            href={buildHref({ kategorija: undefined })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              !categorySlug ? "bg-ink text-cream" : "bg-white text-ink-soft hover:bg-cream-dark"
            }`}
          >
            Visos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildHref({ kategorija: c.slug })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                categorySlug === c.slug ? "bg-ink text-cream" : "bg-white text-ink-soft hover:bg-cream-dark"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Rikiuoti:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
              <Link
                key={key}
                href={buildHref({ rikiuoti: key })}
                className={`rounded-full px-3 py-1.5 transition ${
                  sortKey === key ? "bg-cream-dark text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-display text-2xl">Prekių nerasta</p>
          <p className="mt-2 text-sm text-ink-soft">Pabandykite kitą kategoriją ar paieškos žodį.</p>
          <Link href="/prekes" className="btn-outline mt-6">Rodyti visas prekes</Link>
        </div>
      )}
    </div>
  );
}
