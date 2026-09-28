/**
 * Demonstraciniai duomenys: kategorijos, prekės, pristatymo būdai ir administratorius.
 * Paleidimas: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  summary: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  color: string;
  material: string;
  care: string;
  image: string;
  featured?: boolean;
  sizes: Array<{ size: string; stock: number }>;
};

const CATEGORIES = [
  { name: "Suknelės", slug: "sukneles", description: "Kasdienės ir proginės suknelės." },
  { name: "Palaidinės", slug: "palaidines", description: "Lengvos palaidinės ir marškiniai." },
  { name: "Sijonai", slug: "sijonai", description: "Trumpi ir ilgi sijonai." },
  { name: "Kelnės", slug: "kelnes", description: "Klasikinės ir laisvalaikio kelnės." },
  { name: "Megztiniai", slug: "megztiniai", description: "Vilna, merinas, kašmyras." },
  { name: "Viršutiniai drabužiai", slug: "virsutiniai-drabuziai", description: "Paltai, švarkai, striukės." },
];

const SIZES_FULL = ["XS", "S", "M", "L", "XL"];

function sizes(stocks: number[]): Array<{ size: string; stock: number }> {
  return SIZES_FULL.map((size, index) => ({ size, stock: stocks[index] ?? 0 }));
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Lininė suknelė „Vakarė“",
    slug: "linine-suknele-vakare",
    categorySlug: "sukneles",
    summary: "Laisvo silueto suknelė iš skalbto lino su dirželiu per juosmenį.",
    description:
      "Ilga, laisvo kritimo suknelė iš 100 % europietiško lino. Skalbtas audinys minkštas nuo pirmo apsivilkimo, o dirželis leidžia pabrėžti liemenį arba palikti laisvą siluetą.\n\nModelio ūgis 176 cm, vilki S dydį. Suknelė turi šonines kišenes ir sagų juostą priekyje.",
    priceCents: 8900,
    color: "Smėlio",
    material: "100 % linas",
    care: "Skalbti 30 °C, lyginti drėgną, nebalinti.",
    image: "smelis",
    featured: true,
    sizes: sizes([4, 6, 5, 3, 2]),
  },
  {
    name: "Šilkinė palaidinė „Rasa“",
    slug: "silkine-palaidine-rasa",
    categorySlug: "palaidines",
    summary: "Ramaus blizgesio palaidinė su paslėpta sagų juosta.",
    description:
      "Palaidinė iš šilko ir viskozės mišinio krenta minkštomis klostėmis ir netraukia dėmesio blizgesiu. Tinka tiek biurui, tiek vakarienei mieste.\n\nSiūlome derinti su aukšto liemens kelnėmis arba plisuotu sijonu.",
    priceCents: 6900,
    compareAtCents: 8500,
    color: "Rausvai smėlio",
    material: "70 % šilkas, 30 % viskozė",
    care: "Cheminis valymas arba rankinis skalbimas 30 °C.",
    image: "rose",
    featured: true,
    sizes: sizes([3, 5, 6, 4, 0]),
  },
  {
    name: "Plisuotas sijonas „Gilė“",
    slug: "plisuotas-sijonas-gile",
    categorySlug: "sijonai",
    summary: "Midi ilgio plisuotas sijonas su elastine juosmens juosta.",
    description:
      "Smulkios klostės laiko formą visą dieną, o elastinė juosmens juosta patogi net ilgose kelionėse. Sijonas nepermatomas, su pamušalu.",
    priceCents: 5900,
    color: "Salavijo žalia",
    material: "100 % poliesteris (perdirbtas)",
    care: "Skalbti 30 °C maišelyje, nedžiovinti džiovyklėje.",
    image: "salavijas",
    sizes: sizes([2, 4, 4, 3, 1]),
  },
  {
    name: "Vilnonis paltas „Žiemys“",
    slug: "vilnonis-paltas-ziemys",
    categorySlug: "virsutiniai-drabuziai",
    summary: "Tiesaus kirpimo paltas iš vilnos ir kašmyro mišinio.",
    description:
      "Šiltas, bet lengvas paltas su dvigubu užsegimu ir plačiomis atlapomis. Pamušalas iš kvėpuojančios viskozės, rankovės pakankamai plačios megztiniui.\n\nSiuvama nedidelėmis partijomis Lietuvoje.",
    priceCents: 18900,
    compareAtCents: 22900,
    color: "Molio",
    material: "80 % vilna, 20 % kašmyras",
    care: "Tik cheminis valymas.",
    image: "molis",
    featured: true,
    sizes: sizes([1, 3, 3, 2, 1]),
  },
  {
    name: "Aukšto liemens kelnės „Rūta“",
    slug: "auksto-liemens-kelnes-ruta",
    categorySlug: "kelnes",
    summary: "Tiesios kelnės su strėlėmis ir giliomis kišenėmis.",
    description:
      "Klasikinės tiesaus kirpimo kelnės iš kostiuminio audinio su nedidele elastano dalimi. Aukštas liemuo ir strėlės vizualiai ilgina siluetą.",
    priceCents: 7900,
    color: "Grafito",
    material: "62 % viskozė, 34 % poliesteris, 4 % elastanas",
    care: "Skalbti 30 °C, lyginti per audinį.",
    image: "grafitas",
    sizes: sizes([3, 5, 5, 4, 2]),
  },
  {
    name: "Merino megztinis „Migla“",
    slug: "merino-megztinis-migla",
    categorySlug: "megztiniai",
    summary: "Švelnus merino vilnos megztinis apvalia apykakle.",
    description:
      "Nekandantis merino vilnos megztinis vidutinio storio mezgimu. Tinka nešioti vieną arba po švarku – rankogaliai ir apačia neišsitempia.",
    priceCents: 9500,
    color: "Kreminė",
    material: "100 % merino vilna",
    care: "Skalbti rankomis 30 °C arba vilnos programa.",
    image: "kremas",
    featured: true,
    sizes: sizes([4, 6, 6, 4, 2]),
  },
  {
    name: "Trikotažinė suknelė „Smiltė“",
    slug: "trikotazine-suknele-smilte",
    categorySlug: "sukneles",
    summary: "Prigludusi midi suknelė iš tankaus trikotažo.",
    description:
      "Tankus, neprasišviečiantis trikotažas gražiai gula ant figūros ir nesiglamžo. Ilgos rankovės ir aukšta apykaklė – paprasčiausias sprendimas šaltesniam sezonui.",
    priceCents: 7500,
    color: "Tamsiai mėlyna",
    material: "78 % viskozė, 18 % poliamidas, 4 % elastanas",
    care: "Skalbti 30 °C išvertus.",
    image: "naktis",
    sizes: sizes([2, 4, 4, 2, 0]),
  },
  {
    name: "Aksominė suknelė „Vyšnia“",
    slug: "aksomine-suknele-vysnia",
    categorySlug: "sukneles",
    summary: "Proginė aksomo suknelė su V formos iškirpte.",
    description:
      "Minkštas aksomas su ryškiu, bet neblizgančiu atspalviu. Suknelė su paslėptu šoniniu užtrauktuku ir laisvomis rankovėmis.",
    priceCents: 12900,
    color: "Vyno raudona",
    material: "92 % poliesteris, 8 % elastanas",
    care: "Cheminis valymas, negarinti tiesiogiai.",
    image: "vynas",
    sizes: sizes([2, 3, 3, 2, 1]),
  },
  {
    name: "Marškiniai „Dobilas“",
    slug: "marskiniai-dobilas",
    categorySlug: "palaidines",
    summary: "Oversize kirpimo lininiai marškiniai.",
    description:
      "Laisvo kirpimo marškiniai su nuleistu pečių siūlu. Vasarą – vieni, vėsesniu metu – ant marškinėlių arba po megztiniu.",
    priceCents: 6500,
    color: "Salavijo žalia",
    material: "55 % linas, 45 % medvilnė",
    care: "Skalbti 40 °C, lyginti drėgną.",
    image: "salavijas",
    sizes: sizes([3, 4, 4, 3, 2]),
  },
  {
    name: "Satino sijonas „Aušra“",
    slug: "satino-sijonas-ausra",
    categorySlug: "sijonai",
    summary: "Kirptas įstrižai satino sijonas iki blauzdos.",
    description:
      "Įstrižai kirptas sijonas krenta švelnia banga ir nesuformuoja aštrių klosčių. Elastinė nugaros dalis leidžia lengvai parinkti dydį.",
    priceCents: 6200,
    color: "Smėlio",
    material: "100 % viskozė",
    care: "Skalbti 30 °C, džiovinti pakabinus.",
    image: "smelis",
    sizes: sizes([2, 3, 4, 2, 1]),
  },
  {
    name: "Plačios kelnės „Banga“",
    slug: "placios-kelnes-banga",
    categorySlug: "kelnes",
    summary: "Laisvo kritimo kelnės iš viskozės ir lino.",
    description:
      "Plačios, vėsios kelnės su juosmens raišteliu. Audinys kvėpuoja, todėl tinka karštoms dienoms mieste ir prie jūros.",
    priceCents: 6900,
    color: "Kreminė",
    material: "60 % viskozė, 40 % linas",
    care: "Skalbti 30 °C, lyginti nedideliu karščiu.",
    image: "kremas",
    sizes: sizes([3, 4, 5, 3, 2]),
  },
  {
    name: "Kardiganas „Rugsėjis“",
    slug: "kardiganas-rugsejis",
    categorySlug: "megztiniai",
    summary: "Ilgas kardiganas su perlamutrinėmis sagomis.",
    description:
      "Vilnos ir alpakos mišinio kardiganas iki šlaunies vidurio. Dvi šoninės kišenės, nesivelianti mezgimo struktūra.",
    priceCents: 11900,
    color: "Rausva",
    material: "50 % vilna, 30 % alpaka, 20 % poliamidas",
    care: "Vilnos programa 30 °C, džiovinti ant lygaus paviršiaus.",
    image: "rose",
    sizes: sizes([2, 3, 3, 3, 1]),
  },
  {
    name: "Trumpas švarkas „Vėtra“",
    slug: "trumpas-svarkas-vetra",
    categorySlug: "virsutiniai-drabuziai",
    summary: "Struktūrinis švarkas su pagalvėlėmis pečiuose.",
    description:
      "Švarkas, kuris laiko formą ir tinka prie kelnių bei suknelės. Vidinė kišenė, sagos tokio paties atspalvio kaip audinys.",
    priceCents: 13900,
    color: "Grafito",
    material: "68 % poliesteris, 28 % viskozė, 4 % elastanas",
    care: "Cheminis valymas.",
    image: "grafitas",
    sizes: sizes([1, 3, 3, 2, 1]),
  },
  {
    name: "Klostuota suknelė „Ugnė“",
    slug: "klostuota-suknele-ugne",
    categorySlug: "sukneles",
    summary: "Vidutinio ilgio suknelė su klostėmis nuo liemens.",
    description:
      "Suknelė su aukštu liemeniu, kuris pabrėžia figūrą, ir laisvu sijono kritimu. Rankovės iki alkūnės, iškirptė – apvali.",
    priceCents: 9900,
    color: "Molio",
    material: "97 % viskozė, 3 % elastanas",
    care: "Skalbti 30 °C, nedžiovinti džiovyklėje.",
    image: "molis",
    sizes: sizes([3, 4, 4, 3, 1]),
  },
  {
    name: "Medvilninė palaidinė „Liepa“",
    slug: "medvilnine-palaidine-liepa",
    categorySlug: "palaidines",
    summary: "Palaidinė su plačiomis rankovėmis ir mezginio detale.",
    description:
      "Lengva medvilninė palaidinė su rankiniu būdu siūtomis mezginio juostelėmis prie rankovių. Vasariškas, bet neperkrautas akcentas.",
    priceCents: 5500,
    compareAtCents: 6900,
    color: "Balta",
    material: "100 % medvilnė",
    care: "Skalbti 40 °C, lyginti vidutiniu karščiu.",
    image: "kremas",
    sizes: sizes([4, 5, 5, 3, 2]),
  },
  {
    name: "Džinsinis sijonas „Aida“",
    slug: "dzinsinis-sijonas-aida",
    categorySlug: "sijonai",
    summary: "Tiesus džinsinis sijonas su skeltuku priekyje.",
    description:
      "Standesnis džinsas be elastano, todėl sijonas laiko tiesią formą. Skeltukas priekyje palengvina judėjimą.",
    priceCents: 5900,
    color: "Tamsiai mėlyna",
    material: "100 % medvilnė",
    care: "Skalbti 30 °C išvertus, skalbti su panašiomis spalvomis.",
    image: "naktis",
    sizes: sizes([2, 4, 4, 2, 1]),
  },
];

const SHIPPING_METHODS = [
  {
    code: "omniva",
    name: "Omniva paštomatas",
    description: "Pristatymas per 1–2 darbo dienas į pasirinktą paštomatą.",
    priceCents: 299,
    freeFromCents: 6000,
    sortOrder: 1,
  },
  {
    code: "lp-express",
    name: "LP Express paštomatas",
    description: "Pristatymas per 1–2 darbo dienas.",
    priceCents: 249,
    freeFromCents: 6000,
    sortOrder: 2,
  },
  {
    code: "kurjeris",
    name: "Kurjeris į namus ar biurą",
    description: "Pristatymas per 1–3 darbo dienas nurodytu adresu.",
    priceCents: 499,
    freeFromCents: 10000,
    sortOrder: 3,
  },
  {
    code: "atsiemimas",
    name: "Atsiėmimas Vilniuje",
    description: "Gedimino pr. 1, darbo dienomis 10:00–18:00.",
    priceCents: 0,
    freeFromCents: null,
    sortOrder: 4,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@veja.lt";
  const password = process.env.ADMIN_PASSWORD ?? "Slaptazodis123";

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Parduotuvės administratorius",
      passwordHash: await hashPassword(password),
    },
  });
  console.log(`Administratorius: ${email} / ${password}`);

  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: index },
      create: { ...category, sortOrder: index },
    });
  }
  console.log(`Kategorijų: ${CATEGORIES.length}`);

  for (const method of SHIPPING_METHODS) {
    await prisma.shippingMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method,
    });
  }
  console.log(`Pristatymo būdų: ${SHIPPING_METHODS.length}`);

  for (const [index, item] of PRODUCTS.entries()) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });

    const data = {
      name: item.name,
      summary: item.summary,
      description: item.description,
      priceCents: item.priceCents,
      compareAtCents: item.compareAtCents ?? null,
      color: item.color,
      material: item.material,
      careInstructions: item.care,
      sku: `VEJ-${String(index + 1).padStart(4, "0")}`,
      categoryId: category?.id ?? null,
      isActive: true,
      isFeatured: item.featured ?? false,
      sortOrder: index,
    };

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: data,
      create: { ...data, slug: item.slug },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: [1, 2].map((variant) => ({
        productId: product.id,
        url: `/prekes/${item.image}-${variant}.svg`,
        alt: `${item.name} – nuotrauka ${variant}`,
        sortOrder: variant - 1,
      })),
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: item.sizes.map((variant, variantIndex) => ({
        productId: product.id,
        size: variant.size,
        stock: variant.stock,
        sku: `VEJ-${String(index + 1).padStart(4, "0")}-${variant.size}`,
        sortOrder: variantIndex,
      })),
    });
  }
  console.log(`Prekių: ${PRODUCTS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
