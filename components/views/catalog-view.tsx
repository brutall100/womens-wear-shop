import Form from "next/form";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SearchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SORT_OPTIONS } from "@/lib/catalog";
import { plural } from "@/lib/money";
import { routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

export type CatalogFilters = { category: string; q: string; sort: string };

export function CatalogView({
  products,
  categories,
  counts,
  filters,
}: {
  products: Product[];
  categories: string[];
  counts: Record<string, number>;
  filters: CatalogFilters;
}) {
  const { category, q, sort } = filters;
  const filtered = Boolean(category || q || sort);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{category || "Visa kolekcija"}</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">Katalogas</h1>
        </div>
        <p className="text-muted" aria-live="polite">
          {products.length} {plural(products.length, ["prekė", "prekės", "prekių"])}
        </p>
      </div>

      <nav aria-label="Kategorijos" className="mt-8">
        <ul className="flex flex-wrap gap-2.5">
          <li>
            <Link href={routes.catalog} className="chip" aria-current={!category ? "page" : undefined}>
              Visos
            </Link>
          </li>
          {categories.map((item) => (
            <li key={item}>
              <Link href={routes.category(item)} className="chip" aria-current={category === item ? "page" : undefined}>
                {item}
                <span className="chip__count">{counts[item] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Form action={routes.catalog} className="panel mt-6 flex flex-wrap items-end gap-3 p-4" role="search">
        {category ? <input type="hidden" name="kategorija" value={category} /> : null}
        <div className="field min-w-0 flex-1 basis-56">
          <label htmlFor="q" className="label">
            Paieška
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Pvz., suknelė" className="input" />
        </div>
        <div className="field basis-48">
          <label htmlFor="rikiuoti" className="label">
            Rikiuoti
          </label>
          <select id="rikiuoti" name="rikiuoti" defaultValue={sort} className="select">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          <SearchIcon size={18} />
          Taikyti
        </button>
        {filtered ? (
          <Link href={routes.catalog} className="btn btn-quiet">
            Išvalyti
          </Link>
        ) : null}
      </Form>

      {products.length === 0 ? (
        <div className="pattern-card mt-12 max-w-2xl">
          <h2 className="text-3xl">Nieko neradome</h2>
          <p className="mt-3 text-muted">Pagal šią paiešką prekių nėra. Pabandykite kitą žodį arba kategoriją.</p>
          <Link href={routes.catalog} className="btn btn-ghost mt-6">
            Rodyti visas prekes
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <div key={product.id} data-reveal style={{ "--reveal-delay": `${(index % 4) * 80}ms` } as CSSProperties}>
              <ProductCard product={product} heading="h2" priority={index < 2} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
