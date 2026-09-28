import "server-only";
import { randomBytes } from "node:crypto";

/**
 * SEB e. prekybos mokėjimai (EveryPay API v4).
 * Dokumentacija: https://support.every-pay.com/apidoc/main/
 *
 * SEB_MODE:
 *  - "mock": lokalus testavimas be banko (mokėjimo puslapis imituojamas)
 *  - "demo": SEB testinė aplinka (https://igw-demo.every-pay.com)
 *  - "live": tikri mokėjimai (https://pay.every-pay.eu)
 */
export type SebMode = "mock" | "demo" | "live";

export type SebPaymentState =
  | "initial"
  | "waiting_for_sca"
  | "sent_for_processing"
  | "waiting_for_3ds_response"
  | "settled"
  | "authorized"
  | "failed"
  | "abandoned"
  | "voided"
  | "refunded"
  | "partially_refunded"
  | "chargebacked"
  | (string & {});

export type SebPayment = {
  payment_reference: string;
  order_reference: string;
  payment_state: SebPaymentState;
  initial_amount?: number;
  standing_amount?: number;
  payment_link?: string;
  account_name?: string;
};

const DEFAULT_URLS: Record<Exclude<SebMode, "mock">, string> = {
  demo: "https://igw-demo.every-pay.com/api/v4",
  live: "https://pay.every-pay.eu/api/v4",
};

export function sebMode(): SebMode {
  const mode = (process.env.SEB_MODE ?? "").toLowerCase();
  if (mode === "demo" || mode === "live" || mode === "mock") {
    if (mode === "mock" && process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAYMENTS !== "1") {
      throw new Error("SEB_MODE=mock negali būti naudojamas gamybinėje aplinkoje.");
    }
    return mode;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Nenurodytas SEB_MODE (demo arba live).");
  }
  return "mock";
}

function config() {
  const mode = sebMode();
  if (mode === "mock") throw new Error("SEB API nenaudojamas mock režime");
  const username = process.env.SEB_API_USERNAME;
  const secret = process.env.SEB_API_SECRET;
  const accountName = process.env.SEB_ACCOUNT_NAME;
  if (!username || !secret || !accountName) {
    throw new Error("Trūksta SEB_API_USERNAME, SEB_API_SECRET arba SEB_ACCOUNT_NAME.");
  }
  const baseUrl = (process.env.SEB_API_URL || DEFAULT_URLS[mode]).replace(/\/$/, "");
  return { username, secret, accountName, baseUrl };
}

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const { username, secret, baseUrl } = config();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    console.error(`[SEB] ${method} ${path} -> ${res.status}`, json);
    throw new Error(`SEB API klaida (${res.status})`);
  }
  return json as T;
}

export type CreatePaymentInput = {
  orderReference: string;
  amountCents: number;
  customerUrl: string;
  email?: string;
  customerIp?: string;
  description?: string;
};

export async function createSebPayment(input: CreatePaymentInput): Promise<SebPayment> {
  const { username, accountName } = config();
  return request<SebPayment>("POST", "/payments/oneoff", {
    api_username: username,
    account_name: accountName,
    amount: Number((input.amountCents / 100).toFixed(2)),
    order_reference: input.orderReference,
    nonce: randomBytes(16).toString("hex"),
    timestamp: new Date().toISOString(),
    customer_url: input.customerUrl,
    email: input.email,
    customer_ip: input.customerIp,
    locale: "lt",
    preferred_country: "LT",
    payment_description: input.description,
    integration_details: { integration: "Custom", software: "Next.js", version: "1.0" },
  });
}

export async function getSebPayment(paymentReference: string): Promise<SebPayment> {
  const { username } = config();
  const query = new URLSearchParams({ api_username: username });
  return request<SebPayment>("GET", `/payments/${encodeURIComponent(paymentReference)}?${query}`);
}

export function isPaidState(state: string) {
  return state === "settled" || state === "authorized";
}

export function isFailedState(state: string) {
  return state === "failed" || state === "abandoned" || state === "voided";
}
