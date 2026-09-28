import { createSign, createVerify, X509Certificate, KeyObject, createPublicKey } from "node:crypto";
import type { SebAlgorithm, SebConfig } from "@/lib/seb/config";

/**
 * IPIZZA 1.3 protokolo realizacija (SEB, Swedbank, Luminor banklink).
 *
 * MAC eilutė sudaroma sujungiant kiekvieno lauko reikšmę su 3 skaitmenų
 * ilgio prefiksu, laukų eilės tvarka priklauso nuo VK_SERVICE kodo.
 * Pvz. VK_SERVICE=1012 -> „0041012“ + …
 */

export type VkFields = Record<string, string>;

/** Laukų eilės tvarka MAC skaičiavimui pagal paslaugos kodą. */
export const MAC_FIELDS: Record<string, string[]> = {
  // Užklausa bankui – mokėjimo pavedimas
  "1012": [
    "VK_SERVICE",
    "VK_VERSION",
    "VK_SND_ID",
    "VK_STAMP",
    "VK_AMOUNT",
    "VK_CURR",
    "VK_REF",
    "VK_MSG",
    "VK_RETURN",
    "VK_CANCEL",
    "VK_DATETIME",
  ],
  // Sėkmingas atsakymas į 1012
  "1111": [
    "VK_SERVICE",
    "VK_VERSION",
    "VK_SND_ID",
    "VK_REC_ID",
    "VK_STAMP",
    "VK_T_NO",
    "VK_AMOUNT",
    "VK_CURR",
    "VK_REC_ACC",
    "VK_REC_NAME",
    "VK_SND_ACC",
    "VK_SND_NAME",
    "VK_REF",
    "VK_MSG",
    "VK_T_DATETIME",
  ],
  // Nesėkmingas / atšauktas mokėjimas
  "1911": [
    "VK_SERVICE",
    "VK_VERSION",
    "VK_SND_ID",
    "VK_REC_ID",
    "VK_STAMP",
    "VK_REF",
    "VK_MSG",
  ],
  // Senesnės 1002 užklausos atsakymai – palaikomi dėl suderinamumo
  "1101": [
    "VK_SERVICE",
    "VK_VERSION",
    "VK_SND_ID",
    "VK_REC_ID",
    "VK_STAMP",
    "VK_T_NO",
    "VK_AMOUNT",
    "VK_CURR",
    "VK_REC_ACC",
    "VK_REC_NAME",
    "VK_SND_ACC",
    "VK_SND_NAME",
    "VK_REF",
    "VK_MSG",
    "VK_T_DATE",
  ],
  "1901": [
    "VK_SERVICE",
    "VK_VERSION",
    "VK_SND_ID",
    "VK_REC_ID",
    "VK_STAMP",
    "VK_REF",
    "VK_MSG",
  ],
};

export const SUCCESS_SERVICES = new Set(["1101", "1111"]);
export const FAILURE_SERVICES = new Set(["1901", "1911"]);

function valueLength(value: string, mode: "chars" | "bytes"): number {
  return mode === "bytes"
    ? Buffer.byteLength(value, "utf8")
    : Array.from(value).length;
}

/** Sudaro pasirašomą MAC eilutę. */
export function buildMacSource(
  fields: VkFields,
  order: string[],
  macLengthMode: "chars" | "bytes" = "chars",
): string {
  return order
    .map((name) => {
      const value = fields[name] ?? "";
      const length = valueLength(value, macLengthMode);
      if (length > 999) {
        throw new Error(`Lauko ${name} reikšmė per ilga MAC skaičiavimui`);
      }
      return `${String(length).padStart(3, "0")}${value}`;
    })
    .join("");
}

function nodeAlgorithm(algorithm: SebAlgorithm): string {
  return algorithm === "sha256" ? "RSA-SHA256" : "RSA-SHA1";
}

export function signMac(
  source: string,
  privateKeyPem: string,
  algorithm: SebAlgorithm,
): string {
  const signer = createSign(nodeAlgorithm(algorithm));
  signer.update(source, "utf8");
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

function toPublicKey(pem: string): KeyObject | string {
  if (pem.includes("BEGIN CERTIFICATE")) {
    return new X509Certificate(pem).publicKey;
  }
  try {
    return createPublicKey(pem);
  } catch {
    return pem;
  }
}

export function verifyMac(
  source: string,
  signatureBase64: string,
  publicKeyPem: string,
  algorithm: SebAlgorithm,
): boolean {
  try {
    const verifier = createVerify(nodeAlgorithm(algorithm));
    verifier.update(source, "utf8");
    verifier.end();
    return verifier.verify(toPublicKey(publicKeyPem), signatureBase64, "base64");
  } catch {
    return false;
  }
}

/** Banko atsakymo parašo patikra pagal VK_SERVICE. */
export function verifyBankResponse(
  fields: VkFields,
  publicKeyPem: string,
  algorithm: SebAlgorithm,
  macLengthMode: "chars" | "bytes" = "chars",
): boolean {
  const service = fields.VK_SERVICE;
  const order = service ? MAC_FIELDS[service] : undefined;
  const mac = fields.VK_MAC;
  if (!order || !mac) return false;
  const source = buildMacSource(fields, order, macLengthMode);
  return verifyMac(source, mac, publicKeyPem, algorithm);
}

/**
 * Mokėjimo nuorodos kontrolinis skaitmuo (7-3-1 metodas),
 * naudojamas Lietuvos ir Baltijos bankų mokėjimo nuorodose.
 */
export function referenceWithCheckDigit(base: string): string {
  const digits = base.replace(/\D/g, "");
  const weights = [7, 3, 1];
  let sum = 0;
  let index = 0;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    sum += Number(digits[i]) * weights[index % 3];
    index += 1;
  }
  const check = (10 - (sum % 10)) % 10;
  return `${digits}${check}`;
}

/** VK_DATETIME formatas: 2026-09-28T16:50:00+0300 (Lietuvos laiko juosta). */
export function formatVkDateTime(date = new Date(), timeZone = "Europe/Vilnius"): string {
  const parts = new Intl.DateTimeFormat("lt-LT", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "longOffset",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const offset = get("timeZoneName").replace("GMT", "").replace(":", "") || "+0000";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${offset}`;
}

export type PaymentRequest = {
  /** Banko formos adresas – į jį POST'inami laukai */
  url: string;
  fields: VkFields;
};

/** Suformuoja pasirašytą VK_SERVICE=1012 mokėjimo užklausą. */
export function buildPaymentRequest(params: {
  config: SebConfig;
  privateKeyPem: string;
  stamp: string;
  amountCents: number;
  reference: string;
  message: string;
  returnUrl: string;
  cancelUrl: string;
  datetime?: string;
}): PaymentRequest {
  const { config } = params;

  const fields: VkFields = {
    VK_SERVICE: "1012",
    VK_VERSION: "008",
    VK_SND_ID: config.senderId,
    VK_STAMP: params.stamp,
    VK_AMOUNT: (params.amountCents / 100).toFixed(2),
    VK_CURR: "EUR",
    VK_REF: params.reference,
    VK_MSG: params.message,
    VK_RETURN: params.returnUrl,
    VK_CANCEL: params.cancelUrl,
    VK_DATETIME: params.datetime ?? formatVkDateTime(),
  };

  const source = buildMacSource(fields, MAC_FIELDS["1012"], config.macLengthMode);
  fields.VK_MAC = signMac(source, params.privateKeyPem, config.algorithm);
  fields.VK_ENCODING = "UTF-8";
  fields.VK_LANG = config.language;

  return { url: config.paymentUrl, fields };
}
