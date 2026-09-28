import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Raktų valdymas.
 *
 * `live` režimu raktai imami iš aplinkos kintamųjų (PEM tekstas arba failo kelias).
 * `mock` režimu (vietiniam testavimui) raktų poros sugeneruojamos automatiškai
 * kataloge `.keys/` – tikri banko raktai nereikalingi.
 */

const KEYS_DIR = path.join(process.cwd(), ".keys");

type KeyName =
  | "merchant-private"
  | "merchant-public"
  | "bank-private"
  | "bank-public";

function readFromEnv(inlineVar: string, pathVar: string): string | null {
  const inline = process.env[inlineVar];
  if (inline && inline.includes("BEGIN")) {
    return inline.replace(/\\n/g, "\n");
  }
  const filePath = process.env[pathVar];
  if (filePath && existsSync(filePath)) {
    return readFileSync(filePath, "utf8");
  }
  return null;
}

function keyFile(name: KeyName): string {
  return path.join(KEYS_DIR, `${name}.pem`);
}

/** Sugeneruoja testinių raktų poras, jei jų dar nėra. */
export function ensureDevKeys(): void {
  const needed: KeyName[] = [
    "merchant-private",
    "merchant-public",
    "bank-private",
    "bank-public",
  ];
  if (needed.every((name) => existsSync(keyFile(name)))) return;

  mkdirSync(KEYS_DIR, { recursive: true });

  for (const owner of ["merchant", "bank"] as const) {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    writeFileSync(keyFile(`${owner}-private`), privateKey, { mode: 0o600 });
    writeFileSync(keyFile(`${owner}-public`), publicKey);
  }
}

function devKey(name: KeyName): string {
  ensureDevKeys();
  return readFileSync(keyFile(name), "utf8");
}

/** Pardavėjo privatus raktas – juo pasirašomos užklausos bankui. */
export function getMerchantPrivateKey(): string {
  return (
    readFromEnv("SEB_PRIVATE_KEY", "SEB_PRIVATE_KEY_PATH") ??
    devKey("merchant-private")
  );
}

/** Banko viešasis raktas arba sertifikatas – juo tikrinami banko atsakymai. */
export function getBankPublicKey(): string {
  return (
    readFromEnv("SEB_BANK_PUBLIC_KEY", "SEB_BANK_PUBLIC_KEY_PATH") ??
    devKey("bank-public")
  );
}

/** Tik bandomajam bankui: pardavėjo viešasis raktas užklausos parašui patikrinti. */
export function getMerchantPublicKeyForMock(): string {
  return devKey("merchant-public");
}

/** Tik bandomajam bankui: banko privatus raktas atsakymui pasirašyti. */
export function getBankPrivateKeyForMock(): string {
  return devKey("bank-private");
}
