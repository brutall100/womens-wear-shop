import assert from "node:assert/strict";
import test from "node:test";
import { parseEuroToCents, slugify } from "./money.ts";
import { shippingCents } from "./shipping.ts";

test("pristatymas nemokamas nuo slenksčio ir atsiėmimui", () => {
  assert.equal(shippingCents(10000, 349, 15000), 349);
  assert.equal(shippingCents(15000, 349, 15000), 0);
  assert.equal(shippingCents(2000, 0, 15000), 0);
});

test("eurai į centus ir nuorodos pavadinimas", () => {
  assert.equal(parseEuroToCents("119,5"), 11950);
  assert.equal(parseEuroToCents("89.00"), 8900);
  assert.equal(parseEuroToCents("abc"), null);
  assert.equal(slugify("Suknelė „Saulė“"), "suknele-saule");
});
