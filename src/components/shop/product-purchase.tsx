"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { buttonClass, cn } from "@/lib/ui";

export type PurchaseVariant = { size: string; stock: number };

export function ProductPurchase({
  productId,
  slug,
  name,
  priceCents,
  imageUrl,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  variants: PurchaseVariant[];
}) {
  const { addItem } = useCart();
  const available = variants.filter((variant) => variant.stock > 0);
  const [selected, setSelected] = useState<string | null>(
    available.length === 1 ? available[0].size : null,
  );
  const [error, setError] = useState<string | null>(null);

  const selectedVariant = variants.find((variant) => variant.size === selected);
  const soldOut = available.length === 0;

  function handleAdd() {
    if (!selected || !selectedVariant) {
      setError("Pasirinkite dydį");
      return;
    }
    setError(null);
    addItem({
      productId,
      slug,
      name,
      size: selected,
      priceCents,
      imageUrl,
      quantity: 1,
      stock: selectedVariant.stock,
    });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Dydis</span>
        <a href="#dydziu-lentele" className="text-[11px] text-muted link-underline">
          Dydžių lentelė
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const disabled = variant.stock <= 0;
          return (
            <button
              key={variant.size}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelected(variant.size);
                setError(null);
              }}
              className={cn(
                "min-w-12 border px-3.5 py-2 text-xs transition-colors",
                disabled
                  ? "border-line text-muted/50 line-through cursor-not-allowed"
                  : "cursor-pointer",
                !disabled && selected === variant.size
                  ? "border-ink bg-ink text-cream"
                  : !disabled && "border-line bg-shell hover:border-ink",
              )}
            >
              {variant.size}
            </button>
          );
        })}
      </div>

      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
        <p className="mt-3 text-xs text-clay">
          Liko tik {selectedVariant.stock} vnt.
        </p>
      )}

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className={buttonClass("primary", "lg", "mt-6 w-full")}
      >
        {soldOut ? "Išparduota" : "Į krepšelį"}
      </button>

      <p className="mt-3 text-center text-[11px] text-muted">
        Nemokamas pristatymas nuo 60 € · Grąžinimas per 14 dienų
      </p>
    </div>
  );
}
