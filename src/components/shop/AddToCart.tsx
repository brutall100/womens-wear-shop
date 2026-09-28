"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
  };
  variants: Variant[];
}

export function AddToCart({ product, variants }: Props) {
  const { addItem, items } = useCart();
  const available = variants.filter((v) => v.stock > 0);
  const [selected, setSelected] = useState<string | null>(
    available.length === 1 ? available[0].id : null,
  );
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.id === selected) ?? null;
  const inCart = selectedVariant ? items.find((i) => i.variantId === selectedVariant.id)?.quantity ?? 0 : 0;
  const soldOut = available.length === 0;

  function handleAdd() {
    if (!selectedVariant) {
      setError("Pasirinkite dydį.");
      return;
    }
    if (inCart >= selectedVariant.stock) {
      setError(`Krepšelyje jau yra visas turimas kiekis (${selectedVariant.stock} vnt.).`);
      return;
    }
    setError(null);
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: selectedVariant.size,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      maxQuantity: selectedVariant.stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label mb-0">Dydis</span>
        {selectedVariant && (
          <span className="text-xs text-ink-muted">
            {selectedVariant.stock <= 3 ? `Liko ${selectedVariant.stock} vnt.` : "Yra sandėlyje"}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((v) => {
          const disabled = v.stock <= 0;
          const active = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelected(v.id);
                setError(null);
              }}
              className={`min-w-14 rounded-full border px-4 py-2.5 text-sm transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : disabled
                    ? "cursor-not-allowed border-ink/10 text-ink-muted line-through"
                    : "border-ink/20 bg-white hover:border-ink"
              }`}
              aria-pressed={active}
            >
              {v.size}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleAdd} disabled={soldOut} className="btn-primary flex-1">
          {soldOut ? "Išparduota" : added ? "Įdėta į krepšelį ✓" : "Į krepšelį"}
        </button>
        {added && (
          <Link href="/krepselis" className="btn-outline flex-1">
            Peržiūrėti krepšelį
          </Link>
        )}
      </div>
    </div>
  );
}
