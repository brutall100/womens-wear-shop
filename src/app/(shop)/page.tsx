import Link from "next/link";
import { prisma } from "@/lib/db";
import { shopConfig } from "@/lib/config";
import { formatEur } from "@/lib/format";
import { ProductCard } from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

const productInclude = {
  images: { orderBy: { position: "asc" as const }, take: 1 },
  category: true,
  variants: { select: { stock: true } },
};

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      where: { products: { some: { isActive: true } } },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
  ]);

  const featuredList = featured.length > 0 ? featured : latest.slice(0, 4);
  const freeFrom = shopConfig.shipping.freeFrom;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">Naujoji kolekcija</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
              Drabužiai, kuriuose <em className="italic text-rose">norisi būti</em> kiekvieną dieną.
            </h1>
            <p className="mt-6 max-w-lg text-base text-ink-soft sm:text-lg">
              Kuruota moteriškų drabužių kolekcija iš natūralių audinių. Pristatymas visoje Lietuvoje
              {freeFrom > 0 && <> – nemokamai nuo {formatEur(freeFrom)}</>}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/prekes" className="btn-primary">Žiūrėti kolekciją</Link>
              {categories[0] && (
                <Link href={`/prekes?kategorija=${categories[0].slug}`} className="btn-outline">
                  {categories[0].name}
                </Link>
              )}
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-sm">
              <div>
                <dt className="text-ink-muted">Pristatymas</dt>
                <dd className="mt-1 font-medium">1–3 d. d.</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Grąžinimas</dt>
                <dd className="mt-1 font-medium">14 dienų</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Apmokėjimas</dt>
                <dd className="mt-1 font-medium">SEB, kortelės</dd>
              </div>
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            {featuredList.slice(0, 2).map((p, i) => (
              <div key={p.id} className={i === 1 ? "mt-10" : ""}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Kategorijos</p>
              <h2 className="mt-2 font-display text-4xl font-medium">Rinkitės pagal nuotaiką</h2>
            </div>
          </div>
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/prekes?kategorija=${c.slug}`}
                className="shrink-0 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm transition hover:border-ink hover:bg-ink hover:text-cream"
              >
                {c.name} <span className="ml-1 text-ink-muted">{c._count.products}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Naujienos</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Naujausios prekės</h2>
          </div>
          <Link href="/prekes" className="hidden text-sm text-ink-soft underline-offset-4 hover:underline sm:inline">
            Visos prekės →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {latest.length === 0 && (
          <p className="mt-8 text-ink-soft">Prekių dar nėra. Pridėkite jas administravimo panelėje.</p>
        )}
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-ink px-6 py-12 text-cream sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Saugus apmokėjimas</p>
            <h2 className="mt-3 font-display text-3xl font-medium sm:text-4xl">
              Atsiskaitykite per SEB ar kitą banką, kortele, Apple Pay ar Google Pay
            </h2>
            <p className="mt-3 max-w-xl text-sm text-cream/70">
              Mokėjimai apdorojami SEB banko e. prekybos platformoje – jūsų duomenys niekada nepasiekia mūsų serverių.
            </p>
          </div>
          <Link href="/prekes" className="btn mt-6 bg-cream text-ink hover:bg-white lg:mt-0">
            Pradėti apsipirkti
          </Link>
        </div>
      </section>
    </>
  );
}
