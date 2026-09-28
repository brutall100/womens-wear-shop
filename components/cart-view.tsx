"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties } from "react";
import { CART_EVENT, readCart, writeCart, type CartLine } from "@/lib/cart";
import { MAX_QTY } from "@/lib/checkout";
import { formatEur } from "@/lib/money";
import { asset, routes } from "@/lib/routes";
import { ArrowIcon, MinusIcon, PlusIcon, SewingButtonIcon, TrashIcon } from "./icons";

let cached: { raw: string | null; lines: CartLine[] } = { raw: null, lines: [] };

/** The cart as a stable snapshot for React (re-read only when storage changes). */
function snapshot(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem("mot-cart");
  } catch {
    raw = null;
  }
  if (raw !== cached.raw) cached = { raw, lines: readCart() };
  return cached.lines;
}

function subscribe(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY: CartLine[] = [];

export function useCart(): CartLine[] | null {
  const lines = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return hydrated ? lines : null;
}

export function CartView({ freeShippingCents }: { freeShippingCents: number }) {
  const lines = useCart();

  if (!lines) {
    return (
      <div className="mt-8 grid gap-4" aria-busy="true">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="pattern-card mt-8 max-w-xl text-center">
        <SewingButtonIcon size={44} className="mx-auto text-accent-ink" />
        <h2 className="mt-4 text-3xl">Krepšelis tuščias</h2>
        <p className="mt-2 text-muted">Išsirinkite ką nors iš katalogo – krepšelis palauks.</p>
        <Link href={routes.catalog} className="btn btn-primary mt-6">
          Į katalogą <ArrowIcon size={18} />
        </Link>
      </div>
    );
  }

  const update = (line: CartLine, qty: number) => {
    const next = lines.map((item) =>
      item.productId === line.productId && item.size === line.size ? { ...item, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : item,
    );
    writeCart(next);
  };
  const remove = (line: CartLine) => writeCart(lines.filter((item) => !(item.productId === line.productId && item.size === line.size)));

  const total = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const missing = Math.max(0, freeShippingCents - total);
  const progress = freeShippingCents > 0 ? Math.min(1, total / freeShippingCents) : 1;

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="panel divide-y divide-dashed divide-line px-4 sm:px-6">
        {lines.map((line) => {
          const qtyId = `qty-${line.productId}-${line.size}`;
          return (
            <li key={`${line.productId}-${line.size}`} className="flex gap-4 py-5">
              <Link
                href={routes.product(line.slug)}
                className="block h-28 w-21 shrink-0 overflow-hidden rounded-[10px] bg-surface-2"
                tabIndex={-1}
                aria-hidden="true"
              >
                {line.image ? <img src={asset(line.image)} alt="" width={84} height={112} loading="lazy" className="h-full w-full object-cover" /> : null}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Link href={routes.product(line.slug)} className="font-display text-xl font-semibold leading-tight hover:text-accent-ink">
                    {line.name}
                  </Link>
                  <p className="price">{formatEur(line.priceCents * line.qty)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Dydis {line.size} · {formatEur(line.priceCents)} / vnt.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="sr-only" htmlFor={qtyId}>
                    Kiekis: {line.name}
                  </label>
                  <div className="stepper">
                    <button type="button" aria-label="Mažiau" disabled={line.qty <= 1} onClick={() => update(line, line.qty - 1)}>
                      <MinusIcon size={16} />
                    </button>
                    <input
                      id={qtyId}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_QTY}
                      value={line.qty}
                      onChange={(event) => update(line, Number(event.target.value) || 1)}
                    />
                    <button type="button" aria-label="Daugiau" disabled={line.qty >= MAX_QTY} onClick={() => update(line, line.qty + 1)}>
                      <PlusIcon size={16} />
                    </button>
                  </div>
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => remove(line)}>
                    <TrashIcon size={16} /> Pašalinti
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="pattern-card lg:sticky lg:top-28" aria-label="Suma">
        <p className="text-sm text-muted">Suma krepšelyje</p>
        <p className="price mt-1 text-4xl">{formatEur(total)}</p>
        <div className="mt-5">
          <div className="progress" role="img" aria-label={missing > 0 ? `Iki nemokamo pristatymo liko ${formatEur(missing)}` : "Pristatymas nemokamas"}>
            <div className="progress__bar" style={{ "--value": progress } as CSSProperties} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {missing > 0 ? `Iki nemokamo pristatymo liko ${formatEur(missing)}.` : "Pristatymas bus nemokamas."}
          </p>
        </div>
        <Link href={routes.checkout} className="btn btn-primary btn-block mt-6">
          Atsiskaityti <ArrowIcon size={18} />
        </Link>
        <p className="mt-4 text-xs text-muted">Galutinę sumą su pristatymu matysite atsiskaitydami.</p>
      </aside>
    </div>
  );
}
