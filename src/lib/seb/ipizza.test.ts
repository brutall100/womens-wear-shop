import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { test } from "node:test";
import {
  MAC_FIELDS,
  buildMacSource,
  buildPaymentRequest,
  formatVkDateTime,
  referenceWithCheckDigit,
  signMac,
  verifyBankResponse,
  verifyMac,
} from "./ipizza";
import type { SebConfig } from "./config";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const config: SebConfig = {
  mode: "mock",
  senderId: "testvendor",
  receiverId: "SEB",
  paymentUrl: "https://bankas.example/pay",
  algorithm: "sha1",
  language: "LIT",
  appUrl: "https://parduotuve.example",
  macLengthMode: "chars",
};

test("MAC eilutė sudaroma su trijų skaitmenų ilgio prefiksais", () => {
  const source = buildMacSource(
    { VK_SERVICE: "1012", VK_VERSION: "008" },
    ["VK_SERVICE", "VK_VERSION"],
  );
  assert.equal(source, "0041012003008");
});

test("tuščias laukas įrašomas kaip 000", () => {
  const source = buildMacSource({ VK_REF: "" }, ["VK_REF"]);
  assert.equal(source, "000");
});

test("lietuviškos raidės skaičiuojamos kaip simboliai, o ne baitai", () => {
  assert.equal(buildMacSource({ VK_MSG: "Užsakymas" }, ["VK_MSG"], "chars"), "009Užsakymas");
  assert.equal(buildMacSource({ VK_MSG: "Užsakymas" }, ["VK_MSG"], "bytes"), "010Užsakymas");
});

test("parašas sukuriamas ir patikrinamas", () => {
  const source = buildMacSource({ VK_AMOUNT: "49.90" }, ["VK_AMOUNT"]);
  const signature = signMac(source, privateKey, "sha1");
  assert.equal(verifyMac(source, signature, publicKey, "sha1"), true);
});

test("pakeistas duomuo parašo patikros nepraeina", () => {
  const signature = signMac(
    buildMacSource({ VK_AMOUNT: "49.90" }, ["VK_AMOUNT"]),
    privateKey,
    "sha1",
  );
  const tampered = buildMacSource({ VK_AMOUNT: "0.10" }, ["VK_AMOUNT"]);
  assert.equal(verifyMac(tampered, signature, publicKey, "sha1"), false);
});

test("mokėjimo užklausoje yra visi privalomi VK_ laukai", () => {
  const request = buildPaymentRequest({
    config,
    privateKeyPem: privateKey,
    stamp: "1735293600012",
    amountCents: 8900,
    reference: "202600011",
    message: "Užsakymas LT-2026-0001",
    returnUrl: "https://parduotuve.example/grizimas",
    cancelUrl: "https://parduotuve.example/grizimas",
  });

  for (const field of MAC_FIELDS["1012"]) {
    assert.ok(request.fields[field] !== undefined, `trūksta lauko ${field}`);
  }
  assert.equal(request.fields.VK_AMOUNT, "89.00");
  assert.equal(request.fields.VK_CURR, "EUR");
  assert.equal(request.fields.VK_LANG, "LIT");
  assert.equal(request.fields.VK_ENCODING, "UTF-8");
  assert.ok(request.fields.VK_MAC.length > 100);
});

test("banko atsakymo parašas patikrinamas pagal VK_SERVICE", () => {
  const response: Record<string, string> = {
    VK_SERVICE: "1111",
    VK_VERSION: "008",
    VK_SND_ID: "SEB",
    VK_REC_ID: "testvendor",
    VK_STAMP: "1735293600012",
    VK_T_NO: "123456",
    VK_AMOUNT: "89.00",
    VK_CURR: "EUR",
    VK_REC_ACC: "LT007044000000000000",
    VK_REC_NAME: "MB Vėja",
    VK_SND_ACC: "LT123456789012345678",
    VK_SND_NAME: "Vardenė Pavardenė",
    VK_REF: "202600011",
    VK_MSG: "Užsakymas LT-2026-0001",
    VK_T_DATETIME: formatVkDateTime(),
  };
  response.VK_MAC = signMac(
    buildMacSource(response, MAC_FIELDS["1111"]),
    privateKey,
    "sha1",
  );

  assert.equal(verifyBankResponse(response, publicKey, "sha1"), true);

  response.VK_AMOUNT = "0.10";
  assert.equal(verifyBankResponse(response, publicKey, "sha1"), false);
});

test("mokėjimo nuorodos kontrolinis skaitmuo (7-3-1)", () => {
  assert.equal(referenceWithCheckDigit("1234"), "12344");
  assert.equal(referenceWithCheckDigit("20260001"), "202600017");
  // Nesskaitiniai simboliai praleidžiami – užsakymo numeris tampa nuoroda
  assert.equal(referenceWithCheckDigit("LT-2026-0042"), "202600428");
});

test("VK_DATETIME atitinka ISO 8601 su laiko juosta", () => {
  assert.match(formatVkDateTime(new Date("2026-09-28T13:50:00Z")), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/);
});
