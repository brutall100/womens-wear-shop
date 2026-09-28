import assert from "node:assert/strict";
import test from "node:test";
import {
  REQUEST_1012,
  RESPONSE_1111,
  fieldsForMac,
  formatBankAmount,
  generateRsaPem,
  macString,
  parseBankAmount,
  sepaText,
  signMac,
  verifyMac,
} from "./seb.ts";

test("MAC eilutė Lietuvai atitinka v009 laukų tvarką", () => {
  const values = fieldsForMac(
    {
      VK_SERVICE: "1012",
      VK_VERSION: "009",
      VK_SND_ID: "TRADER",
      VK_STAMP: "1234567890",
      VK_AMOUNT: "1.99",
      VK_CURR: "EUR",
      VK_REF: "",
      VK_MSG: "Payment for a good XXXXXX",
      VK_RETURN: "https://testtest.lt/banklinkreturn.php",
      VK_CANCEL: "https://testtest.lt/banklinkcancel.php",
      VK_DATETIME: "2024-10-10T09:25:52+03:00",
    },
    REQUEST_1012,
  );

  assert.equal(
    macString(values),
    "0041012003009006TRADER01012345678900041.99003EUR000025Payment for a good XXXXXX038https://testtest.lt/banklinkreturn.php038https://testtest.lt/banklinkcancel.php0252024-10-10T09:25:52+03:00",
  );
});

test("parašas tikrinamas ir sugenda pakeitus sumą", () => {
  const keys = generateRsaPem();
  const packet: Record<string, string> = {
    VK_SERVICE: "1111",
    VK_VERSION: "009",
    VK_SND_ID: "SEBDEMO",
    VK_REC_ID: "MOTDEMO",
    VK_STAMP: "abc123",
    VK_T_NO: "1",
    VK_AMOUNT: "129.00",
    VK_CURR: "EUR",
    VK_REC_ACC: "",
    VK_REC_NAME: "MOT",
    VK_SND_ACC: "",
    VK_SND_NAME: "",
    VK_REF: "",
    VK_MSG: "MOT uzsakymas",
    VK_T_DATETIME: "2026-09-28T19:00:00+03:00",
  };
  const signature = signMac(fieldsForMac(packet, RESPONSE_1111), keys.privateKey);
  assert.equal(verifyMac(fieldsForMac(packet, RESPONSE_1111), signature, keys.publicKey), true);
  packet.VK_AMOUNT = "1.00";
  assert.equal(verifyMac(fieldsForMac(packet, RESPONSE_1111), signature, keys.publicKey), false);
});

test("suma ir paskirtis", () => {
  assert.equal(formatBankAmount(12900), "129.00");
  assert.equal(parseBankAmount("129.00"), 12900);
  assert.equal(parseBankAmount("129"), null);
  assert.equal(sepaText("Užsakymas Šiaurė"), "Uzsakymas Siaure");
});
