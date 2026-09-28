import { NextResponse, type NextRequest } from "next/server";
import { collectVkFields, processSebResponse } from "@/lib/seb/process-response";

export const dynamic = "force-dynamic";

/**
 * Grįžimo adresas iš SEB banko (VK_RETURN ir VK_CANCEL).
 * Bankas gali kreiptis tiek naršyklės POST forma, tiek automatiniu pranešimu.
 */
async function handle(request: NextRequest) {
  const fields =
    request.method === "POST"
      ? collectVkFields(await request.formData())
      : collectVkFields(request.nextUrl.searchParams);

  const result = await processSebResponse(fields);

  if (result.automatic) {
    return new NextResponse(result.outcome === "invalid" ? "ERROR" : "OK", {
      status: result.outcome === "invalid" ? 400 : 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (result.outcome === "invalid" || !result.orderId) {
    const url = new URL("/mokejimas/klaida", request.nextUrl.origin);
    if (result.reason) url.searchParams.set("priezastis", result.reason);
    return NextResponse.redirect(url, 303);
  }

  const url = new URL(`/uzsakymas/${result.orderId}`, request.nextUrl.origin);
  url.searchParams.set("busena", result.outcome === "paid" ? "apmoketa" : "atsaukta");
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
