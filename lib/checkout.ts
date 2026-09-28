import { deliveryById, shippingCents } from "./shipping.ts";
import type { CheckoutCustomer, OrderItem, Product } from "./types";

/** The most pieces of one item (one size) that can be ordered at once. */
export const MAX_QTY = 9;

export type CheckoutRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  postal?: unknown;
  note?: unknown;
  deliveryId?: unknown;
  items?: unknown;
};

export type CheckoutPlan = {
  customer: CheckoutCustomer;
  lines: OrderItem[];
  amounts: { subtotalCents: number; deliveryCents: number; amountCents: number };
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Checks a checkout request and prices it from the product list, never from the browser.
 * Used by the server API and by the browser demo, so both follow the same rules.
 */
export function planCheckout(
  body: CheckoutRequest | null,
  findProduct: (id: string) => Product | null,
  freeShippingCents: number,
): CheckoutPlan | { error: string } {
  if (!body || typeof body !== "object") return { error: "Neteisinga užklausa." };
  const name = text(body.name, 120);
  const email = text(body.email, 120);
  const phone = text(body.phone, 40);
  const address = text(body.address, 200);
  const city = text(body.city, 80);
  const postal = text(body.postal, 20);
  const note = text(body.note, 500);
  const delivery = deliveryById(text(body.deliveryId, 20));

  if (name.length < 2) return { error: "Įrašykite vardą ir pavardę." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "El. pašto adresas netinka." };
  if (phone.replace(/\D/g, "").length < 8) return { error: "Įrašykite telefono numerį." };
  if (!delivery) return { error: "Pasirinkite pristatymą." };
  if (delivery.id !== "shop" && (!address || !city || !postal)) {
    return { error: "Įrašykite adresą, miestą ir pašto kodą." };
  }
  if (!Array.isArray(body.items) || body.items.length === 0) return { error: "Krepšelis tuščias." };

  const lines: OrderItem[] = [];
  for (const raw of body.items as Array<Record<string, unknown>>) {
    const productId = typeof raw?.productId === "string" ? raw.productId : "";
    const size = typeof raw?.size === "string" ? raw.size : "";
    const qty = Number(raw?.qty);
    const product = productId ? findProduct(productId) : null;
    if (!product || !product.published) {
      return { error: "Viena prekių nebeparduodama. Atnaujinkite krepšelį." };
    }
    if (!size || !product.sizes.includes(size)) {
      return { error: `Prekei „${product.name}“ nėra tokio dydžio.` };
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { error: `Kiekis turi būti nuo 1 iki ${MAX_QTY}.` };
    }
    const already = lines.find((line) => line.productId === product.id && line.size === size);
    const wanted = (already?.qty ?? 0) + qty;
    const inCart = lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.qty, 0);
    if (inCart + qty > product.stock) {
      return { error: `„${product.name}“ likutis per mažas. Liko ${product.stock} vnt.` };
    }
    if (wanted > MAX_QTY) return { error: `Kiekis turi būti nuo 1 iki ${MAX_QTY}.` };
    if (already) already.qty = wanted;
    else lines.push({ id: "", productId: product.id, name: product.name, size, priceCents: product.priceCents, qty });
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const deliveryCents = shippingCents(subtotalCents, delivery.priceCents, freeShippingCents);
  return {
    customer: {
      email,
      name,
      phone,
      address: delivery.id === "shop" ? "" : address,
      city: delivery.id === "shop" ? "" : city,
      postal: delivery.id === "shop" ? "" : postal,
      note,
      deliveryId: delivery.id,
      deliveryLabel: delivery.label,
      deliveryCents,
    },
    lines,
    amounts: { subtotalCents, deliveryCents, amountCents: subtotalCents + deliveryCents },
  };
}
