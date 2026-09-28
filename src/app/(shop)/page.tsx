import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { store } from "@/config/store";

export default async function HomePage() {
  const [featured, newest, categories] = await Promise.all([
    listProducts({ isFeatured: true }, undefined, 8),
    listProducts({}, "naujausios", 8),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        products: {
          where: { isActive: true, images: { some: {} } },
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-sand">
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-[#e3cfc0] opacity-70 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b8ad] opacity-40 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-24 sm:px-6 md:py-36">
          <span className="label !text-accent">Nauja kolekcija</span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] font-medium sm:text-7xl">
            Drabužiai, kuriuose jaučiatės savimi
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted sm:text-lg">{store.tagline}. Kruopščiai atrinkti modeliai, kokybiški audiniai ir greitas pristatymas visoje Lietuvoje.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/parduotuve" className="btn-primary">
              Apžiūrėti kolekciją
            </Link>
            {categories[0] && (
              <Link href={`/kategorija/${categories[0].slug}`} className="btn-outline">
                {categories[0].name}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-4 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          {[
            ["Pristatymas 1–3 d. d.", "Į paštomatus ir į namus"],
            ["14 dienų grąžinimas", "Be papildomų klausimų"],
            ["Saugūs mokėjimai", "Banko nuoroda ir kortelės per SEB"],
          ].map(([title, text]) => (
            <div key={title} className="px-2 py-5 text-center sm:py-6">
              <p className="font-semibold">{title}</p>
              <p className="text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <h2 className="font-serif text-4xl">Kategorijos</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id} href={`/kategorija/${c.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                  <ProductImage
                    src={c.products[0]?.images[0]?.url}
                    alt={c.name}
                    sizes="(min-width: 1024px) 16vw, 50vw"
                    className="transition duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 font-medium group-hover:underline">{c.name}</p>
                <p className="text-xs text-muted">{c._count.products} prekės</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <SectionHeader title="Rekomenduojame" />
          <ProductGrid products={featured} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <SectionHeader title="Naujienos" />
        <ProductGrid products={newest} />
      </section>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="font-serif text-4xl">{title}</h2>
      <Link href="/parduotuve" className="text-sm font-medium underline-offset-4 hover:underline">
        Visos prekės →
      </Link>
    </div>
  );
}
