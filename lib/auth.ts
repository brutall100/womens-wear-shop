import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { verifyPassword } from "./password";

export const ADMIN_COOKIE = "mot_admin";

/** Only for local development, so the shop can be tried right after `npm run dev`. */
export const DEV_PASSWORD = "mot-admin";

function secret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, "auth-secret");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  mkdirSync(dir, { recursive: true });
  const value = randomBytes(32).toString("hex");
  writeFileSync(file, value, { mode: 0o600 });
  return value;
}

export type AdminAccess = "hash" | "dev-default" | "locked";

/**
 * - `hash`: ADMIN_PASSWORD_HASH is set, only that password works;
 * - `dev-default`: nothing is set and the app runs with `npm run dev`, so `mot-admin` works;
 * - `locked`: production without a hash, nobody can log in until one is set.
 */
export function adminAccess(): AdminAccess {
  if (process.env.ADMIN_PASSWORD_HASH?.trim()) return "hash";
  return process.env.NODE_ENV === "production" ? "locked" : "dev-default";
}

export function checkAdminPassword(input: string): boolean {
  const access = adminAccess();
  if (access === "hash") return verifyPassword(input, process.env.ADMIN_PASSWORD_HASH ?? "");
  if (access === "dev-default") {
    const left = Buffer.from(input);
    const right = Buffer.from(DEV_PASSWORD);
    return left.length === right.length && timingSafeEqual(left, right);
  }
  return false;
}

export function signAdminToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = `v1.${exp}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expRaw, mac] = parts;
  if (version !== "v1") return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${version}.${expRaw}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function cookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

/** Slows down password guessing: at most 10 wrong tries per address in 10 minutes. */
const attempts = new Map<string, { count: number; since: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_WRONG = 10;

export function loginBlocked(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.since > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_WRONG;
}

export function recordLogin(key: string, ok: boolean): void {
  if (ok) {
    attempts.delete(key);
    return;
  }
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.since > WINDOW_MS) attempts.set(key, { count: 1, since: Date.now() });
  else entry.count += 1;
}
