import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";

test("slaptažodis saugomas kaip hash ir tikrinamas", () => {
  const stored = hashPassword("labai-ilgas-slaptazodis");
  assert.equal(stored.split(".").length, 6);
  assert.ok(!stored.includes("labai-ilgas-slaptazodis"), "atviro teksto neturi likti");
  assert.ok(!stored.includes("$"), "be $ – kad tiktų .env failui");
  assert.equal(verifyPassword("labai-ilgas-slaptazodis", stored), true);
  assert.equal(verifyPassword("neteisingas", stored), false);
});

test("tas pats slaptažodis kaskart gauna kitą druską", () => {
  assert.notEqual(hashPassword("vienodas-slaptazodis"), hashPassword("vienodas-slaptazodis"));
});

test("sugadintas hash nepriima jokio slaptažodžio", () => {
  assert.equal(verifyPassword("bet-kas", "scrypt.16384.8.1.x"), false);
  assert.equal(verifyPassword("bet-kas", ""), false);
  assert.equal(verifyPassword("bet-kas", "md5.abc"), false);
});
