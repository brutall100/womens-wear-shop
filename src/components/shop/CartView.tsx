"use client";

import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/format";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, subtotalCents, hydrated, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-2xl bg-cream-dark" />;
  }

  if (items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="font-display text-2xl">Jūsų krepšelis tuščias</p>
        <p className="mt-2 text-sm text-ink-soft">Apsižvalgykite po kolekciją ir raskite tai, kas jums tinka.</p>
        <Link href="/prekes" className="btn-primary mt-6">Į parduotuvę</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <ul className="divide-y divide-ink/10 lg:col-span-8">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-5 sm:gap-6">
            <Link href={`/prekes/${item.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-sand">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" />
              )}
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/prekes/${item.slug}`} className="font-display text-lg leading-snug hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">Dydis: {item.size}</p>
                </div>
                <p className="font-medium">{formatEur(item.priceCents * item.quantity)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-ink-soft hover:text-ink"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    aria-label="Sumažinti kiekį"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-ink-soft hover:text-ink disabled:opacity-30"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    aria-label="Padidinti kiekį"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-sm text-ink-muted underline-offset-4 hover:text-danger hover:underline"
                >
                  Pašalinti
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:col-span-4">
        <div className="card sticky top-24 p-6">
          <h2 className="font-display text-2xl">Suvestinė</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Prekės</dt>
              <dd>{formatEur(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Pristatymas</dt>
              <dd className="text-ink-muted">apskaičiuojamas atsiskaitant</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-4">
            <span className="font-medium">Iš viso</span>
            <span className="text-lg font-medium">{formatEur(subtotalCents)}</span>
          </div>
          <Link href="/atsiskaitymas" className="btn-primary mt-6 w-full">
            Pereiti į atsiskaitymą
          </Link>
          <Link href="/prekes" className="btn-ghost mt-2 w-full text-sm">
            Tęsti apsipirkimą
          </Link>
        </div>
      </aside>
    </div>
  );
}
