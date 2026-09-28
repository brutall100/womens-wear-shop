import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Suknelės", slug: "sukneles", position: 1 },
  { name: "Palaidinės", slug: "palaidines", position: 2 },
  { name: "Kelnės", slug: "kelnes", position: 3 },
  { name: "Sijonai", slug: "sijonai", position: 4 },
  { name: "Viršutiniai drabužiai", slug: "virsutiniai-drabuziai", position: 5 },
  { name: "Megztiniai", slug: "megztiniai", position: 6 },
  { name: "Aksesuarai", slug: "aksesuarai", position: 7 },
];

const sizes = ["XS", "S", "M", "L", "XL"];

const products = [
  {
    name: "Lininė midi suknelė „Rūta“",
    slug: "linine-midi-suknele-ruta",
    category: "sukneles",
    priceCents: 8900,
    compareAtPriceCents: 10900,
    isFeatured: true,
    image: "/placeholders/1.svg",
    description:
      "Lengva, natūralaus lino suknelė su reguliuojamomis petnešėlėmis ir laisvu siluetu. Idealiai tinka šiltoms vasaros dienoms ir vakarams mieste.\n\nSudėtis: 100 % linas.\nPriežiūra: skalbti 30 °C, nenaudoti džiovyklės.",
  },
  {
    name: "Šilkinė palaidinė „Aušra“",
    slug: "silkine-palaidine-ausra",
    category: "palaidines",
    priceCents: 6500,
    isFeatured: true,
    image: "/placeholders/2.svg",
    description:
      "Elegantiška palaidinė iš švelnaus šilko mišinio su V formos iškirpte ir ilgomis rankovėmis. Dera tiek su džinsais, tiek su klasikinėmis kelnėmis.\n\nSudėtis: 70 % viskozė, 30 % šilkas.",
  },
  {
    name: "Plačios kelnės „Vilnia“",
    slug: "placios-kelnes-vilnia",
    category: "kelnes",
    priceCents: 7200,
    isFeatured: true,
    image: "/placeholders/3.svg",
    description:
      "Aukšto liemens plačios kelnės su klostėmis priekyje. Minkštas, kritus audinys sukuria ištemptą siluetą.\n\nSudėtis: 65 % poliesteris, 33 % viskozė, 2 % elastanas.",
  },
  {
    name: "Satino sijonas „Neris“",
    slug: "satino-sijonas-neris",
    category: "sijonai",
    priceCents: 5400,
    image: "/placeholders/4.svg",
    description:
      "Įstrižo kirpimo satino sijonas, kuris švelniai krenta ir gražiai juda einant. Uždaromas paslėptu užtrauktuku šone.\n\nSudėtis: 100 % poliesteris (satinas).",
  },
  {
    name: "Vilnonis paltas „Žiema“",
    slug: "vilnonis-paltas-ziema",
    category: "virsutiniai-drabuziai",
    priceCents: 18900,
    compareAtPriceCents: 21900,
    isFeatured: true,
    image: "/placeholders/5.svg",
    description:
      "Klasikinio kirpimo dvieilis paltas iš šiltos vilnos mišinio. Su pamušalu, dviem kišenėmis ir diržu.\n\nSudėtis: 60 % vilna, 30 % poliesteris, 10 % kašmyras.",
  },
  {
    name: "Kašmyro megztinis „Smiltė“",
    slug: "kasmyro-megztinis-smilte",
    category: "megztiniai",
    priceCents: 12900,
    image: "/placeholders/6.svg",
    description:
      "Nepaprastai švelnus megztinis iš gryno kašmyro su apvalia iškirpte. Laisvas siluetas, tinkantis kasdienai ir šventėms.\n\nSudėtis: 100 % kašmyras.",
  },
  {
    name: "Klasikinis švarkas „Gedimina“",
    slug: "klasikinis-svarkas-gedimina",
    category: "virsutiniai-drabuziai",
    priceCents: 11500,
    image: "/placeholders/7.svg",
    description:
      "Struktūruotas švarkas su lengvai paplatintais pečiais ir vienos sagos užsegimu. Puikus pasirinkimas darbui ir ypatingoms progoms.\n\nSudėtis: 75 % poliesteris, 22 % viskozė, 3 % elastanas.",
  },
  {
    name: "Odinis diržas „Aurė“",
    slug: "odinis-dirzas-aure",
    category: "aksesuarai",
    priceCents: 3900,
    image: "/placeholders/8.svg",
    universal: true,
    description:
      "Plonas diržas iš tikros odos su matine metaline sagtimi. Pabrėžia liemenį ir užbaigia įvaizdį.\n\nSudėtis: 100 % natūrali oda.",
  },
  {
    name: "Trikotažinė suknelė „Gintarė“",
    slug: "trikotazine-suknele-gintare",
    category: "sukneles",
    priceCents: 7900,
    image: "/placeholders/1.svg",
    description:
      "Prigludusio silueto megzta suknelė iki kelių su ilgomis rankovėmis. Šilta ir patogi rudens dienoms.\n\nSudėtis: 50 % viskozė, 28 % poliesteris, 22 % nailonas.",
  },
  {
    name: "Medvilninė palaidinė „Liepa“",
    slug: "medvilnine-palaidine-liepa",
    category: "palaidines",
    priceCents: 4900,
    image: "/placeholders/2.svg",
    description:
      "Laisvo kirpimo palaidinė iš organinės medvilnės su pūstomis rankovėmis. Kvėpuojantis audinys, tinkantis kasdienai.\n\nSudėtis: 100 % organinė medvilnė.",
  },
  {
    name: "Klostuotas midi sijonas „Ugnė“",
    slug: "klostuotas-midi-sijonas-ugne",
    category: "sijonai",
    priceCents: 6200,
    image: "/placeholders/4.svg",
    description:
      "Smulkiai klostuotas midi ilgio sijonas su elastine juosmens juosta. Lengvas ir universalus.\n\nSudėtis: 100 % poliesteris.",
  },
  {
    name: "Tiesios kelnės „Dainava“",
    slug: "tiesios-kelnes-dainava",
    category: "kelnes",
    priceCents: 6800,
    image: "/placeholders/3.svg",
    description:
      "Klasikinės tiesios kelnės su kantu. Aukštas liemuo ir šoninės kišenės.\n\nSudėtis: 68 % viskozė, 29 % poliesteris, 3 % elastanas.",
  },
];

async function main() {
  const categoryBySlug = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, position: c.position },
      create: c,
    });
    categoryBySlug.set(c.slug, cat.id);
  }

  for (const [index, p] of products.entries()) {
    const variantSizes = p.universal ? ["Universalus"] : sizes;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        compareAtPriceCents: p.compareAtPriceCents ?? null,
        isFeatured: p.isFeatured ?? false,
        sku: `MZ-${String(index + 1).padStart(4, "0")}`,
        categoryId: categoryBySlug.get(p.category) ?? null,
        images: { create: [{ url: p.image, alt: p.name, position: 0 }] },
        variants: {
          create: variantSizes.map((size, i) => ({
            size,
            position: i,
            stock: p.universal ? 25 : 3 + ((index + i) % 5),
          })),
        },
      },
    });
  }

  console.log(`Seed: ${categories.length} kategorijos, ${products.length} prekės.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
