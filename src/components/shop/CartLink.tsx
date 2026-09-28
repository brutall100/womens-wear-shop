"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/krepselis"
      className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-cream-dark hover:text-ink"
      aria-label="Krepšelis"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
        <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Krepšelis</span>
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
