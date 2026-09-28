"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type Variant = { id: string; size: string; stock: number };

export function AddToCart({
  product,
  variants,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  variants: Variant[];
}) {
  const { add, items } = useCart();
  const available = variants.filter((v) => v.stock > 0);
  const [selected, setSelected] = useState<string | null>(available.length === 1 ? available[0].id : null);
  const [error, setError] = useState(false);

  const variant = variants.find((v) => v.id === selected);
  const inCart = items.find((i) => i.variantId === selected)?.quantity ?? 0;
  const soldOut = available.length === 0;
  const maxed = variant ? inCart >= variant.stock : false;

  function handleAdd() {
    if (!variant) {
      setError(true);
      return;
    }
    add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      price: product.price,
      image: product.image,
      stock: variant.stock,
    });
  }

  return (
    <div>
      {variants.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="label !mb-0">Dydis</span>
            {variant && variant.stock <= 3 && (
              <span className="text-xs font-medium text-accent">Liko tik {variant.stock} vnt.</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSelected(v.id);
                    setError(false);
                  }}
                  className={`min-w-14 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    selected === v.id
                      ? "border-ink bg-ink text-cream"
                      : out
                        ? "cursor-not-allowed border-line text-stone-400 line-through"
                        : "border-line bg-white hover:border-ink"
                  }`}
                  aria-pressed={selected === v.id}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-2 text-sm text-accent">Pasirinkite dydį</p>}
        </div>
      )}

      <button onClick={handleAdd} disabled={soldOut || maxed} className="btn-primary mt-6 w-full py-4 text-base">
        {soldOut ? "Išparduota" : maxed ? "Visas likutis jau krepšelyje" : "Į krepšelį"}
      </button>
    </div>
  );
}
