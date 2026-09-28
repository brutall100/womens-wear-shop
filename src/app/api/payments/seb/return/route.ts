import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUrl, syncPayment } from "@/lib/payments";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const paymentReference = params.get("payment_reference");
  const orderReference = params.get("order_reference");

  const payment = await prisma.payment.findFirst({
    where: paymentReference ? { paymentReference } : { orderReference: orderReference ?? "" },
    include: { order: { select: { publicId: true } } },
  });
  if (!payment) return NextResponse.redirect(`${siteUrl()}/`);

  try {
    await syncPayment({ paymentReference: payment.paymentReference, orderReference: payment.orderReference });
  } catch (error) {
    console.error("[SEB] Nepavyko patikrinti mokėjimo grįžus klientui", error);
  }
  return NextResponse.redirect(`${siteUrl()}/uzsakymas/${payment.order.publicId}`);
}
