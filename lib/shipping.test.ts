import assert from "node:assert/strict";
import test from "node:test";
import { centsToInput, parseEuroToCents, plural, slugify } from "./money.ts";
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
  assert.equal(slugify("Striukė „Šiaurė“"), "striuke-siaure");
  assert.equal(centsToInput(18900), "189,00");
});

test("lietuviškos daugiskaitos formos", () => {
  const forms: [string, string, string] = ["modelis", "modeliai", "modelių"];
  assert.equal(plural(1, forms), "modelis");
  assert.equal(plural(21, forms), "modelis");
  assert.equal(plural(2, forms), "modeliai");
  assert.equal(plural(8, forms), "modeliai");
  assert.equal(plural(10, forms), "modelių");
  assert.equal(plural(11, forms), "modelių");
  assert.equal(plural(15, forms), "modelių");
  assert.equal(plural(0, forms), "modelių");
});
