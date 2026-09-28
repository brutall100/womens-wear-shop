import { NextResponse } from "next/server";
import { getDb, Order } from "@/lib/db";
import { createSebBanklinkSession } from "@/lib/seb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      deliveryMethod,
      deliveryDetails,
      items,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !city || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: "Užpildykite visus privalomus pirkėjo ir pristatymo laukus" },
        { status: 400 }
      );
    }

    const db = getDb();
    const orderId = "ord-" + Date.now();
    const orderNumber = "SEB-" + Math.floor(100000 + Math.random() * 900000);

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Free delivery over 60 EUR in Lithuania
    const shippingFee = subtotal >= 60 ? 0 : 3.50;
    const totalAmount = subtotal + shippingFee;

    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode: postalCode || "LT-00000",
      deliveryMethod: deliveryMethod || "dpd_courier",
      deliveryDetails: deliveryDetails || "",
      paymentMethod: "seb_banklink",
      paymentStatus: "pending",
      items,
      subtotal,
      shippingFee,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`
      INSERT INTO orders (
        id, orderNumber, customerName, customerEmail, customerPhone,
        shippingAddress, city, postalCode, deliveryMethod, deliveryDetails,
        paymentMethod, paymentStatus, sebTransactionId, sebPaymentReference,
        items, subtotal, shippingFee, totalAmount, createdAt, updatedAt
      ) VALUES (
        @id, @orderNumber, @customerName, @customerEmail, @customerPhone,
        @shippingAddress, @city, @postalCode, @deliveryMethod, @deliveryDetails,
        @paymentMethod, @paymentStatus, @sebTransactionId, @sebPaymentReference,
        @items, @subtotal, @shippingFee, @totalAmount, @createdAt, @updatedAt
      )
    `).run({
      ...order,
      sebTransactionId: null,
      sebPaymentReference: null,
      items: JSON.stringify(items),
    });

    // Determine host origin for return URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Create SEB banklink session
    const sebSession = await createSebBanklinkSession(order, baseUrl);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      sebSession,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko sukurti užsakymo" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM orders ORDER BY createdAt DESC")
      .all() as Record<string, unknown>[];

    const orders: Order[] = rows.map((r) => ({
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
    }));

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko gauti užsakymų sąrašo" },
      { status: 500 }
    );
  }
}
