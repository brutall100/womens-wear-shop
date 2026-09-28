import assert from "node:assert/strict";
import test from "node:test";
import { MAX_QTY, planCheckout } from "./checkout.ts";
import type { Product } from "./types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "paltas-rukas",
    name: "Paltas „Rūkas“",
    description: "Paltas",
    priceCents: 18900,
    category: "Paltai",
    sizes: ["S", "M"],
    stock: 5,
    published: true,
    images: [],
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
    ...overrides,
  };
}

const finder = (list: Product[]) => (id: string) => list.find((item) => item.id === id) ?? null;

const buyer = {
  name: "Alex Doe",
  email: "alex@example.com",
  phone: "+370 600 00000",
  address: "Gedimino g. 1",
  city: "Vilnius",
  postal: "01100",
  deliveryId: "lp",
};

test("kaina imama iš prekių sąrašo, ne iš naršyklės", () => {
  const plan = planCheckout({ ...buyer, items: [{ productId: "p1", size: "M", qty: 2, priceCents: 1 }] }, finder([product()]), 15000);
  assert.ok(!("error" in plan));
  assert.equal(plan.amounts.subtotalCents, 37800);
  assert.equal(plan.amounts.deliveryCents, 0, "nuo 150 € pristatymas nemokamas");
  assert.equal(plan.amounts.amountCents, 37800);
});

test("pristatymas skaičiuojamas, kol suma mažesnė už ribą", () => {
  const plan = planCheckout({ ...buyer, items: [{ productId: "p1", size: "S", qty: 1 }] }, finder([product({ priceCents: 5900 })]), 15000);
  assert.ok(!("error" in plan));
  assert.equal(plan.amounts.deliveryCents, 349);
  assert.equal(plan.amounts.amountCents, 6249);
});

test("likutis skaičiuojamas visiems dydžiams kartu", () => {
  const plan = planCheckout(
    {
      ...buyer,
      items: [
        { productId: "p1", size: "S", qty: 2 },
        { productId: "p1", size: "M", qty: 2 },
      ],
    },
    finder([product({ stock: 3 })]),
    15000,
  );
  assert.ok("error" in plan);
  assert.match(plan.error, /likutis/);
});

test("vieno dydžio kiekis ribojamas", () => {
  const plan = planCheckout({ ...buyer, items: [{ productId: "p1", size: "S", qty: MAX_QTY + 1 }] }, finder([product({ stock: 50 })]), 15000);
  assert.ok("error" in plan);
});

test("atsiėmimui adreso nereikia, o įvestas adresas neišsaugomas", () => {
  const plan = planCheckout(
    { ...buyer, deliveryId: "shop", address: "", city: "", postal: "", items: [{ productId: "p1", size: "S", qty: 1 }] },
    finder([product({ priceCents: 5900 })]),
    15000,
  );
  assert.ok(!("error" in plan));
  assert.equal(plan.customer.address, "");
  assert.equal(plan.amounts.deliveryCents, 0);
});

test("netinkamas dydis, paslėpta prekė ir tuščias krepšelis atmetami", () => {
  const list = [product(), product({ id: "p2", published: false })];
  assert.ok("error" in planCheckout({ ...buyer, items: [{ productId: "p1", size: "XL", qty: 1 }] }, finder(list), 15000));
  assert.ok("error" in planCheckout({ ...buyer, items: [{ productId: "p2", size: "S", qty: 1 }] }, finder(list), 15000));
  assert.ok("error" in planCheckout({ ...buyer, items: [] }, finder(list), 15000));
  assert.ok("error" in planCheckout({ ...buyer, email: "ne-el-pastas", items: [{ productId: "p1", size: "S", qty: 1 }] }, finder(list), 15000));
});
