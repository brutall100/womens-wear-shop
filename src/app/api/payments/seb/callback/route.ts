import type { NextRequest } from "next/server";
import { syncPayment } from "@/lib/payments";

/**
 * SEB (EveryPay) callback. URL nurodomas SEB prekybininko portale:
 * E-shop settings -> Callback URL -> https://jusu-domenas.lt/api/payments/seb/callback
 */
async function handle(request: NextRequest) {
  const params = new URLSearchParams(request.nextUrl.searchParams);
  if (request.method === "POST") {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) if (typeof v === "string") params.set(k, v);
    } else {
      const form = await request.formData().catch(() => null);
      form?.forEach((v, k) => typeof v === "string" && params.set(k, v));
    }
  }

  const paymentReference = params.get("payment_reference");
  if (!paymentReference) return new Response("missing payment_reference", { status: 400 });

  try {
    const result = await syncPayment({ paymentReference });
    if (!result) return new Response("unknown payment", { status: 404 });
    return new Response("OK");
  } catch (error) {
    console.error("[SEB] Callback klaida", error);
    return new Response("error", { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
