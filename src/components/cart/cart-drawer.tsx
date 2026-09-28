"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";
import { QuantityControl } from "./quantity-control";
import { formatPrice } from "@/lib/format";
import { store } from "@/config/store";

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      className="relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-sand"
      aria-label={`Krepšelis, prekių: ${count}`}
    >
      <BagIcon />
      <span className="hidden sm:inline">Krepšelis</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { items, isOpen, setOpen, subtotal, setQuantity, remove } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, setOpen]);

  const remaining = store.freeShippingFrom - subtotal;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Krepšelis"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl">Jūsų krepšelis</h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label="Uždaryti">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted">Krepšelis tuščias.</p>
            <Link href="/parduotuve" className="btn-outline">
              Žiūrėti prekes
            </Link>
          </div>
        ) : (
          <>
            {subtotal > 0 && (
              <div className="border-b border-line bg-sand/60 px-6 py-3 text-xs text-muted">
                {remaining > 0 ? (
                  <>
                    Iki nemokamo pristatymo trūksta <strong className="text-ink">{formatPrice(remaining)}</strong>
                  </>
                ) : (
                  <strong className="text-ink">Jums taikomas nemokamas pristatymas</strong>
                )}
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link href={`/preke/${item.slug}`} className="relative h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/preke/${item.slug}`} className="font-medium hover:underline">
                        {item.name}
                      </Link>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <span className="mt-0.5 text-sm text-muted">Dydis: {item.size}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <QuantityControl
                        value={item.quantity}
                        max={item.stock}
                        onChange={(q) => setQuantity(item.variantId, q)}
                      />
                      <button onClick={() => remove(item.variantId)} className="text-xs text-muted underline hover:text-accent">
                        Pašalinti
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line px-6 py-5">
              <div className="flex justify-between text-base">
                <span>Tarpinė suma</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted">Pristatymo kaina apskaičiuojama atsiskaitant. Kainos nurodytos su PVM.</p>
              <Link href="/apmokejimas" className="btn-primary w-full">
                Pereiti prie apmokėjimo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}
