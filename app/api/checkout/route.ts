import { NextResponse } from "next/server";
import { createOrder, getProduct, shopConfig, type OrderItem } from "@/lib/db";
import { appOrigin } from "@/lib/origin";
import { buildPayment } from "@/lib/payments";
import { deliveryById, shippingCents } from "@/lib/shipping";

export const runtime = "nodejs";

type Incoming = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal?: string;
  note?: string;
  deliveryId?: string;
  items?: Array<{ productId?: string; size?: string; qty?: number }>;
};

export async function POST(request: Request) {
  let body: Incoming;
  try {
    body = (await request.json()) as Incoming;
  } catch {
    return NextResponse.json({ error: "Neteisinga užklausa." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const address = (body.address ?? "").trim();
  const city = (body.city ?? "").trim();
  const postal = (body.postal ?? "").trim();
  const note = (body.note ?? "").trim().slice(0, 500);
  const delivery = deliveryById(body.deliveryId ?? "");
  if (name.length < 2) return NextResponse.json({ error: "Įrašykite vardą ir pavardę." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El. pašto adresas netinka." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Įrašykite telefono numerį." }, { status: 400 });
  }
  if (!delivery) return NextResponse.json({ error: "Pasirinkite pristatymą." }, { status: 400 });
  if (delivery.id !== "shop" && (!address || !city || !postal)) {
    return NextResponse.json({ error: "Įrašykite adresą, miestą ir pašto kodą." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Krepšelis tuščias." }, { status: 400 });
  }

  const lines: OrderItem[] = [];
  for (const item of body.items) {
    const product = item.productId ? getProduct(item.productId) : null;
    const qty = Number(item.qty);
    if (!product || !product.published) {
      return NextResponse.json({ error: "Viena prekių nebeparduodama. Atnaujinkite krepšelį." }, { status: 400 });
    }
    if (!item.size || !product.sizes.includes(item.size)) {
      return NextResponse.json({ error: `Prekei „${product.name}“ nėra tokio dydžio.` }, { status: 400 });
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 9) {
      return NextResponse.json({ error: "Kiekis turi būti nuo 1 iki 9." }, { status: 400 });
    }
    const already = lines.find((line) => line.productId === product.id && line.size === item.size);
    const wanted = (already?.qty ?? 0) + qty;
    if (wanted > product.stock) {
      return NextResponse.json({ error: `„${product.name}“ likutis per mažas.` }, { status: 400 });
    }
    if (already) already.qty = wanted;
    else {
      lines.push({
        id: "",
        productId: product.id,
        name: product.name,
        size: item.size,
        priceCents: product.priceCents,
        qty,
      });
    }
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const shop = shopConfig();
  const deliveryCents = shippingCents(subtotalCents, delivery.priceCents, shop.freeShippingCents);
  const order = createOrder(
    {
      email,
      name,
      phone,
      address,
      city,
      postal,
      note,
      deliveryId: delivery.id,
      deliveryLabel: delivery.label,
      deliveryCents,
    },
    lines,
    { subtotalCents, deliveryCents, amountCents: subtotalCents + deliveryCents },
  );
  const payment = buildPayment(order, appOrigin(request));
  return NextResponse.json({
    stamp: order.stamp,
    payment: { ...payment, totalCents: order.amountCents },
  });
}
