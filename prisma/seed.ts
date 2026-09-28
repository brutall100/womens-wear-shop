import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Suknelės", slug: "sukneles" },
  { name: "Palaidinės", slug: "palaidines" },
  { name: "Kelnės", slug: "kelnes" },
  { name: "Sijonai", slug: "sijonai" },
  { name: "Megztiniai", slug: "megztiniai" },
  { name: "Švarkai", slug: "svarkai" },
];

const LETTER = ["XS", "S", "M", "L", "XL"];

const products = [
  {
    name: "Lino suknelė „Vasara“",
    category: "sukneles",
    price: 7990,
    compareAtPrice: 9990,
    isFeatured: true,
    description:
      "Lengva, ilga lino suknelė su plonomis petnešėlėmis ir juosmens raišteliu.\n\nSudėtis: 100 % linas\nPriežiūra: skalbti 30 °C, lyginti vidutine temperatūra\nModelis dėvi S dydį, ūgis 172 cm",
  },
  {
    name: "Midi suknelė su gėlių raštu",
    category: "sukneles",
    price: 6490,
    isFeatured: true,
    description: "Kasdienė midi ilgio suknelė iš viskozės su subtiliu gėlių raštu ir V formos iškirpte.\n\nSudėtis: 100 % viskozė",
  },
  {
    name: "Šilkinė palaidinė",
    category: "palaidines",
    price: 5490,
    isFeatured: true,
    description: "Klasikinė laisvo kirpimo palaidinė su sagomis. Tinka ir į biurą, ir vakarienei.\n\nSudėtis: 92 % šilkas, 8 % elastanas",
  },
  {
    name: "Medvilninė marškininė palaidinė",
    category: "palaidines",
    price: 3990,
    description: "Balta, platesnio kirpimo marškininė palaidinė iš tankios medvilnės.\n\nSudėtis: 100 % organinė medvilnė",
  },
  {
    name: "Plačios klasikinės kelnės",
    category: "kelnes",
    price: 5990,
    isFeatured: true,
    description: "Aukšto juosmens plačios kelnės su lygintomis klostėmis.\n\nSudėtis: 65 % poliesteris, 33 % viskozė, 2 % elastanas",
  },
  {
    name: "Tiesaus kirpimo džinsai",
    category: "kelnes",
    price: 6990,
    sizes: ["34", "36", "38", "40", "42"],
    description: "Aukšto juosmens tiesaus kirpimo džinsai iš tvirto, bet minkšto džinso.\n\nSudėtis: 99 % medvilnė, 1 % elastanas",
  },
  {
    name: "Plisuotas midi sijonas",
    category: "sijonai",
    price: 4590,
    compareAtPrice: 5990,
    description: "Lengvai krentantis plisuotas sijonas su elastiniu juosmeniu.\n\nSudėtis: 100 % poliesteris",
  },
  {
    name: "Merino vilnos megztinis",
    category: "megztiniai",
    price: 8990,
    isFeatured: true,
    description: "Minkštas, šiltas ir nedygsintis megztinis apvalia apykakle.\n\nSudėtis: 100 % merino vilna\nPriežiūra: skalbti rankomis 30 °C",
  },
  {
    name: "Kašmyro kardiganas",
    category: "megztiniai",
    price: 12990,
    description: "Ilgas kardiganas su sagomis ir kišenėmis. Puikiai tinka sluoksniuoti.\n\nSudėtis: 70 % vilna, 30 % kašmyras",
  },
  {
    name: "Oversize švarkas",
    category: "svarkai",
    price: 11990,
    description: "Laisvo kirpimo dvieilis švarkas su pamušalu.\n\nSudėtis: 60 % vilna, 40 % poliesteris",
  },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.lt").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "pakeiskite-slaptazodi";
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Administratorius: ${email}`);

  if ((await prisma.product.count()) > 0) {
    console.log("Prekės jau yra — pavyzdiniai duomenys nekuriami.");
    return;
  }

  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, sortOrder: i } });
  }

  for (const p of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    const sizes = p.sizes ?? LETTER;
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        isFeatured: p.isFeatured ?? false,
        categoryId: category.id,
        variants: {
          create: sizes.map((size, idx) => ({ size, stock: (idx * 3 + p.price) % 7, sortOrder: idx })),
        },
      },
    });
  }
  console.log(`Sukurta ${products.length} pavyzdinių prekių.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
