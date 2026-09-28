import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listCategories, listProducts } from "@/lib/db";

export default function HomePage() {
  const products = listProducts({ publishedOnly: true }).slice(0, 4);
  const categories = listCategories();
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-end px-5 py-12 lg:px-16 lg:py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Moteriški drabužiai · Lietuva</p>
          <h1 className="mt-4 max-w-xl font-serif text-6xl leading-[0.95] sm:text-7xl">Drabužiai, kurie lieka.</h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Nedidelė linija vienai rinkai. Aiškios kainos, lietuviški aprašymai ir mokėjimas per SEB.
          </p>
          <Link href="/katalogas" className="mt-8 inline-flex h-12 w-fit items-center bg-ink px-6 text-sm text-paper">
            Žiūrėti katalogą
          </Link>
        </div>
        <div className="min-h-[70vh] bg-paper-2">
          <img src="/seed/hero.jpg" alt="Moteris su juoda suknele, žiūrinti į šoną" className="h-full max-h-[860px] w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl">Šiuo metu parduotuvėje</h2>
          <Link href="/katalogas" className="text-sm underline">
            Visos prekės
          </Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-line">
        <div className="mx-auto grid max-w-[1200px] gap-3 px-5 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/katalogas?kategorija=${encodeURIComponent(category)}`}
              className="flex h-16 items-center justify-between border border-line bg-card px-4 text-sm hover:border-ink"
            >
              {category}
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <img src="/seed/studija.jpg" alt="Drabužių kabykla su švarkais ir suknelėmis" className="aspect-[4/5] w-full object-cover" />
        <div>
          <h2 className="font-serif text-5xl leading-tight">Viena parduotuvė, viena kalba.</h2>
          <p className="mt-5 max-w-md text-muted">
            MOT skirta Lietuvos pirkėjoms. Prekes, kainas ir aprašymus keliame pačios. Užsakymą apmokate per SEB interneto banką, o mes matome, kai mokėjimas patvirtintas.
          </p>
        </div>
      </section>
    </>
  );
}
