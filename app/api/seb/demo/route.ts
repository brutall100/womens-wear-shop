import { NextResponse } from "next/server";
import { getOrderByStamp, sebConfig } from "@/lib/db";
import { appOrigin, formToRecord } from "@/lib/origin";
import { verifyMerchantPacket } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * The test bank. Works only while real SEB keys are not saved.
 * It checks the shop's signed packet just like the bank would, then opens the confirmation page.
 */
export async function POST(request: Request) {
  if (sebConfig().live) {
    return new Response("Bandomoji aplinka išjungta.", { status: 404 });
  }
  const fields = formToRecord(await request.formData());
  const origin = appOrigin(request);
  const order = getOrderByStamp(fields.VK_STAMP ?? "");
  if (!order) return NextResponse.redirect(`${origin}/krepselis?klaida=bankas`, 303);
  if (!verifyMerchantPacket(fields)) {
    return NextResponse.redirect(`${origin}/uzsakymas/${order.stamp}?klaida=bankas`, 303);
  }
  return NextResponse.redirect(`${origin}/bankas/${order.stamp}`, 303);
}
