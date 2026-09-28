import "server-only";

import { randomBytes, randomUUID, X509Certificate, createPublicKey } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { slugify } from "./money";
import { generateRsaPem, sepaText } from "./seb";

export type ProductImage = { id: string; path: string; sort: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  sizes: string[];
  stock: number;
  published: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  size: string;
  priceCents: number;
  qty: number;
};

export type Order = {
  id: string;
  stamp: string;
  status: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  note: string;
  deliveryId: string;
  deliveryLabel: string;
  deliveryCents: number;
  subtotalCents: number;
  amountCents: number;
  vkMsg: string;
  createdAt: string;
  paidAt: string | null;
  bankPayload: string | null;
  items: OrderItem[];
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  sizes: string;
  stock: number;
  published: number;
  created_at: string;
  updated_at: string;
};

const globalForDb = globalThis as unknown as { motDb?: DatabaseSync };

function databasePath(): string {
  return process.env.MOT_DB_PATH || path.join(process.cwd(), "data", "mot.db");
}

function keysDir(): string {
  return path.join(process.cwd(), "data", "keys");
}

function open(): DatabaseSync {
  if (globalForDb.motDb) return globalForDb.motDb;
  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      sizes TEXT NOT NULL,
      stock INTEGER NOT NULL,
      published INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      path TEXT NOT NULL,
      sort INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      stamp TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal TEXT NOT NULL,
      note TEXT NOT NULL,
      delivery_id TEXT NOT NULL,
      delivery_label TEXT NOT NULL,
      delivery_cents INTEGER NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL,
      vk_msg TEXT NOT NULL,
      created_at TEXT NOT NULL,
      paid_at TEXT,
      bank_payload TEXT
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      size TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      qty INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  seed(db);
  ensureDemoKeys();
  globalForDb.motDb = db;
  return db;
}

function seed(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (count.n > 0) return;
  const now = new Date().toISOString();
  const insert = db.prepare(
    `INSERT INTO products (id, slug, name, description, price_cents, category, sizes, stock, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  );
  const image = db.prepare(`INSERT INTO product_images (id, product_id, path, sort) VALUES (?, ?, ?, 0)`);
  const items: Array<[string, string, string, number, string, string, number]> = [
    [
      "svarkas-grafitas",
      "Švarkas „Grafitas“",
      "Juodas švarkas atviru priekiu. Vidutinio ilgio rankovės, švelnus audinys. Gerai krenta ant pečių ir tinka tiek prie džinsų, tiek prie suknelės.",
      18900,
      "Švarkai",
      "/seed/paltai-rukas.jpg",
      6,
    ],
    [
      "suknele-saule",
      "Suknelė „Saulė“",
      "Geltona suknelė plonomis petnešomis. Liemuo surišamas diržu, sijonas laisvas. Lengva nešti šiltą dieną.",
      12900,
      "Suknelės",
      "/seed/sukneles-lina.jpg",
      8,
    ],
    [
      "marskiniai-balta",
      "Marškiniai „Balta“",
      "Balti marškiniai laisvu kirpimu. Ilgos rankovės. Galima nešioti vienus arba po švarku.",
      7900,
      "Marškiniai",
      "/seed/megztiniai-molis.jpg",
      12,
    ],
    [
      "komplektas-tyluma",
      "Komplektas „Tyluma“",
      "Juodas viršus ir juodos kelnės. Tamsus, ramus siluetas, kai norisi vienos spalvos ir mažai detalių.",
      15900,
      "Komplektai",
      "/seed/palaidines-tyluma.jpg",
      5,
    ],
    [
      "dzinsai-sviesa",
      "Džinsai „Šviesa“",
      "Šviesūs džinsai tiesia klešne. Aukštas liemuo, klasikinis užsegimas. Kasdieniam nešiojimui.",
      9900,
      "Džinsai",
      "/seed/kelnes-asis.jpg",
      10,
    ],
    [
      "suknele-kalke",
      "Suknelė „Kalkė“",
      "Balta suknelė su V iškirpte ir surišamu diržu. Lengvas, šiek tiek blizgus audinys.",
      11900,
      "Suknelės",
      "/seed/sijonai-kloste.jpg",
      7,
    ],
    [
      "striuke-oda",
      "Striukė „Oda“",
      "Ruda odinė striukė. Metalinės sagos, šoninės kišenės, trumpesnis kirpimas.",
      24900,
      "Striukės",
      "/seed/striukes-siaure.jpg",
      4,
    ],
    [
      "suknele-pieva",
      "Suknelė „Pieva“",
      "Gėlėta suknelė plonomis petnešomis. Klostuotas sijonas, lengvas audinys, laisvas kritimas.",
      13900,
      "Suknelės",
      "/seed/sukneles-vakaras.jpg",
      6,
    ],
  ];
  const sizes = JSON.stringify(["XS", "S", "M", "L"]);
  for (const [slug, name, description, price, category, photo, stock] of items) {
    const id = randomUUID();
    insert.run(id, slug, name, description, price, category, sizes, stock, now, now);
    image.run(randomUUID(), id, photo);
  }
}

function mapProduct(row: ProductRow, images: ProductImage[]): Product {
  let sizes: string[] = [];
  try {
    const parsed = JSON.parse(row.sizes) as unknown;
    if (Array.isArray(parsed)) sizes = parsed.map(String);
  } catch {
    sizes = [];
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    category: row.category,
    sizes,
    stock: row.stock,
    published: row.published === 1,
    images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function imagesFor(db: DatabaseSync, productId: string): ProductImage[] {
  return db
    .prepare("SELECT id, path, sort FROM product_images WHERE product_id = ? ORDER BY sort, id")
    .all(productId) as ProductImage[];
}

function uniqueSlug(db: DatabaseSync, base: string, exceptId?: string): string {
  const root = base || "preke";
  let slug = root;
  let n = 2;
  while (true) {
    const row = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug) as { id: string } | undefined;
    if (!row || row.id === exceptId) return slug;
    slug = `${root}-${n++}`;
  }
}

export function listProducts(options?: {
  publishedOnly?: boolean;
  category?: string;
  q?: string;
  sort?: string;
}): Product[] {
  const db = open();
  const where: string[] = [];
  const params: Array<string | number> = [];
  if (options?.publishedOnly) where.push("published = 1");
  if (options?.category) {
    where.push("category = ?");
    params.push(options.category);
  }
  if (options?.q) {
    const term = `%${options.q.replace(/[%_]/g, "")}%`;
    where.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    params.push(term, term, term);
  }
  let order = "created_at DESC";
  if (options?.sort === "kaina-asc") order = "price_cents ASC";
  if (options?.sort === "kaina-desc") order = "price_cents DESC";
  if (options?.sort === "vardas") order = "name COLLATE NOCASE ASC";
  const sql = `SELECT * FROM products ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${order}`;
  const rows = db.prepare(sql).all(...params) as ProductRow[];
  return rows.map((row) => mapProduct(row, imagesFor(db, row.id)));
}

export function listCategories(): string[] {
  const db = open();
  const rows = db
    .prepare("SELECT DISTINCT category FROM products WHERE published = 1 ORDER BY category")
    .all() as Array<{ category: string }>;
  return rows.map((row) => row.category);
}

export function getProductBySlug(slug: string, includeUnpublished = false): Product | null {
  const db = open();
  const row = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as ProductRow | undefined;
  if (!row) return null;
  if (!includeUnpublished && row.published !== 1) return null;
  return mapProduct(row, imagesFor(db, row.id));
}

export function getProduct(id: string): Product | null {
  const db = open();
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  if (!row) return null;
  return mapProduct(row, imagesFor(db, row.id));
}

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  category: string;
  sizes: string[];
  stock: number;
  published: boolean;
};

export function createProduct(input: ProductInput): Product {
  const db = open();
  const id = randomUUID();
  const now = new Date().toISOString();
  const slug = uniqueSlug(db, slugify(input.name));
  db.prepare(
    `INSERT INTO products (id, slug, name, description, price_cents, category, sizes, stock, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    slug,
    input.name,
    input.description,
    input.priceCents,
    input.category,
    JSON.stringify(input.sizes),
    input.stock,
    input.published ? 1 : 0,
    now,
    now,
  );
  const created = getProduct(id);
  if (!created) throw new Error("Nepavyko išsaugoti prekės");
  return created;
}

export function updateProduct(id: string, input: ProductInput): Product | null {
  const db = open();
  const current = getProduct(id);
  if (!current) return null;
  const slug = current.name === input.name ? current.slug : uniqueSlug(db, slugify(input.name), id);
  db.prepare(
    `UPDATE products
     SET slug = ?, name = ?, description = ?, price_cents = ?, category = ?, sizes = ?, stock = ?, published = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    slug,
    input.name,
    input.description,
    input.priceCents,
    input.category,
    JSON.stringify(input.sizes),
    input.stock,
    input.published ? 1 : 0,
    new Date().toISOString(),
    id,
  );
  return getProduct(id);
}

export function deleteProduct(id: string): void {
  const db = open();
  const images = imagesFor(db, id);
  db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  for (const image of images) removeUpload(image.path);
}

export function addProductImage(productId: string, publicPath: string): ProductImage {
  const db = open();
  const sortRow = db.prepare("SELECT COALESCE(MAX(sort), -1) AS sort FROM product_images WHERE product_id = ?").get(productId) as {
    sort: number;
  };
  const image: ProductImage = { id: randomUUID(), path: publicPath, sort: sortRow.sort + 1 };
  db.prepare("INSERT INTO product_images (id, product_id, path, sort) VALUES (?, ?, ?, ?)").run(
    image.id,
    productId,
    image.path,
    image.sort,
  );
  return image;
}

export function deleteProductImage(imageId: string): void {
  const db = open();
  const row = db.prepare("SELECT path FROM product_images WHERE id = ?").get(imageId) as { path: string } | undefined;
  if (!row) return;
  db.prepare("DELETE FROM product_images WHERE id = ?").run(imageId);
  removeUpload(row.path);
}

function removeUpload(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) return;
  const file = path.join(process.cwd(), "public", publicPath);
  if (existsSync(file)) unlinkSync(file);
}

export type CheckoutItem = { productId: string; size: string; qty: number };

export type CheckoutCustomer = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  note: string;
  deliveryId: string;
  deliveryLabel: string;
  deliveryCents: number;
};

export function createOrder(
  customer: CheckoutCustomer,
  lines: OrderItem[],
  amount: { subtotalCents: number; deliveryCents: number; amountCents: number },
): Order {
  const db = open();
  const id = randomUUID();
  const stamp = randomBytes(8).toString("hex");
  const vkMsg = sepaText(`MOT ${stamp}`);
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO orders (
        id, stamp, status, email, name, phone, address, city, postal, note,
        delivery_id, delivery_label, delivery_cents, subtotal_cents, amount_cents, vk_msg, created_at
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      stamp,
      customer.email,
      customer.name,
      customer.phone,
      customer.address,
      customer.city,
      customer.postal,
      customer.note,
      customer.deliveryId,
      customer.deliveryLabel,
      amount.deliveryCents,
      amount.subtotalCents,
      amount.amountCents,
      vkMsg,
      now,
    );
    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, name, size, price_cents, qty) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const line of lines) {
      insertItem.run(randomUUID(), id, line.productId, line.name, line.size, line.priceCents, line.qty);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const order = getOrderByStamp(stamp);
  if (!order) throw new Error("Nepavyko sukurti užsakymo");
  return order;
}

type OrderRow = {
  id: string;
  stamp: string;
  status: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  note: string;
  delivery_id: string;
  delivery_label: string;
  delivery_cents: number;
  subtotal_cents: number;
  amount_cents: number;
  vk_msg: string;
  created_at: string;
  paid_at: string | null;
  bank_payload: string | null;
};

function mapOrder(db: DatabaseSync, row: OrderRow): Order {
  const items = db
    .prepare("SELECT id, product_id AS productId, name, size, price_cents AS priceCents, qty FROM order_items WHERE order_id = ?")
    .all(row.id) as OrderItem[];
  return {
    id: row.id,
    stamp: row.stamp,
    status: row.status,
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postal: row.postal,
    note: row.note,
    deliveryId: row.delivery_id,
    deliveryLabel: row.delivery_label,
    deliveryCents: row.delivery_cents,
    subtotalCents: row.subtotal_cents,
    amountCents: row.amount_cents,
    vkMsg: row.vk_msg,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    bankPayload: row.bank_payload,
    items,
  };
}

export function getOrderByStamp(stamp: string): Order | null {
  const db = open();
  const row = db.prepare("SELECT * FROM orders WHERE stamp = ?").get(stamp) as OrderRow | undefined;
  if (!row) return null;
  return mapOrder(db, row);
}

export function getOrder(id: string): Order | null {
  const db = open();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  if (!row) return null;
  return mapOrder(db, row);
}

export function listOrders(): Order[] {
  const db = open();
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as OrderRow[];
  return rows.map((row) => mapOrder(db, row));
}

export function setOrderStatus(id: string, status: string): void {
  const db = open();
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

export function markOrderPaid(stamp: string, payload: Record<string, string>): boolean {
  const db = open();
  const order = getOrderByStamp(stamp);
  if (!order) return false;
  if (order.status === "paid" || order.status === "preparing" || order.status === "shipped") return true;
  db.exec("BEGIN");
  try {
    const result = db
      .prepare("UPDATE orders SET status = 'paid', paid_at = ?, bank_payload = ? WHERE stamp = ? AND status IN ('pending', 'failed')")
      .run(new Date().toISOString(), JSON.stringify(payload), stamp);
    if (Number(result.changes) > 0) {
      for (const item of order.items) {
        db.prepare("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?").run(item.qty, item.productId);
      }
    }
    db.exec("COMMIT");
    return Number(result.changes) > 0 || order.status === "paid";
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function markOrderFailed(stamp: string, payload: Record<string, string>): void {
  const db = open();
  db.prepare(
    "UPDATE orders SET status = 'failed', bank_payload = ? WHERE stamp = ? AND status = 'pending'",
  ).run(JSON.stringify(payload), stamp);
}

export function getSetting(key: string): string {
  const db = open();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

export function setSetting(key: string, value: string): void {
  const db = open();
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export function shopConfig() {
  const free = Number(getSetting("free_shipping_cents") || "15000");
  return {
    email: getSetting("email"),
    phone: getSetting("phone"),
    pickup: getSetting("pickup"),
    freeShippingCents: Number.isFinite(free) ? free : 15000,
  };
}

export type SebConfig = {
  merchantId: string;
  gatewayUrl: string;
  bankId: string;
  live: boolean;
  merchantKey: string;
  bankCert: string;
};

function readKey(name: string): string {
  const file = path.join(keysDir(), name);
  if (!existsSync(file)) return "";
  return readFileSync(file, "utf8");
}

export function ensureDemoKeys(): { merchantPrivate: string; bankPrivate: string; bankPublic: string } {
  mkdirSync(keysDir(), { recursive: true });
  const merchantFile = path.join(keysDir(), "demo-merchant.pem");
  const bankPrivateFile = path.join(keysDir(), "demo-bank.pem");
  const bankPublicFile = path.join(keysDir(), "demo-bank.pub.pem");
  if (!existsSync(merchantFile) || !existsSync(bankPrivateFile) || !existsSync(bankPublicFile)) {
    const merchant = generateRsaPem();
    const bank = generateRsaPem();
    writeFileSync(merchantFile, merchant.privateKey, { mode: 0o600 });
    writeFileSync(bankPrivateFile, bank.privateKey, { mode: 0o600 });
    writeFileSync(bankPublicFile, bank.publicKey, { mode: 0o600 });
  }
  return {
    merchantPrivate: readFileSync(merchantFile, "utf8"),
    bankPrivate: readFileSync(bankPrivateFile, "utf8"),
    bankPublic: readFileSync(bankPublicFile, "utf8"),
  };
}

export function saveSecretFile(name: "merchant.pem" | "bank.crt", contents: string): void {
  mkdirSync(keysDir(), { recursive: true });
  writeFileSync(path.join(keysDir(), name), contents.trim() + "\n", { mode: 0o600 });
}

export function sebConfig(): SebConfig {
  const merchantKey = readKey("merchant.pem");
  const bankCert = readKey("bank.crt");
  const merchantId = getSetting("seb_merchant_id").trim();
  const gatewayUrl = getSetting("seb_gateway_url").trim();
  const live = Boolean(merchantId && gatewayUrl.startsWith("https://") && merchantKey && bankCert);
  return {
    merchantId: live ? merchantId : "MOTDEMO",
    gatewayUrl,
    bankId: getSetting("seb_bank_id").trim(),
    live,
    merchantKey: live ? merchantKey : ensureDemoKeys().merchantPrivate,
    bankCert: live ? bankCert : ensureDemoKeys().bankPublic,
  };
}

export function keyStatus() {
  const merchant = readKey("merchant.pem");
  const bank = readKey("bank.crt");
  let merchantBits = "";
  let bankSubject = "";
  try {
    if (merchant) {
      const key = createPublicKey(merchant);
      const details = key.asymmetricKeyDetails;
      merchantBits = details?.modulusLength ? String(details.modulusLength) : "rsa";
    }
  } catch {
    merchantBits = "netinkamas";
  }
  try {
    if (bank) {
      const cert = new X509Certificate(bank);
      bankSubject = cert.subject;
    }
  } catch {
    if (bank.includes("BEGIN PUBLIC KEY")) bankSubject = "viešas raktas";
    else if (bank) bankSubject = "netinkamas";
  }
  return {
    merchant: Boolean(merchant),
    merchantBits,
    bank: Boolean(bank),
    bankSubject,
  };
}

export function publicKeyFromPrivate(privateKeyPem: string): string {
  return createPublicKey(privateKeyPem).export({ type: "spki", format: "pem" }).toString();
}
