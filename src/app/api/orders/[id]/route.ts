import { NextResponse } from "next/server";
import { getDb, Order } from "@/lib/db";

// GET /api/orders/[id] - get single order status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const r = db
      .prepare("SELECT * FROM orders WHERE id = ? OR orderNumber = ?")
      .get(id, id) as Record<string, unknown> | undefined;

    if (!r) {
      return NextResponse.json(
        { success: false, error: "Užsakymas nerastas" },
        { status: 404 }
      );
    }

    const order: Order = {
      id: r.id as string,
      orderNumber: r.orderNumber as string,
      customerName: r.customerName as string,
      customerEmail: r.customerEmail as string,
      customerPhone: r.customerPhone as string,
      shippingAddress: r.shippingAddress as string,
      city: r.city as string,
      postalCode: r.postalCode as string,
      deliveryMethod: r.deliveryMethod as Order["deliveryMethod"],
      deliveryDetails: (r.deliveryDetails as string) || "",
      paymentMethod: r.paymentMethod as Order["paymentMethod"],
      paymentStatus: r.paymentStatus as Order["paymentStatus"],
      sebTransactionId: (r.sebTransactionId as string) || undefined,
      sebPaymentReference: (r.sebPaymentReference as string) || undefined,
      items: JSON.parse((r.items as string) || "[]"),
      subtotal: Number(r.subtotal),
      shippingFee: Number(r.shippingFee),
      totalAmount: Number(r.totalAmount),
      createdAt: r.createdAt as string,
      updatedAt: r.updatedAt as string,
    };

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Klaida gaunant užsakymą" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - update status (e.g. mark paid / cancelled)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus } = body;

    const db = getDb();
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE orders SET
        paymentStatus = ?,
        updatedAt = ?
      WHERE id = ? OR orderNumber = ?
    `).run(paymentStatus, now, id, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: "Užsakymas nerastas" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Užsakymo statusas atnaujintas į '${paymentStatus}'`,
    });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko atnaujinti užsakymo" },
      { status: 500 }
    );
  }
}
