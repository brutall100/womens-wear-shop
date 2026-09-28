import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { store } from "@/config/store";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartButton, CartDrawer } from "@/components/cart/cart-drawer";
import { MobileMenu } from "@/components/mobile-menu";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true },
  });

  return (
    <CartProvider>
      <div className="bg-ink py-2 text-center text-xs tracking-wide text-cream/90">
        Nemokamas pristatymas Lietuvoje užsakymams nuo {store.freeShippingFrom / 100} €
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <MobileMenu categories={categories} />
            <Link href="/" className="font-serif text-3xl font-semibold tracking-[0.2em]">
              {store.name}
            </Link>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            <Link href="/parduotuve" className="hover:text-accent">
              Visos prekės
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/kategorija/${c.slug}`} className="hover:text-accent">
                {c.name}
              </Link>
            ))}
          </nav>
          <CartButton />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-line bg-sand/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-3xl font-semibold tracking-[0.2em]">{store.name}</p>
            <p className="mt-3 max-w-sm text-sm text-muted">{store.tagline}</p>
          </div>
          <div>
            <p className="label">Informacija</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pristatymas-ir-grazinimas" className="hover:text-accent">
                  Pristatymas ir grąžinimas
                </Link>
              </li>
              <li>
                <Link href="/taisykles" className="hover:text-accent">
                  Pirkimo taisyklės
                </Link>
              </li>
              <li>
                <Link href="/privatumas" className="hover:text-accent">
                  Privatumo politika
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label">Kontaktai</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`mailto:${store.email}`} className="hover:text-accent">
                  {store.email}
                </a>
              </li>
              <li>
                <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {store.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
            <span>
              © {new Date().getFullYear()} {store.company.name}, įm. k. {store.company.code}, PVM k. {store.company.vatCode}
            </span>
            <span>Saugūs mokėjimai per SEB</span>
          </div>
        </div>
      </footer>
      <CartDrawer />
    </CartProvider>
  );
}
