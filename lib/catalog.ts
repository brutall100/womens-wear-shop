import type { CatalogQuery, Product } from "./types";

export const SORT_OPTIONS = [
  { value: "", label: "Naujausios" },
  { value: "kaina-asc", label: "Kaina didėjančiai" },
  { value: "kaina-desc", label: "Kaina mažėjančiai" },
  { value: "vardas", label: "Pagal pavadinimą" },
] as const;

const collator = new Intl.Collator("lt", { sensitivity: "base" });

function normalize(text: string): string {
  return text.toLocaleLowerCase("lt").normalize("NFD").replace(/\p{M}/gu, "");
}

export function matchesQuery(product: Product, q: string): boolean {
  const term = normalize(q.trim());
  if (!term) return true;
  return [product.name, product.description, product.category].some((field) => normalize(field).includes(term));
}

export function sortProducts(products: Product[], sort = ""): Product[] {
  const list = [...products];
  if (sort === "kaina-asc") return list.sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "kaina-desc") return list.sort((a, b) => b.priceCents - a.priceCents);
  if (sort === "vardas") return list.sort((a, b) => collator.compare(a.name, b.name));
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Filters and sorts products the same way in the server shop and in the browser demo. */
export function queryProducts(products: Product[], query: CatalogQuery = {}): Product[] {
  const filtered = products.filter(
    (product) =>
      (!query.publishedOnly || product.published) &&
      (!query.category || product.category === query.category) &&
      matchesQuery(product, query.q ?? ""),
  );
  return sortProducts(filtered, query.sort);
}

export function categoriesOf(products: Product[]): string[] {
  const names = new Set(products.filter((product) => product.published).map((product) => product.category));
  return [...names].sort(collator.compare);
}

export function countByCategory(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    if (product.published) counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}

/** Categories with the most products, for the header. */
export function featuredCategories(products: Product[], limit = 3): string[] {
  const counts = countByCategory(products);
  return Object.keys(counts)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || collator.compare(a, b))
    .slice(0, limit);
}
