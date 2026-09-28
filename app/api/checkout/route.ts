import { NextResponse } from "next/server";
import { planCheckout, type CheckoutRequest } from "@/lib/checkout";
import { createOrder, getProduct, shopConfig } from "@/lib/db";
import { appOrigin } from "@/lib/origin";
import { buildPayment } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutRequest | null;
  const plan = planCheckout(body, getProduct, shopConfig().freeShippingCents);
  if ("error" in plan) return NextResponse.json({ error: plan.error }, { status: 400 });
  const order = createOrder(plan.customer, plan.lines, plan.amounts);
  const payment = buildPayment(order, appOrigin(request));
  return NextResponse.json({ stamp: order.stamp, payment: { ...payment, totalCents: order.amountCents } });
}
