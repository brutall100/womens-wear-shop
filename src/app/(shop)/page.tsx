import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-card";
import { prisma } from "@/lib/prisma";
import { getFeaturedProducts, getNewestProducts } from "@/lib/queries";
import { site } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

const VALUES = [
  {
    title: "Pristatymas visoje Lietuvoje",
    text: "Omniva, LP Express paštomatai arba kurjeris. Nemokamai nuo 60 €.",
  },
  {
    title: "Grąžinimas per 14 dienų",
    text: "Netiko dydis? Grąžinkite prekę nenurodydami priežasties.",
  },
  {
    title: "Saugus mokėjimas su SEB",
    text: "Atsiskaitykite el. bankininkyste – patvirtinimas gaunamas iškart.",
  },
];

export default async function HomePage() {
  const [featured, newest, categories] = await Promise.all([
    getFeaturedProducts(4),
    getNewestProducts(8),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
      select: { name: true, slug: true, description: true },
    }),
  ]);

  return (
    <>
      <section className="relative isolate">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <Image
            src="/prekes/hero.svg"
            alt="Rudens kolekcijos nuotrauka"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/35 via-ink/10 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4">
              <div className="max-w-xl text-cream">
                <p className="eyebrow text-cream/80">Rudens kolekcija 2026</p>
                <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
                  Drabužiai, kurie
                  <br />
                  lieka spintoje ilgiau
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/85">
                  Natūralūs audiniai, ramios spalvos ir ribotos partijos, siuvamos
                  Lietuvoje.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/parduotuve"
                    className={buttonClass("primary", "lg", "bg-cream text-ink hover:bg-clay hover:text-cream")}
                  >
                    Apžiūrėti kolekciją
                  </Link>
                  <Link
                    href="/parduotuve?kategorija=sukneles"
                    className={buttonClass(
                      "secondary",
                      "lg",
                      "border-cream/60 text-cream hover:bg-cream/10 hover:border-cream",
                    )}
                  >
                    Suknelės
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/parduotuve?kategorija=${category.slug}`}
              className="group border border-line bg-shell p-6 transition-colors hover:border-clay"
            >
              <h2 className="text-xl transition-colors group-hover:text-clay">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {category.description}
                </p>
              )}
              <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.16em] text-clay">
                Žiūrėti →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Mūsų pasirinkimas</p>
              <h2 className="mt-1.5 text-3xl">Sezono favoritai</h2>
            </div>
            <Link href="/parduotuve" className="link-underline text-sm text-muted hover:text-ink">
              Visos prekės
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      <section className="bg-sand">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/prekes/istorija.svg"
              alt="Siuvimo dirbtuvės"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-lg">
            <p className="eyebrow">Apie {site.name}</p>
            <h2 className="mt-3 text-4xl leading-tight">
              Mažos partijos, ilgas tarnavimas
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Kiekvieną modelį siuvame nedidelėmis partijomis mažoje siuvykloje
              Vilniuje. Renkamės linus, vilną ir viskozę iš Europos tiekėjų, o
              naujas spalvas pristatome tik tada, kai jos tikrai tinka prie to,
              ką jau turite.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Neturime iškrovų kas mėnesį – vietoje to siūlome sąžiningą kainą
              visus metus.
            </p>
            <Link href="/parduotuve" className={buttonClass("secondary", "lg", "mt-8")}>
              Susipažinti su kolekcija
            </Link>
          </div>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Ką tik atkeliavo</p>
              <h2 className="mt-1.5 text-3xl">Naujienos</h2>
            </div>
            <Link href="/parduotuve?rikiuoti=naujausios" className="link-underline text-sm text-muted hover:text-ink">
              Visos naujienos
            </Link>
          </div>
          <ProductGrid products={newest} />
        </section>
      )}

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title}>
              <h3 className="text-lg">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
