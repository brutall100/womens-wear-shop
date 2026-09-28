import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/payment/seb-process - handles user action from SEB authentication portal
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get("paymentId") as string;
    const orderId = formData.get("orderId") as string;
    const action = formData.get("action") as string;

    const db = getDb();
    const now = new Date().toISOString();

    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    if (action === "CONFIRM") {
      // Mark order as paid
      db.prepare(`
        UPDATE orders SET
          paymentStatus = 'paid',
          updatedAt = ?
        WHERE id = ?
      `).run(now, orderId);

      return NextResponse.redirect(
        `${origin}/uzsakymas/patvirtinimas?orderId=${orderId}&status=paid&paymentId=${paymentId}`,
        303
      );
    } else {
      // Cancelled
      db.prepare(`
        UPDATE orders SET
          paymentStatus = 'cancelled',
          updatedAt = ?
        WHERE id = ?
      `).run(now, orderId);

      return NextResponse.redirect(
        `${origin}/uzsakymas/atsauktas?orderId=${orderId}&paymentId=${paymentId}`,
        303
      );
    }
  } catch (error) {
    console.error("POST /api/payment/seb-process error:", error);
    return NextResponse.json({ success: false, error: "Klaida apdorojant mokėjimą" }, { status: 500 });
  }
}
