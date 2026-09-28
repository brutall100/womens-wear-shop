import { createPublicKey, createSign, createVerify, generateKeyPairSync, X509Certificate } from "node:crypto";

/**
 * Baltic Payment Initiation / Bank Link service v009.
 * MAC009 = RSA-SHA512 (PKCS#1 v1.5) over length-prefixed fields.
 * Length counts Unicode symbols, not bytes. An empty field is "000".
 * Field order follows Swedbank Payment Initiation v009 (2025-02-11),
 * which is the channel used to reach AB SEB bankas (BIC CBVILT2X).
 */

export const REQUEST_1012 = [
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
] as const;

export const RESPONSE_1111 = [
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
] as const;

export const RESPONSE_1911 = [
  "VK_SERVICE",
  "VK_VERSION",
  "VK_SND_ID",
  "VK_REC_ID",
  "VK_STAMP",
  "VK_REF",
  "VK_MSG",
] as const;

const LT: Record<string, string> = {
  ą: "a",
  č: "c",
  ę: "e",
  ė: "e",
  į: "i",
  š: "s",
  ų: "u",
  ū: "u",
  ž: "z",
  Ą: "A",
  Č: "C",
  Ę: "E",
  Ė: "E",
  Į: "I",
  Š: "S",
  Ų: "U",
  Ū: "U",
  Ž: "Z",
};

export function macString(values: string[]): string {
  return values
    .map((value) => {
      if (value.length === 0) return "000";
      const symbols = Array.from(value).length;
      return String(symbols).padStart(3, "0") + value;
    })
    .join("");
}

export function signMac(values: string[], privateKeyPem: string): string {
  const signer = createSign("RSA-SHA512");
  signer.update(macString(values), "utf8");
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

export function verifyMac(values: string[], signature: string, publicKeyPem: string): boolean {
  if (!signature || !publicKeyPem) return false;
  try {
    const verifier = createVerify("RSA-SHA512");
    verifier.update(macString(values), "utf8");
    verifier.end();
    return verifier.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}

export function fieldsForMac(source: Record<string, string>, names: readonly string[]): string[] {
  return names.map((name) => source[name] ?? "");
}

export function formatBankAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}${euros}.${rest}`;
}

export function parseBankAmount(amount: string): number | null {
  if (!/^\d+\.\d{2}$/.test(amount)) return null;
  const [euros, cents] = amount.split(".");
  return Number(euros) * 100 + Number(cents);
}

export function sepaText(input: string, max = 140): string {
  const latin = Array.from(input)
    .map((char) => LT[char] ?? char)
    .join("");
  return latin.replace(/[^A-Za-z0-9 /\-?:().,'+]/g, "?").slice(0, max);
}

export function vilniusTimestamp(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const offset = (parts.timeZoneName ?? "GMT+03:00").replace("GMT", "") || "+00:00";
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

export function normalizePublicKey(pem: string): string {
  const trimmed = pem.trim();
  if (!trimmed) throw new Error("Tuščias raktas");
  if (trimmed.includes("BEGIN CERTIFICATE")) {
    return new X509Certificate(trimmed).publicKey.export({ type: "spki", format: "pem" }).toString();
  }
  return createPublicKey(trimmed).export({ type: "spki", format: "pem" }).toString();
}

export function generateRsaPem(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { privateKey, publicKey };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });
}

export const SEB_GATEWAY_HINT = "https://pi.swedbank.com/LT/CBVILT2X";
