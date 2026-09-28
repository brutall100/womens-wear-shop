import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Admin password hashing with scrypt (built into Node.js).
 * Stored format: `scrypt.<N>.<r>.<p>.<salt>.<hash>` with base64url parts.
 * Dots instead of `$` keep the value safe inside `.env` files.
 */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64url"), hash.toString("base64url")].join(".");
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.trim().split(".");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltText, hashText] = parts;
  const salt = Buffer.from(saltText, "base64url");
  const expected = Buffer.from(hashText, "base64url");
  if (salt.length === 0 || expected.length === 0) return false;
  try {
    const actual = scryptSync(password, salt, expected.length, { N: Number(n), r: Number(r), p: Number(p) });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
