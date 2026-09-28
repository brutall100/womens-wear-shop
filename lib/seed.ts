import type { ShopConfig } from "./types";

export type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  image: string;
  sizes: string[];
  stock: number;
};

const SIZES = ["XS", "S", "M", "L"];

/** Starting collection. Every text describes the photo next to it. */
export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "paltas-rukas",
    name: "Paltas „Rūkas“",
    description:
      "Karamelės spalvos paltas su diržu. Platūs atlapai, laisvas kritimas, ilgis žemiau kelių. Šiltas, bet lengvas – tinka rudeniui ir šiltesnei žiemai.",
    priceCents: 18900,
    category: "Paltai",
    image: "/images/products/paltas-rukas.webp",
    sizes: SIZES,
    stock: 6,
  },
  {
    slug: "suknele-lina",
    name: "Suknelė „Lina“",
    description:
      "Balta gėlėto rašto suknelė trumpomis rankovėmis. Užsegama per liemenį, sijonas laisvai krinta. Lengvas audinys karštai dienai prie jūros.",
    priceCents: 12900,
    category: "Suknelės",
    image: "/images/products/suknele-lina.webp",
    sizes: SIZES,
    stock: 8,
  },
  {
    slug: "poncas-molis",
    name: "Pončas „Molis“",
    description:
      "Rankomis nertas kreminės spalvos pončas su kutais. V formos iškirptė. Užsimeskite ant marškinėlių ar suknelės vėsesnį vakarą.",
    priceCents: 7900,
    category: "Megztiniai",
    image: "/images/products/poncas-molis.webp",
    sizes: ["Vienas dydis"],
    stock: 5,
  },
  {
    slug: "palaidine-tyluma",
    name: "Palaidinė „Tyluma“",
    description:
      "Balta medvilninė palaidinė su siuvinėtomis gėlėmis. Trumpos rankovės ir apykaklė. Gražiai atrodo surišta per liemenį su džinsais.",
    priceCents: 6900,
    category: "Palaidinės",
    image: "/images/products/palaidine-tyluma.webp",
    sizes: SIZES,
    stock: 12,
  },
  {
    slug: "kelnes-asis",
    name: "Kelnės „Ašis“",
    description:
      "Pudros rožinės spalvos kelnės su kišenėmis ir guma per liemenį. Siaurėja į apačią, klešnės su guma. Patogios kasdien, dera ir su basutėmis.",
    priceCents: 8900,
    category: "Kelnės",
    image: "/images/products/kelnes-asis.webp",
    sizes: SIZES,
    stock: 10,
  },
  {
    slug: "sijonas-kloste",
    name: "Sijonas „Klostė“",
    description:
      "Juodas klostuotas sijonas iki kelių. Aukštas liemuo, tvirtas audinys gerai laiko formą. Dera su dryžuotais marškiniais.",
    priceCents: 5900,
    category: "Sijonai",
    image: "/images/products/sijonas-kloste.webp",
    sizes: SIZES,
    stock: 7,
  },
  {
    slug: "striuke-siaure",
    name: "Striukė „Šiaurė“",
    description:
      "Chaki spalvos medvilninė striukė su keturiomis kišenėmis. Laisvas kirpimas, užsegama sagomis. Tinka ant megztinio ar džemperio.",
    priceCents: 14900,
    category: "Striukės",
    image: "/images/products/striuke-siaure.webp",
    sizes: SIZES,
    stock: 4,
  },
  {
    slug: "suknele-vakaras",
    name: "Suknelė „Vakaras“",
    description:
      "Slyvų spalvos vakarinė suknelė atvirais pečiais. Prigludęs siluetas, elastingas audinys. Šventėms ir ilgiems vakarams.",
    priceCents: 15900,
    category: "Suknelės",
    image: "/images/products/suknele-vakaras.webp",
    sizes: SIZES,
    stock: 6,
  },
];

/** Image paths used by the first version of the shop, mapped to the new files. */
export const LEGACY_IMAGE_PATHS: Record<string, string> = {
  "/seed/paltai-rukas.jpg": "/images/products/paltas-rukas.webp",
  "/seed/sukneles-lina.jpg": "/images/products/suknele-lina.webp",
  "/seed/megztiniai-molis.jpg": "/images/products/poncas-molis.webp",
  "/seed/palaidines-tyluma.jpg": "/images/products/palaidine-tyluma.webp",
  "/seed/kelnes-asis.jpg": "/images/products/kelnes-asis.webp",
  "/seed/sijonai-kloste.jpg": "/images/products/sijonas-kloste.webp",
  "/seed/striukes-siaure.jpg": "/images/products/striuke-siaure.webp",
  "/seed/sukneles-vakaras.jpg": "/images/products/suknele-vakaras.webp",
};

/** Newest first: the first seed product gets the latest timestamp. */
export function seedTimestamp(index: number, base = Date.UTC(2026, 8, 1, 9, 0, 0)): string {
  return new Date(base - index * 60_000).toISOString();
}

export const DEFAULT_FREE_SHIPPING_CENTS = 15000;

/** Contacts shown in the browser demo. Reserved example values, not real ones. */
export const DEMO_SHOP: ShopConfig = {
  email: "labas@example.com",
  phone: "+370 600 00000",
  pickup: "Atsiėmimas Vilniuje, adresą atsiųsime el. paštu",
  freeShippingCents: DEFAULT_FREE_SHIPPING_CENTS,
};
