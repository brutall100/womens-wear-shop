import type { ProductInput } from "./types";
import { parseEuroToCents } from "./money";

export function parseProduct(body: unknown): ProductInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Neteisinga užklausa." };
  const data = body as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const description = String(data.description ?? "").trim();
  const category = String(data.category ?? "").trim();
  const price = parseEuroToCents(String(data.price ?? ""));
  const stock = Number(data.stock);
  const sizes = Array.isArray(data.sizes) ? data.sizes.map((size) => String(size).trim()).filter(Boolean) : [];
  if (name.length < 2 || name.length > 120) return { error: "Įrašykite prekės pavadinimą." };
  if (description.length < 1 || description.length > 4000) return { error: "Įrašykite aprašymą." };
  if (category.length < 2 || category.length > 40) return { error: "Įrašykite kategoriją." };
  if (price === null || price <= 0 || price > 10000000) return { error: "Kaina turi būti didesnė už nulį." };
  if (!Number.isInteger(stock) || stock < 0 || stock > 9999) return { error: "Likutis turi būti sveikas skaičius." };
  if (sizes.length === 0 || sizes.some((size) => size.length > 12)) return { error: "Pasirinkite bent vieną dydį." };
  return {
    name,
    description,
    category,
    priceCents: price,
    stock,
    sizes: [...new Set(sizes)],
    published: Boolean(data.published),
  };
}
