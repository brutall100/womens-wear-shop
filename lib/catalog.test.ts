import assert from "node:assert/strict";
import test from "node:test";
import { categoriesOf, featuredCategories, queryProducts } from "./catalog.ts";
import type { Product } from "./types";

let next = 0;
function product(overrides: Partial<Product>): Product {
  next += 1;
  return {
    id: `p${next}`,
    slug: `preke-${next}`,
    name: `Prekė ${next}`,
    description: "",
    priceCents: 1000 * next,
    category: "Suknelės",
    sizes: ["M"],
    stock: 1,
    published: true,
    images: [],
    createdAt: `2026-09-0${next}T09:00:00.000Z`,
    updatedAt: `2026-09-0${next}T09:00:00.000Z`,
    ...overrides,
  };
}

const list = [
  product({ name: "Suknelė „Lina“", category: "Suknelės", priceCents: 12900 }),
  product({ name: "Paltas „Rūkas“", category: "Paltai", priceCents: 18900 }),
  product({ name: "Striukė „Šiaurė“", category: "Striukės", priceCents: 14900 }),
  product({ name: "Šalikas", category: "Šalikai", priceCents: 2900, published: false }),
];

test("paieška nekreipia dėmesio į didžiąsias raides ir lietuviškas raides", () => {
  assert.deepEqual(
    queryProducts(list, { q: "SUKNELE" }).map((item) => item.name),
    ["Suknelė „Lina“"],
  );
  assert.equal(queryProducts(list, { q: "siaure" }).length, 1);
});

test("paslėptos prekės nerodomos pirkėjoms", () => {
  assert.equal(queryProducts(list, { publishedOnly: true }).length, 3);
  assert.equal(queryProducts(list).length, 4);
});

test("rikiavimas pagal kainą ir naujausias pirmas", () => {
  assert.deepEqual(
    queryProducts(list, { publishedOnly: true, sort: "kaina-asc" }).map((item) => item.priceCents),
    [12900, 14900, 18900],
  );
  assert.equal(queryProducts(list, { publishedOnly: true })[0]?.name, "Striukė „Šiaurė“");
});

test("kategorijos rikiuojamos lietuviškai (Š po S)", () => {
  const all = [...list, product({ category: "Šalikai" })];
  assert.deepEqual(categoriesOf(all), ["Paltai", "Striukės", "Suknelės", "Šalikai"]);
});

test("meniu rodo gausiausias kategorijas", () => {
  const all = [...list, product({ category: "Suknelės" })];
  assert.deepEqual(featuredCategories(all, 2), ["Suknelės", "Paltai"]);
});
