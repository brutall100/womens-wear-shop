/**
 * The browser "database" for the GitHub Pages demo.
 * Everything a visitor changes is saved in their own browser (localStorage), nobody else sees it.
 * The rules (prices, stock, validation) come from the same modules the real server uses.
 */
import { categoriesOf, queryProducts } from "../catalog";
import { planCheckout, type CheckoutRequest } from "../checkout";
import { canPay, STATUS_LABEL } from "../labels";
import { parseEuroToCents, slugify } from "../money";
import { parseProduct } from "../product-input";
import { DEMO_SHOP, SEED_PRODUCTS, seedTimestamp } from "../seed";
import type { CatalogQuery, Order, Product, ProductImage, ShopConfig } from "../types";

export type DemoState = { version: 1; products: Product[]; orders: Order[]; shop: ShopConfig };

const KEY = "mot-demo-v1";
const EVENT = "mot-demo";
const SESSION = "mot-demo-admin";

/** The admin password of the public demo. The real shop never accepts it in production. */
export const DEMO_PASSWORD = "mot-admin";

function createSeed(): DemoState {
  const products: Product[] = SEED_PRODUCTS.map((item, index) => {
    const at = seedTimestamp(index);
    return {
      id: `seed-${item.slug}`,
      slug: item.slug,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      category: item.category,
      sizes: [...item.sizes],
      stock: item.stock,
      published: true,
      images: [{ id: `seed-${item.slug}-1`, path: item.image, sort: 0 }],
      createdAt: at,
      updatedAt: at,
    };
  });
  return { version: 1, products, orders: [], shop: { ...DEMO_SHOP } };
}

let seedCache: DemoState | null = null;
let cache: DemoState | null = null;

/** Used for the static HTML and for the first render, so it never changes. */
export function seedState(): DemoState {
  return (seedCache ??= createSeed());
}

function isState(value: unknown): value is DemoState {
  const state = value as DemoState | null;
  return Boolean(state && state.version === 1 && Array.isArray(state.products) && Array.isArray(state.orders) && state.shop);
}

function load(): DemoState {
  if (typeof window === "undefined") return seedState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as unknown;
    if (isState(parsed)) return parsed;
  } catch {
    // Broken or blocked storage: start from the seed.
  }
  return seedState();
}

export function getState(): DemoState {
  return (cache ??= load());
}

function commit(next: DemoState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error("Naršyklėje nebeužtenka vietos. Ištrinkite kelias nuotraukas arba atstatykite demo duomenis.");
  }
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribe(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    cache = null;
    callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function randomHex(bytes: number): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

// ---------- products ----------

export function listProducts(state: DemoState, query: CatalogQuery = {}): Product[] {
  return queryProducts(state.products, query);
}

export function listCategories(state: DemoState): string[] {
  return categoriesOf(state.products);
}

export function findBySlug(state: DemoState, slug: string, includeUnpublished = false): Product | null {
  const product = state.products.find((item) => item.slug === slug);
  if (!product || (!includeUnpublished && !product.published)) return null;
  return product;
}

export function findProduct(state: DemoState, id: string): Product | null {
  return state.products.find((item) => item.id === id) ?? null;
}

function uniqueSlug(products: Product[], base: string, exceptId?: string): string {
  const root = base || "preke";
  let slug = root;
  let n = 2;
  while (products.some((item) => item.slug === slug && item.id !== exceptId)) slug = `${root}-${n++}`;
  return slug;
}

export function saveProduct(id: string | null, body: unknown): { product: Product } | { error: string } {
  const parsed = parseProduct(body);
  if ("error" in parsed) return parsed;
  const state = getState();
  const now = new Date().toISOString();
  if (!id) {
    const product: Product = {
      id: `p-${randomHex(8)}`,
      slug: uniqueSlug(state.products, slugify(parsed.name)),
      ...parsed,
      images: [],
      createdAt: now,
      updatedAt: now,
    };
    commit({ ...state, products: [product, ...state.products] });
    return { product };
  }
  const current = findProduct(state, id);
  if (!current) return { error: "Prekė nerasta." };
  const slug = current.name === parsed.name ? current.slug : uniqueSlug(state.products, slugify(parsed.name), id);
  const product: Product = { ...current, ...parsed, slug, updatedAt: now };
  commit({ ...state, products: state.products.map((item) => (item.id === id ? product : item)) });
  return { product };
}

export function deleteProduct(id: string): void {
  const state = getState();
  commit({ ...state, products: state.products.filter((item) => item.id !== id) });
}

export function addImages(productId: string, paths: string[]): ProductImage[] {
  const state = getState();
  const product = findProduct(state, productId);
  if (!product) throw new Error("Prekė nerasta.");
  let sort = product.images.reduce((max, image) => Math.max(max, image.sort), -1);
  const added = paths.map((path) => ({ id: `i-${randomHex(8)}`, path, sort: ++sort }));
  const next = { ...product, images: [...product.images, ...added], updatedAt: new Date().toISOString() };
  commit({ ...state, products: state.products.map((item) => (item.id === productId ? next : item)) });
  return added;
}

export function deleteImage(imageId: string): void {
  const state = getState();
  commit({
    ...state,
    products: state.products.map((item) => ({ ...item, images: item.images.filter((image) => image.id !== imageId) })),
  });
}

// ---------- orders ----------

export function checkout(body: CheckoutRequest): { stamp: string } | { error: string } {
  const state = getState();
  const plan = planCheckout(body, (id) => findProduct(state, id), state.shop.freeShippingCents);
  if ("error" in plan) return plan;
  const stamp = randomHex(8);
  const order: Order = {
    id: `o-${randomHex(8)}`,
    stamp,
    status: "pending",
    ...plan.customer,
    ...plan.amounts,
    vkMsg: `MOT uzsakymas ${stamp.slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    paidAt: null,
    bankPayload: null,
    items: plan.lines.map((line) => ({ ...line, id: `l-${randomHex(6)}` })),
  };
  commit({ ...state, orders: [order, ...state.orders] });
  return { stamp };
}

export function findOrderByStamp(state: DemoState, stamp: string): Order | null {
  return state.orders.find((order) => order.stamp === stamp) ?? null;
}

export function findOrder(state: DemoState, id: string): Order | null {
  return state.orders.find((order) => order.id === id) ?? null;
}

/** The test bank said "paid": mark the order and take the pieces from stock, like the server does. */
export function payOrder(stamp: string): void {
  const state = getState();
  const order = findOrderByStamp(state, stamp);
  if (!order || !canPay(order.status)) return;
  const paid: Order = { ...order, status: "paid", paidAt: new Date().toISOString(), bankPayload: JSON.stringify({ demo: true }) };
  const products = state.products.map((product) => {
    const taken = order.items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.qty, 0);
    return taken ? { ...product, stock: Math.max(product.stock - taken, 0) } : product;
  });
  commit({ ...state, products, orders: state.orders.map((item) => (item.id === order.id ? paid : item)) });
}

export function rejectOrder(stamp: string): void {
  const state = getState();
  const order = findOrderByStamp(state, stamp);
  if (!order || order.status !== "pending") return;
  commit({ ...state, orders: state.orders.map((item) => (item.id === order.id ? { ...item, status: "failed" } : item)) });
}

export function setOrderStatus(id: string, status: string): { error: string } | null {
  if (!STATUS_LABEL[status]) return { error: "Nežinoma būsena." };
  const state = getState();
  commit({ ...state, orders: state.orders.map((item) => (item.id === id ? { ...item, status } : item)) });
  return null;
}

// ---------- settings and session ----------

export function saveShop(body: Record<string, unknown>): { error: string } | null {
  const free = parseEuroToCents(String(body.freeShipping ?? ""));
  if (free === null) return { error: "Nemokamo pristatymo suma netinka." };
  const state = getState();
  commit({
    ...state,
    shop: {
      email: String(body.email ?? "").trim().slice(0, 120),
      phone: String(body.phone ?? "").trim().slice(0, 40),
      pickup: String(body.pickup ?? "").trim().slice(0, 240),
      freeShippingCents: free,
    },
  });
  return null;
}

export function resetDemo(): void {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem("mot-cart");
  } catch {
    // Nothing saved.
  }
  cache = null;
  window.dispatchEvent(new Event(EVENT));
  window.dispatchEvent(new Event("mot-cart"));
}

export function demoLoggedIn(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION) === "1";
  } catch {
    return false;
  }
}

export function demoLogin(password: string): boolean {
  if (password !== DEMO_PASSWORD) return false;
  try {
    window.sessionStorage.setItem(SESSION, "1");
  } catch {
    // Without session storage the login lasts until the next page load.
  }
  return true;
}

export function demoLogout(): void {
  try {
    window.sessionStorage.removeItem(SESSION);
  } catch {
    // Nothing to clear.
  }
}
