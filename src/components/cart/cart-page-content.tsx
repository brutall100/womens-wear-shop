"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/money";
import { site } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export function CartPageContent() {
  const { items, ready, subtotalCents, setQuantity, removeItem } = useCart();

  if (!ready) {
    return <p className="mt-10 text-sm text-muted">Kraunama…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 border border-line bg-shell px-6 py-20 text-center">
        <p className="text-lg">Krepšelis tuščias</p>
        <p className="mt-2 text-sm text-muted">
          Peržiūrėkite kolekciją ir pasirinkite tai, kas patinka.
        </p>
        <Link href="/parduotuve" className={buttonClass("primary", "lg", "mt-7")}>
          Į parduotuvę
        </Link>
      </div>
    );
  }

  const shippingNote = site.freeShippingFromCents - subtotalCents;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="border-t border-line">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size}`}
            className="flex gap-5 border-b border-line py-5"
          >
            <Link
              href={`/preke/${item.slug}`}
              className="relative h-36 w-[108px] shrink-0 overflow-hidden bg-sand"
            >
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="108px"
                  className="object-cover"
                />
              )}
            </Link>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/preke/${item.slug}`} className="text-[15px] hover:text-clay">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">Dydis: {item.size}</p>
                  <p className="mt-1 text-xs text-muted">
                    Vieneto kaina: {formatPrice(item.priceCents)}
                  </p>
                </div>
                <span className="text-[15px]">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-4">
                <div className="flex items-center border border-line bg-shell">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                    className="px-3 py-1.5 text-muted hover:text-ink cursor-pointer"
                    aria-label="Mažinti kiekį"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.stock > 0 && item.quantity >= item.stock}
                    onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                    className="px-3 py-1.5 text-muted hover:text-ink cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Didinti kiekį"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-xs text-muted hover:text-danger cursor-pointer link-underline"
                >
                  Pašalinti
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-line bg-shell p-6 lg:sticky lg:top-32">
        <h2 className="text-xl">Suvestinė</h2>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Prekės</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Pristatymas</dt>
            <dd className="text-muted">skaičiuojamas toliau</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="eyebrow">Tarpinė suma</span>
          <span className="font-display text-2xl">{formatPrice(subtotalCents)}</span>
        </div>

        {shippingNote > 0 ? (
          <p className="mt-3 text-xs text-muted">
            Iki nemokamo pristatymo trūksta {formatPrice(shippingNote)}
          </p>
        ) : (
          <p className="mt-3 text-xs text-success">Pristatymas nemokamas</p>
        )}

        <Link href="/atsiskaitymas" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Atsiskaityti
        </Link>
        <Link
          href="/parduotuve"
          className="mt-3 block text-center text-xs text-muted link-underline hover:text-ink"
        >
          Tęsti apsipirkimą
        </Link>
      </aside>
    </div>
  );
}
