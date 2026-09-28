"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

export function Header({ categories }: { categories: string[] }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sync = () => setCount(readCart().reduce((sum, line) => sum + line.qty, 0));
    sync();
    window.addEventListener("mot-cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mot-cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-none">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 py-4">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="pagrindinis-meniu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Uždaryti meniu" : "Atidaryti meniu"}</span>
          <span aria-hidden className="block h-px w-4 bg-ink" />
          <span aria-hidden className="mt-1.5 block h-px w-4 bg-ink" />
        </button>
        <Link href="/" className="font-serif text-3xl tracking-[0.18em]">
          MOT
        </Link>
        <Link href="/katalogas" className="ml-8 hidden text-sm hover:underline lg:inline xl:hidden">
          Katalogas
        </Link>
        <nav className="ml-8 hidden items-center gap-5 text-sm xl:flex" aria-label="Katalogas">
          <Link href="/katalogas" className="hover:underline">
            Visos prekės
          </Link>
          {categories.map((category) => (
            <Link key={category} href={`/katalogas?kategorija=${encodeURIComponent(category)}`} className="hover:underline">
              {category}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form action="/katalogas" className="hidden items-center sm:flex" role="search">
            <label htmlFor="paieska" className="sr-only">
              Ieškoti prekių
            </label>
            <input
              id="paieska"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ieškoti"
              className="h-11 w-36 border border-line bg-card px-3 text-sm outline-none md:w-48"
            />
            <button type="submit" className="h-11 border border-l-0 border-line bg-card px-3 text-sm">
              Ieškoti
            </button>
          </form>
          <Link href="/krepselis" className="grid h-11 min-w-11 place-items-center border border-line px-3 text-sm">
            Krepšelis
            <span className="num ml-2">{count}</span>
          </Link>
        </div>
      </div>
      {open ? (
        <nav id="pagrindinis-meniu" className="border-t border-line px-5 py-4 lg:hidden" aria-label="Mobilus meniu">
          <form action="/katalogas" className="mb-4" role="search">
            <label htmlFor="paieska-mobile" className="mb-1 block text-sm">
              Ieškoti
            </label>
            <input id="paieska-mobile" name="q" className="h-11 w-full border border-line bg-card px-3" />
          </form>
          <ul className="grid gap-1">
            <li>
              <Link href="/katalogas" className="block py-2" onClick={() => setOpen(false)}>
                Visos prekės
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/katalogas?kategorija=${encodeURIComponent(category)}`}
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
