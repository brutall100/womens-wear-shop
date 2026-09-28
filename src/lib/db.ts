import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  fabricDetails: string;
  sizes: string[]; // JSON stored in DB
  colors: string[]; // JSON stored in DB
  images: string[]; // JSON stored in DB
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  deliveryMethod: "dpd_courier" | "omniva_terminal" | "lpexpress_terminal";
  deliveryDetails?: string;
  paymentMethod: "seb_banklink" | "seb_card";
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  sebTransactionId?: string;
  sebPaymentReference?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    size: string;
    color: string;
    quantity: number;
    imageUrl: string;
  }[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SebBankSettings {
  id: number;
  merchantId: string;
  clientId: string;
  clientSecret: string;
  privateKeyPem: string;
  sebPublicKeyPem: string;
  banklinkServiceUrl: string;
  mode: "sandbox" | "production";
  accountIban: string;
  recipientName: string;
  updatedAt: string;
}

// Database singleton
const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "store.db");
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL,
      description TEXT NOT NULL,
      fabricDetails TEXT NOT NULL,
      sizes TEXT NOT NULL,
      colors TEXT NOT NULL,
      images TEXT NOT NULL,
      inStock INTEGER NOT NULL DEFAULT 1,
      stockCount INTEGER NOT NULL DEFAULT 10,
      featured INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT NOT NULL UNIQUE,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      city TEXT NOT NULL,
      postalCode TEXT NOT NULL,
      deliveryMethod TEXT NOT NULL,
      deliveryDetails TEXT,
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      sebTransactionId TEXT,
      sebPaymentReference TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shippingFee REAL NOT NULL,
      totalAmount REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seb_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      merchantId TEXT NOT NULL,
      clientId TEXT NOT NULL,
      clientSecret TEXT NOT NULL,
      privateKeyPem TEXT NOT NULL,
      sebPublicKeyPem TEXT NOT NULL,
      banklinkServiceUrl TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'sandbox',
      accountIban TEXT NOT NULL,
      recipientName TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Ensure default SEB bank settings exist
  const existingSettings = db.prepare("SELECT * FROM seb_settings WHERE id = 1").get();
  if (!existingSettings) {
    const insertSettings = db.prepare(`
      INSERT INTO seb_settings (
        id, merchantId, clientId, clientSecret, privateKeyPem,
        sebPublicKeyPem, banklinkServiceUrl, mode, accountIban, recipientName, updatedAt
      ) VALUES (
        1,
        'SEB-MERCHANT-LT7890',
        'seb-app-client-id-demo',
        'seb-client-secret-sec-demo',
        '-----BEGIN RSA PRIVATE KEY-----\\nMIICXAIBAAKCAQEA0...SAMPLE_KEY...==\\n-----END RSA PRIVATE KEY-----',
        '-----BEGIN PUBLIC KEY-----\\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...SAMPLE_SEB_PUBKEY...==\\n-----END PUBLIC KEY-----',
        'https://api.seb.lt/open-banking/v1/sandbox/payments',
        'sandbox',
        'LT347044060001234567',
        'UAB Elegancija Mada',
        datetime('now')
      )
    `);
    insertSettings.run();
  }

  // Ensure initial products exist
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    seedInitialProducts(db);
  }
}

function seedInitialProducts(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO products (
      id, name, slug, category, price, originalPrice, description,
      fabricDetails, sizes, colors, images, inStock, stockCount, featured,
      createdAt, updatedAt
    ) VALUES (
      @id, @name, @slug, @category, @price, @originalPrice, @description,
      @fabricDetails, @sizes, @colors, @images, @inStock, @stockCount, @featured,
      @createdAt, @updatedAt
    )
  `);

  const initialProducts = [
    {
      id: "prod-1",
      name: "Kašmyro ir vilnos paltas „Vilnius Elegance“",
      slug: "kasmyro-ir-vilnos-paltas-vilnius-elegance",
      category: "Paltai",
      price: 249.00,
      originalPrice: 299.00,
      description: "Prabangus ilgas moteriškas paltas su diržu, pasiūtas iš aukščiausios rūšies itališko kašmyro ir merino vilnos mišinio. Puikiai priglunda, suteikia šilumos ir subtilaus rafinuotumo bet kokiu oru.",
      fabricDetails: "70% Merino vilna, 20% Kašmyras, 10% Šilkas. Pamušalas: 100% viskozė.",
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
      colors: JSON.stringify(["Smėlio", "Juoda", "Kavos"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 14,
      featured: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "prod-2",
      name: "Šilkinė midi suknelė su raukiniais „Nida“",
      slug: "silkine-midi-suknele-su-raukiniais-nida",
      category: "Suknelės",
      price: 139.00,
      originalPrice: 165.00,
      description: "Lengva, grakščiai krentanti 100% natūralaus šilko suknelė su subtilia V formos iškirpte ir elegantiškais rankogaliais. Idealiai tinka tiek ypatingoms šventėms, tiek vasaros vakarams.",
      fabricDetails: "100% Natūralus mulberry šilkas. Sausas valymas.",
      sizes: JSON.stringify(["S", "M", "L"]),
      colors: JSON.stringify(["Smaragdo", "Vyno", "Tamsiai mėlyna"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 8,
      featured: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "prod-3",
      name: "Dvigubo užsegimo klasikinis švarkas „Kaunas Atelier“",
      slug: "dvigubo-uzsegimo-klasikinis-svarkas-kaunas-atelier",
      category: "Švarkai",
      price: 159.00,
      originalPrice: null,
      description: "Modernaus tiesaus silueto struktūruotas švarkas su raginėmis sagomis ir kišenėmis su atvartais. Nepriekaištingas pasirinkimas biuro aprangai ar šiuolaikiniam miesto stiliui.",
      fabricDetails: "65% Poliesteris, 30% Viskozė, 5% Elastanas.",
      sizes: JSON.stringify(["XS", "S", "M", "L"]),
      colors: JSON.stringify(["Kavos", "Pieno balta", "Tamsiai pilka"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 19,
      featured: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "prod-4",
      name: "Laisvo kirpimo merino vilnos megztinis „Trakai“",
      slug: "laisvo-kirpimo-merino-vilnos-megztinis-trakai",
      category: "Megztiniai",
      price: 99.00,
      originalPrice: 120.00,
      description: "Jaukus, minkštas ir šildantis itin švelnios merino vilnos megztinis su aukšta apykakle. Švelnus prisilietimas prie odos, nekanda ir palaiko optimalią kūno temperatūrą.",
      fabricDetails: "100% Ekologiška merino vilna (Oeko-Tex Standard 100).",
      sizes: JSON.stringify(["S", "M", "L"]),
      colors: JSON.stringify(["Pieno balta", "Šviesiai pilka", "Šalavijų žalia"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 22,
      featured: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "prod-5",
      name: "Tiesaus kirpimo kostiuminės kelnės su kantu „Palanga“",
      slug: "tiesaus-kirpimo-kostiumines-kelnes-su-kantu-palanga",
      category: "Kelnės",
      price: 89.00,
      originalPrice: null,
      description: "Paaukštinto liemens elegantiškos kelnės su lygiu kantu priekyje ir paslėptu užsegimu. Puikiai dera su švarku arba plonais trikotažo gaminiais.",
      fabricDetails: "70% Poliesteris, 25% Viskozė, 5% Elastanas.",
      sizes: JSON.stringify(["34", "36", "38", "40", "42"]),
      colors: JSON.stringify(["Juoda", "Kreminė", "Tamsiai mėlyna"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 15,
      featured: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "prod-6",
      name: "Klasikiniai natūralaus šilko marškiniai „Monika“",
      slug: "klasikiniai-naturalaus-silko-marskiniai-monika",
      category: "Marškiniai ir palaidinės",
      price: 119.00,
      originalPrice: 145.00,
      description: "Prabangūs šilkiniai marškiniai su perlamutrinėmis sagutėmis. Švelnus satino blizgesys suteikia ypatingo grakštumo kasdieniams ir proginiams įvaizdžiams.",
      fabricDetails: "92% Natūralus šilkas, 8% Elastanas.",
      sizes: JSON.stringify(["XS", "S", "M", "L"]),
      colors: JSON.stringify(["Dramblio kaulo", "Juoda", "Pudros rožinė"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80"
      ]),
      inStock: 1,
      stockCount: 12,
      featured: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const p of initialProducts) {
    insert.run(p);
  }
}
