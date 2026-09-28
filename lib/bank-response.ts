import { NextResponse } from "next/server";
import { getOrderByStamp } from "./db";
import { appOrigin, formToRecord, isStamp } from "./origin";
import { applyBankResponse } from "./payments";

export async function readBankParams(request: Request): Promise<Record<string, string>> {
  if (request.method === "GET") {
    return Object.fromEntries(new URL(request.url).searchParams.entries());
  }
  return formToRecord(await request.formData());
}

/** Handles the buyer coming back from the bank (and the bank's own server call when VK_AUTO=Y). */
export async function handleBankResponse(request: Request): Promise<Response> {
  const params = await readBankParams(request);
  const result = applyBankResponse(params);
  if (result.auto) {
    return new Response(result.ok ? "OK" : result.error, {
      status: result.ok ? 200 : 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const origin = appOrigin(request);
  if (!result.ok) {
    console.warn(`SEB atsakymas atmestas: ${result.error}`);
    const known = result.stamp && isStamp(result.stamp) && getOrderByStamp(result.stamp);
    const target = known ? `${origin}/uzsakymas/${result.stamp}?klaida=bankas` : `${origin}/krepselis?klaida=bankas`;
    return NextResponse.redirect(target, 303);
  }
  return NextResponse.redirect(`${origin}/uzsakymas/${result.stamp}`, 303);
}
