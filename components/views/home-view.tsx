import Link from "next/link";
import type { CSSProperties } from "react";
import { CountUp } from "@/components/count-up";
import { ArrowIcon, BankIcon, NeedleIcon, SewingButtonIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { countByCategory } from "@/lib/catalog";
import { plural } from "@/lib/money";
import { asset, routes } from "@/lib/routes";
import type { Product, ShopConfig } from "@/lib/types";

const STEPS = [
  {
    icon: NeedleIcon,
    title: "Išsirenkate",
    text: "Kiekvieną modelį aprašome lietuviškai: audinys, kirpimas ir su kuo dera.",
  },
  {
    icon: BankIcon,
    title: "Apmokate per SEB",
    text: "Nukreipsime į SEB interneto banką, pavedimas bus jau užpildytas. Matome, kai mokėjimas patvirtintas.",
  },
  {
    icon: TruckIcon,
    title: "Siunčiame",
    text: "LP Express, Omniva paštomatu arba kurjeriu visoje Lietuvoje.",
  },
];

/** Home page. `products` are the published ones, newest first. */
export function HomeView({ products, categories, shop }: { products: Product[]; categories: string[]; shop: ShopConfig }) {
  const latest = products.slice(0, 4);
  const counts = countByCategory(products);
  const freeFrom = Math.round(shop.freeShippingCents / 100);

  return (
    <>
      <section className="container-page grid items-center gap-14 pb-16 pt-8 sm:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pt-16">
        <div className="pattern-card">
          <p className="eyebrow">Moteriški drabužiai · Lietuva</p>
          <h1 className="mt-5 text-[clamp(2.75rem,7vw,5.4rem)]">
            Drabužiai, kurie <em className="font-medium text-accent-ink">lieka.</em>
          </h1>
          <p className="mt-6 max-w-[34ch] text-lg text-muted">
            Nedidelė linija vienai rinkai. Aiškios kainos, lietuviški aprašymai ir mokėjimas per SEB.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={routes.catalog} className="btn btn-primary">
              <SewingButtonIcon className="spin-on-hover" />
              Žiūrėti katalogą
            </Link>
            <Link href="/#kaip-dirbame" className="btn btn-ghost">
              Kaip dirbame
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-3 gap-3 border-t border-dashed border-line pt-6">
            <li>
              <p className="stat__value">
                <CountUp value={products.length} />
              </p>
              <p className="stat__label">{plural(products.length, ["modelis", "modeliai", "modelių"])} kolekcijoje</p>
            </li>
            <li>
              <p className="stat__value">
                <CountUp value={categories.length} />
              </p>
              <p className="stat__label">{plural(categories.length, ["kategorija", "kategorijos", "kategorijų"])}</p>
            </li>
            <li>
              <p className="stat__value">
                <CountUp value={freeFrom} suffix=" €" />
              </p>
              <p className="stat__label">nemokamas pristatymas nuo</p>
            </li>
          </ul>
        </div>

        <div className="hero-photo">
          <span className="hero-photo__pin" aria-hidden="true" />
          <div className="hero-photo__frame">
            <img
              src={asset("/images/hero.webp")}
              alt="Moteris su apvaliais akiniais nuo saulės ir žaliu nėriniuotu topu prie geltonos sienos"
              width={1000}
              height={1250}
              fetchPriority="high"
            />
          </div>
          <Link href={routes.catalog} className="tag-wrap" aria-label="Rudens kolekcija – žiūrėti katalogą">
            <div className="tag">
              <p className="tag__cat">Kolekcija</p>
              <p className="tag__name">Ruduo 2026</p>
              <p className="tag__price">
                {products.length} {plural(products.length, ["modelis", "modeliai", "modelių"])} →
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="naujienos">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Naujausi modeliai</p>
            <h2 id="naujienos" className="mt-3 text-4xl sm:text-5xl">
              Šiuo metu parduotuvėje
            </h2>
          </div>
          <Link href={routes.catalog} className="btn btn-ghost btn-sm">
            Visos prekės <ArrowIcon size={18} />
          </Link>
        </div>
        <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((product, index) => (
            <div key={product.id} data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="kategorijos" data-reveal>
        <h2 id="kategorijos" className="stitched-heading text-3xl">
          Rinkitės pagal kategoriją
        </h2>
        <ul className="mt-7 flex flex-wrap gap-3">
          {categories.map((category) => (
            <li key={category}>
              <Link href={routes.category(category)} className="chip">
                {category}
                <span className="chip__count">{counts[category] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="kaip-dirbame" className="container-page scroll-mt-28 py-16" aria-labelledby="kaip-dirbame-title">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="hero-photo lg:mt-24" data-reveal>
            <div className="hero-photo__frame hero-photo__frame--landscape">
              <img
                src={asset("/images/studio.webp")}
                alt="Drabužių kabyklos jaukioje parduotuvėje"
                width={1000}
                height={667}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div data-reveal>
            <p className="eyebrow">Kaip dirbame</p>
            <h2 id="kaip-dirbame-title" className="mt-3 text-4xl sm:text-5xl">
              Viena parduotuvė, viena kalba.
            </h2>
            <p className="mt-5 max-w-xl text-muted">
              MOT skirta Lietuvos pirkėjoms. Prekes, kainas ir aprašymus keliame pačios. Nuo {freeFrom} € pristatome nemokamai.
            </p>
            <ol className="mt-8 grid gap-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="pattern-card pattern-card--flat flex gap-4 !p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-dashed border-line text-accent-ink">
                    <step.icon size={22} />
                  </span>
                  <div>
                    <p className="step-number">0{index + 1}</p>
                    <h3 className="text-xl">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
