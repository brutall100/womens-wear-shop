"use client";

import Link from "next/link";
import { useState } from "react";
import { addLine } from "@/lib/cart";
import { formatEur } from "@/lib/money";

export function AddToCart({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    sizes: string[];
    stock: number;
    image: string;
  };
}) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");

  const unavailable = product.stock < 1 || product.sizes.length === 0;

  return (
    <form
      className="mt-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (!size) {
          setMessage("Pasirinkite dydį.");
          return;
        }
        addLine({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          size,
          qty,
          image: product.image,
        });
        setMessage("Įdėta į krepšelį.");
      }}
    >
      <fieldset>
        <legend className="text-sm">Dydis</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((option) => {
            const active = option === size;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setSize(option)}
                className={`h-11 min-w-11 border px-3 text-sm ${active ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5">
        <label htmlFor="kiekis" className="text-sm">
          Kiekis
        </label>
        <input
          id="kiekis"
          type="number"
          min={1}
          max={Math.max(product.stock, 1)}
          value={qty}
          onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
          className="mt-2 h-11 w-24 border border-line bg-card px-3"
        />
      </div>
      <button
        type="submit"
        disabled={unavailable}
        className="mt-6 h-12 w-full bg-ink px-6 text-sm text-paper sm:w-auto"
      >
        {unavailable ? "Šiuo metu nėra" : `Į krepšelį · ${formatEur(product.priceCents)}`}
      </button>
      <p className="mt-3 min-h-6 text-sm" aria-live="polite">
        {message ? (
          <>
            {message}{" "}
            <Link href="/krepselis" className="underline">
              Atidaryti krepšelį
            </Link>
          </>
        ) : (
          `Likutis: ${product.stock}`
        )}
      </p>
    </form>
  );
}
