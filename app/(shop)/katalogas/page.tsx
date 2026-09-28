import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listCategories, listProducts } from "@/lib/db";

export const metadata: Metadata = { title: "Katalogas" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorija?: string; rikiuoti?: string }>;
}) {
  const params = await searchParams;
  const category = params.kategorija || "";
  const q = params.q || "";
  const sort = params.rikiuoti || "";
  const categories = listCategories();
  const products = listProducts({
    publishedOnly: true,
    category: category || undefined,
    q: q || undefined,
    sort,
  });

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <h1 className="font-serif text-5xl">Katalogas</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink href="/katalogas" active={!category}>
          Visos
        </FilterLink>
        {categories.map((item) => (
          <FilterLink
            key={item}
            href={`/katalogas?kategorija=${encodeURIComponent(item)}`}
            active={category === item}
          >
            {item}
          </FilterLink>
        ))}
      </div>
      <form className="mt-6 flex flex-wrap items-end gap-3" action="/katalogas">
        {category ? <input type="hidden" name="kategorija" value={category} /> : null}
        <div>
          <label htmlFor="q" className="text-sm">
            Paieška
          </label>
          <input id="q" name="q" defaultValue={q} className="mt-1 block h-11 w-64 max-w-full border border-line bg-card px-3" />
        </div>
        <div>
          <label htmlFor="rikiuoti" className="text-sm">
            Rikiuoti
          </label>
          <select id="rikiuoti" name="rikiuoti" defaultValue={sort} className="mt-1 block h-11 border border-line bg-card px-3">
            <option value="">Naujausios</option>
            <option value="kaina-asc">Kaina didėjančiai</option>
            <option value="kaina-desc">Kaina mažėjančiai</option>
            <option value="vardas">Pagal pavadinimą</option>
          </select>
        </div>
        <button type="submit" className="h-11 border border-ink px-4 text-sm">
          Taikyti
        </button>
      </form>
      {products.length === 0 ? (
        <p className="mt-12 border border-line bg-card p-8">
          Pagal šią paiešką prekių nėra.{" "}
          <Link href="/katalogas" className="underline">
            Rodyti visas
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-11 items-center border px-4 text-sm ${active ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
    >
      {children}
    </Link>
  );
}
