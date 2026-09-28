/**
 * SEB e. prekyba (SEB Baltic e-commerce) payment gateway client.
 *
 * SEB's merchant gateway in the Baltics is powered by EveryPay and exposes
 * the EveryPay Payment API v4. Flow:
 *   1. POST /v4/payments/oneoff  -> returns `payment_link` (hosted payment page
 *      with card, SEB/other bank links, Apple/Google Pay) and `payment_reference`
 *   2. Customer pays and is redirected back to `customer_url`
 *      with `payment_reference` + `order_reference` query params.
 *   3. Gateway also calls the merchant Callback URL (configured in the merchant
 *      portal). Callbacks are NOT signed, so the payment status is always
 *      re-fetched with GET /v4/payments/:payment_reference before trusting it.
 *
 * Docs: https://support.ecommerce.sebgroup.com  |  https://support.every-pay.com/apidoc/main/
 */

export interface SebConfig {
  apiUsername: string;
  apiSecret: string;
  accountName: string;
  baseUrl: string;
  environment: "demo" | "live";
}

const BASE_URLS = {
  demo: "https://igw-demo.every-pay.com/api",
  live: "https://pay.every-pay.eu/api",
} as const;

export function getSebConfig(): SebConfig | null {
  const apiUsername = process.env.SEB_API_USERNAME?.trim();
  const apiSecret = process.env.SEB_API_SECRET?.trim();
  const accountName = process.env.SEB_ACCOUNT_NAME?.trim();
  if (!apiUsername || !apiSecret || !accountName) return null;
  const environment = process.env.SEB_ENVIRONMENT === "live" ? "live" : "demo";
  return { apiUsername, apiSecret, accountName, environment, baseUrl: BASE_URLS[environment] };
}

export type SebPaymentState =
  | "initial"
  | "waiting_for_sca"
  | "sent_for_processing"
  | "waiting_for_3ds_response"
  | "settled"
  | "authorised"
  | "failed"
  | "abandoned"
  | "voided"
  | "refunded"
  | "chargebacked"
  | (string & {});

export interface SebPayment {
  payment_reference: string;
  order_reference: string;
  payment_state: SebPaymentState;
  payment_link?: string;
  payment_method?: string;
  initial_amount?: number;
  standing_amount?: number;
  currency?: string;
  transaction_time?: string;
  processing_error?: { code: number; message: string };
}

export interface CreateOneOffInput {
  orderReference: string;
  amountCents: number;
  customerUrl: string;
  customerEmail: string;
  customerIp?: string;
  description?: string;
  billing?: {
    line1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

class SebApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "SebApiError";
  }
}

function authHeader(cfg: SebConfig): string {
  return "Basic " + Buffer.from(`${cfg.apiUsername}:${cfg.apiSecret}`).toString("base64");
}

async function request<T>(cfg: SebConfig, path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(cfg),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    throw new SebApiError(`SEB API ${init.method ?? "GET"} ${path} -> ${res.status}`, res.status, body);
  }
  return body as T;
}

/** Only characters allowed by the gateway for order_reference / payment_description. */
export function sanitizeReference(value: string, max = 120): string {
  return value.replace(/[^a-zA-Z0-9/\-?:().,'+ ]/g, "").slice(0, max);
}

export async function createOneOffPayment(
  cfg: SebConfig,
  input: CreateOneOffInput,
): Promise<{ paymentReference: string; paymentLink: string; raw: SebPayment }> {
  const payload: Record<string, unknown> = {
    api_username: cfg.apiUsername,
    account_name: cfg.accountName,
    nonce: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    amount: Math.round(input.amountCents) / 100,
    order_reference: sanitizeReference(input.orderReference),
    customer_url: input.customerUrl,
    email: input.customerEmail,
    locale: "lt",
    preferred_country: "LT",
    integration_details: {
      integration: "Custom",
      software: "womens-wear-shop",
      version: "1.0",
    },
  };
  if (input.customerIp) payload.customer_ip = input.customerIp;
  if (input.description) payload.payment_description = sanitizeReference(input.description, 65);
  if (input.billing) {
    if (input.billing.line1) payload.billing_line1 = input.billing.line1.slice(0, 50);
    if (input.billing.city) payload.billing_city = input.billing.city.slice(0, 50);
    if (input.billing.postcode) payload.billing_postcode = input.billing.postcode.slice(0, 16);
    payload.billing_country = input.billing.country ?? "LT";
  }

  const raw = await request<SebPayment>(cfg, "/v4/payments/oneoff", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!raw.payment_reference || !raw.payment_link) {
    throw new SebApiError("SEB API atsakyme trūksta payment_link", 502, raw);
  }
  return { paymentReference: raw.payment_reference, paymentLink: raw.payment_link, raw };
}

export async function fetchPayment(cfg: SebConfig, paymentReference: string): Promise<SebPayment> {
  const qs = new URLSearchParams({ api_username: cfg.apiUsername });
  return request<SebPayment>(
    cfg,
    `/v4/payments/${encodeURIComponent(paymentReference)}?${qs.toString()}`,
    { method: "GET" },
  );
}

export type NormalizedPaymentStatus = "PAID" | "FAILED" | "PENDING";

export function normalizePaymentState(state: SebPaymentState | null | undefined): NormalizedPaymentStatus {
  switch (state) {
    case "settled":
    case "authorised":
      return "PAID";
    case "failed":
    case "abandoned":
    case "voided":
    case "refunded":
    case "chargebacked":
      return "FAILED";
    default:
      return "PENDING";
  }
}

export { SebApiError };
