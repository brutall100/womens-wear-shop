import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { syncOrderPayment } from "@/lib/orders";
import { fetchPayment, getSebConfig } from "@/lib/payments/seb";

export const dynamic = "force-dynamic";

/**
 * SEB e. prekyba (EveryPay) callback endpoint.
 * Configure it in the merchant portal: E-shop settings -> Callback URL:
 *   https://<jusu-domenas>/api/mokejimai/seb/callback
 *
 * The gateway sends `payment_reference`, `order_reference` and `event_name`
 * (as query params, sometimes as a form/JSON body). Callbacks are not signed,
 * so we ignore the reported state and re-fetch the payment from the API.
 */
async function handle(req: NextRequest) {
  const cfg = getSebConfig();
  if (!cfg) return NextResponse.json({ error: "SEB not configured" }, { status: 503 });

  const params = new URL(req.url).searchParams;
  let paymentReference = params.get("payment_reference");

  if (!paymentReference && req.method === "POST") {
    try {
      const contentType = req.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const body = (await req.json()) as { payment_reference?: string };
        paymentReference = body.payment_reference ?? null;
      } else {
        const form = await req.formData();
        paymentReference = (form.get("payment_reference") as string | null) ?? null;
      }
    } catch {
      /* no body */
    }
  }

  if (!paymentReference) {
    return NextResponse.json({ error: "payment_reference missing" }, { status: 400 });
  }

  let order = await prisma.order.findUnique({
    where: { paymentReference },
    include: { items: true },
  });

  // Fallback: match by order_reference returned from the API (e.g. retried payments).
  if (!order) {
    const payment = await fetchPayment(cfg, paymentReference);
    const byNumber = await prisma.order.findUnique({
      where: { number: payment.order_reference },
      include: { items: true },
    });
    if (!byNumber) return NextResponse.json({ error: "order not found" }, { status: 404 });
    order = await prisma.order.update({
      where: { id: byNumber.id },
      data: { paymentReference },
      include: { items: true },
    });
  }

  try {
    const updated = await syncOrderPayment(order);
    return NextResponse.json({ ok: true, order: updated.number, paymentStatus: updated.paymentStatus });
  } catch (err) {
    console.error("SEB callback sync failed", err);
    return NextResponse.json({ error: "sync failed" }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
