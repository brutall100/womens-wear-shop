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

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line) => line.productId && line.size && line.qty > 0);
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("mot-cart"));
}

export function addLine(line: CartLine): CartLine[] {
  const lines = readCart();
  const existing = lines.find((item) => item.productId === line.productId && item.size === line.size);
  if (existing) existing.qty += line.qty;
  else lines.push(line);
  writeCart(lines);
  return lines;
}

export function clearCart(): void {
  writeCart([]);
}
