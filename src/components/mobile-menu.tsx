"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileMenu({ categories }: { categories: { name: string; slug: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen((o) => !o)} className="-ml-2 rounded-full p-2 hover:bg-sand" aria-label="Meniu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-16 border-b border-line bg-cream px-4 py-4 shadow-lg"
        >
          <Link href="/parduotuve" className="block py-2.5 font-medium">
            Visos prekės
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/kategorija/${c.slug}`} className="block py-2.5">
              {c.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
