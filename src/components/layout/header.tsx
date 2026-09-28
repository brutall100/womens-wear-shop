"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { site } from "@/lib/site";
import { cn } from "@/lib/ui";
import { formatPrice } from "@/lib/money";

export type HeaderCategory = { name: string; slug: string };

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const pathname = usePathname();
  const { count, setDrawerOpen, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/parduotuve", label: "Visos prekės" },
    ...categories.map((category) => ({
      href: `/parduotuve?kategorija=${category.slug}`,
      label: category.name,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-line">
      <div className="bg-ink text-cream">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] tracking-[0.16em] uppercase">
          Nemokamas pristatymas užsakymams nuo{" "}
          {formatPrice(site.freeShippingFromCents)}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4">
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Meniu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden justify-self-start p-1 text-ink cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              ) : (
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              )}
            </svg>
          </button>

          <Link
            href="/"
            className="justify-self-center font-display text-3xl tracking-[0.3em] pl-[0.3em] leading-none"
          >
            {site.name}
          </Link>

          <div className="justify-self-end flex items-center gap-5">
            <Link
              href="/parduotuve"
              aria-label="Ieškoti prekių"
              className="hidden sm:block text-muted hover:text-ink transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative text-ink hover:text-clay transition-colors cursor-pointer"
              aria-label="Atidaryti krepšelį"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16l-1.2 13H5.2L4 7Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M9 7V5.6A3 3 0 0 1 12 3a3 3 0 0 1 3 2.6V7"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              {ready && count > 0 && (
                <span className="absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-clay text-cream text-[10px] font-medium flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-line bg-cream">
          <ul className="mx-auto max-w-7xl px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block py-2.5 text-sm tracking-wide text-ink border-b border-line/60 last:border-0",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/pristatymas" className="block py-2.5 text-sm text-muted">
                Pristatymas ir grąžinimas
              </Link>
            </li>
            <li>
              <Link href="/kontaktai" className="block py-2.5 text-sm text-muted">
                Kontaktai
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
