"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CART_EVENT, cartCount, readCart } from "@/lib/cart";
import { isDemo, routes } from "@/lib/routes";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

function subscribeCart(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function useCartCount(): number {
  return useSyncExternalStore(subscribeCart, () => cartCount(readCart()), () => 0);
}

export function SiteHeader({ featured, categories }: { featured: string[]; categories: string[] }) {
  const pathname = usePathname();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const open = menuFor === pathname;
  const count = useCartCount();
  const badge = useRef<HTMLSpanElement>(null);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current && badge.current) {
      badge.current.classList.remove("is-popping");
      void badge.current.offsetWidth;
      badge.current.classList.add("is-popping");
    }
    previous.current = count;
  }, [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="container-page flex h-[72px] items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="btn btn-ghost btn-icon lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
          onClick={() => setMenuFor(open ? null : pathname)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link href={routes.home} className="logo" aria-label="MOT – į pradžią">
          MOT
        </Link>
        {isDemo ? (
          <span className="badge badge--preparing hidden sm:inline-flex" title="Duomenys saugomi tik jūsų naršyklėje">
            demo
          </span>
        ) : null}
        <nav aria-label="Pagrindinis meniu" className="ml-4 hidden items-center gap-6 lg:flex">
          <Link href={routes.catalog} className="nav-link" aria-current={current(routes.catalog)}>
            Katalogas
          </Link>
          {featured.map((category) => (
            <Link key={category} href={routes.category(category)} className="nav-link hidden xl:inline-flex">
              {category}
            </Link>
          ))}
          <Link href="/#kaip-dirbame" className="nav-link">
            Kaip dirbame
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Form action={routes.catalog} role="search" className="hidden items-center gap-1 md:flex">
            <label htmlFor="header-search" className="sr-only">
              Ieškoti prekių
            </label>
            <input id="header-search" name="q" type="search" placeholder="Ieškoti…" className="input h-11 min-h-11 w-40 xl:w-52" />
            <button type="submit" className="btn btn-ghost btn-icon" aria-label="Ieškoti">
              <SearchIcon />
            </button>
          </Form>
          <ThemeToggle />
          <Link href={routes.cart} className="btn btn-ghost btn-sm gap-2 pr-2" aria-label={`Krepšelis, prekių: ${count}`} data-cart-target>
            <BagIcon />
            <span className="hidden sm:inline">Krepšelis</span>
            <span ref={badge} className="cart-count" aria-hidden="true">
              {count}
            </span>
          </Link>
        </div>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t border-line lg:hidden">
          <div className="container-page grid gap-5 py-5">
            <Form action={routes.catalog} role="search" className="flex gap-2">
              <label htmlFor="mobile-search" className="sr-only">
                Ieškoti prekių
              </label>
              <input id="mobile-search" name="q" type="search" placeholder="Ieškoti prekių…" className="input" />
              <button type="submit" className="btn btn-ghost btn-icon shrink-0" aria-label="Ieškoti">
                <SearchIcon />
              </button>
            </Form>
            <nav aria-label="Mobilus meniu">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href={routes.catalog} className="chip" aria-current={current(routes.catalog)}>
                    Visos prekės
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category}>
                    <Link href={routes.category(category)} className="chip">
                      {category}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/#kaip-dirbame" className="chip">
                    Kaip dirbame
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
