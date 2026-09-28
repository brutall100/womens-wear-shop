"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, writeCart, type CartLine } from "@/lib/cart";
import { formatEur } from "@/lib/money";

export function CartView() {
  const [lines, setLines] = useState<CartLine[] | null>(null);

  useEffect(() => {
    setLines(readCart());
  }, []);

  if (!lines) return <p className="mt-8 text-muted">Krepšelis kraunamas.</p>;

  const total = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);

  if (lines.length === 0) {
    return (
      <div className="mt-10 border border-line bg-card p-8">
        <p>Krepšelis tuščias.</p>
        <Link href="/katalogas" className="mt-4 inline-block h-11 bg-ink px-5 leading-[2.75rem] text-sm text-paper">
          Į katalogą
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={`${line.productId}-${line.size}`} className="flex gap-4 py-5">
            <Link href={`/preke/${line.slug}`} className="block h-28 w-20 shrink-0 bg-paper-2">
              {line.image ? <img src={line.image} alt="" className="h-full w-full object-cover" /> : null}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/preke/${line.slug}`} className="font-serif text-2xl leading-tight hover:underline">
                {line.name}
              </Link>
              <p className="mt-1 text-sm text-muted">Dydis {line.size}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="text-sm" htmlFor={`qty-${line.productId}-${line.size}`}>
                  Kiekis
                </label>
                <input
                  id={`qty-${line.productId}-${line.size}`}
                  type="number"
                  min={1}
                  max={9}
                  value={line.qty}
                  onChange={(event) => {
                    const qty = Math.max(1, Number(event.target.value) || 1);
                    const next = lines.map((item) =>
                      item.productId === line.productId && item.size === line.size ? { ...item, qty } : item,
                    );
                    setLines(next);
                    writeCart(next);
                  }}
                  className="h-11 w-20 border border-line bg-card px-3"
                />
                <button
                  type="button"
                  className="h-11 px-2 text-sm underline"
                  onClick={() => {
                    const next = lines.filter((item) => !(item.productId === line.productId && item.size === line.size));
                    setLines(next);
                    writeCart(next);
                  }}
                >
                  Pašalinti
                </button>
              </div>
            </div>
            <p className="num text-sm">{formatEur(line.priceCents * line.qty)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-line bg-card p-5">
        <p className="text-sm text-muted">Suma krepšelyje</p>
        <p className="num mt-1 font-serif text-4xl">{formatEur(total)}</p>
        <p className="mt-3 text-sm text-muted">Pristatymas paskaičiuojamas atsiskaitant. Galutinę sumą patvirtina parduotuvė.</p>
        <Link href="/atsiskaitymas" className="mt-5 block h-12 bg-ink text-center text-sm leading-[3rem] text-paper">
          Atsiskaityti
        </Link>
      </aside>
    </div>
  );
}
