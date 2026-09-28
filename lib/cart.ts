import { MAX_QTY } from "./checkout";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  qty: number;
  image: string;
};

const KEY = "mot-cart";
export const CART_EVENT = "mot-cart";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => line && line.productId && line.size && line.qty > 0)
      .map((line) => ({ ...line, qty: Math.min(Math.floor(line.qty), MAX_QTY) }));
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or full storage: the cart then lives only until the page closes.
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

/** Adds a line and keeps the quantity within `limit`. Tells how many pieces are now in the cart. */
export function addLine(line: CartLine, limit = MAX_QTY): { qty: number; clamped: boolean } {
  const lines = readCart();
  const max = Math.max(1, Math.min(limit, MAX_QTY));
  const existing = lines.find((item) => item.productId === line.productId && item.size === line.size);
  const wanted = (existing?.qty ?? 0) + line.qty;
  const qty = Math.min(wanted, max);
  if (existing) existing.qty = qty;
  else lines.push({ ...line, qty });
  writeCart(lines);
  return { qty, clamped: wanted > max };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function clearCart(): void {
  writeCart([]);
}
