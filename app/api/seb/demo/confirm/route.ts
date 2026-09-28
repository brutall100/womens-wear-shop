import { NextResponse } from "next/server";
import { getOrderByStamp, sebConfig } from "@/lib/db";
import { appOrigin, formToRecord } from "@/lib/origin";
import { buildBankReply } from "@/lib/payments";

export const runtime = "nodejs";

/** The buyer pressed "Pay" or "Reject" in the test bank: send back a signed reply like a real bank. */
export async function POST(request: Request) {
  if (sebConfig().live) {
    return new Response("Bandomoji aplinka išjungta.", { status: 404 });
  }
  const form = formToRecord(await request.formData());
  const origin = appOrigin(request);
  const order = getOrderByStamp(form.stamp ?? "");
  if (!order) return NextResponse.redirect(`${origin}/krepselis?klaida=bankas`, 303);
  if (order.status !== "pending" && order.status !== "failed") {
    return NextResponse.redirect(`${origin}/uzsakymas/${order.stamp}`, 303);
  }
  const kind = form.action === "pay" ? "1111" : form.action === "reject" ? "1911" : null;
  if (!kind) return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 400 });
  const target = new URL(kind === "1111" ? "/api/seb/return" : "/api/seb/cancel", origin);
  for (const [name, value] of Object.entries(buildBankReply(order, kind))) target.searchParams.set(name, value);
  return NextResponse.redirect(target, 303);
}
