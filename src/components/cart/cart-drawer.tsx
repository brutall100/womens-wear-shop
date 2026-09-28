"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/money";
import { site } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, subtotalCents, setQuantity, removeItem } =
    useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  const missingForFreeShipping = site.freeShippingFromCents - subtotalCents;

  return (
    <>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label="Pirkinių krepšelis"
        aria-hidden={!drawerOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg">Krepšelis</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Uždaryti krepšelį"
            className="p-1 text-muted hover:text-ink cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-muted text-sm">Jūsų krepšelis tuščias.</p>
            <Link
              href="/parduotuve"
              onClick={() => setDrawerOpen(false)}
              className={buttonClass("primary", "md")}
            >
              Apžiūrėti prekes
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 border-b border-line py-4 last:border-0"
                >
                  <Link
                    href={`/preke/${item.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="relative h-[104px] w-[78px] shrink-0 overflow-hidden bg-sand"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="78px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/preke/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-sm leading-snug hover:text-clay"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label="Pašalinti prekę"
                        className="text-muted hover:text-danger cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-muted">Dydis: {item.size}</p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line bg-shell">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="px-2.5 py-1 text-muted hover:text-ink cursor-pointer"
                          aria-label="Mažinti kiekį"
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={item.stock > 0 && item.quantity >= item.stock}
                          onClick={() =>
                            setQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="px-2.5 py-1 text-muted hover:text-ink cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Didinti kiekį"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              {missingForFreeShipping > 0 ? (
                <p className="mb-3 text-xs text-muted">
                  Iki nemokamo pristatymo trūksta{" "}
                  <strong className="text-ink">{formatPrice(missingForFreeShipping)}</strong>
                </p>
              ) : (
                <p className="mb-3 text-xs text-success">Pristatymas nemokamas</p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Tarpinė suma</span>
                <span className="font-display text-2xl">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Pristatymo kaina skaičiuojama atsiskaitymo žingsnyje.
              </p>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/atsiskaitymas"
                  onClick={() => setDrawerOpen(false)}
                  className={buttonClass("primary", "lg", "w-full")}
                >
                  Atsiskaityti
                </Link>
                <Link
                  href="/krepselis"
                  onClick={() => setDrawerOpen(false)}
                  className={buttonClass("secondary", "md", "w-full")}
                >
                  Peržiūrėti krepšelį
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
