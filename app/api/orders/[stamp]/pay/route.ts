import { NextResponse } from "next/server";
import { getOrderByStamp } from "@/lib/db";
import { appOrigin } from "@/lib/origin";
import { buildPayment } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ stamp: string }> }) {
  const { stamp } = await context.params;
  const order = getOrderByStamp(stamp);
  if (!order) return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  if (order.status !== "pending" && order.status !== "failed") {
    return NextResponse.json({ error: "Šis užsakymas jau apmokėtas arba uždarytas." }, { status: 400 });
  }
  const payment = buildPayment(order, appOrigin(request));
  return NextResponse.json({ payment: { ...payment, totalCents: order.amountCents } });
}
