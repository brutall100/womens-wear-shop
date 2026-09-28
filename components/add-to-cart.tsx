"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { addLine } from "@/lib/cart";
import { MAX_QTY } from "@/lib/checkout";
import { formatEur } from "@/lib/money";
import { routes } from "@/lib/routes";
import { flyToCart } from "./fly-to-cart";
import { BagIcon, MinusIcon, PlusIcon } from "./icons";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  sizes: string[];
  stock: number;
  image: string;
};

export function AddToCart({ product }: { product: CartProduct }) {
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const qtyId = useId();
  const max = Math.max(1, Math.min(product.stock, MAX_QTY));
  const unavailable = product.stock < 1 || product.sizes.length === 0;

  return (
    <form
      className="mt-8 grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!size) {
          setMessage({ text: "Pirmiausia pasirinkite dydį.", tone: "error" });
          return;
        }
        const added = addLine(
          { productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, size, qty, image: product.image },
          max,
        );
        const submitter = (event.nativeEvent as SubmitEvent).submitter ?? event.currentTarget;
        flyToCart(submitter);
        setMessage({
          text: added.clamped
            ? `Krepšelyje jau ${added.qty} vnt. – daugiau vienu kartu užsakyti negalima.`
            : "Įdėta į krepšelį.",
          tone: "ok",
        });
      }}
    >
      {product.sizes.length > 1 ? (
        <fieldset>
          <legend className="label">Dydis</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                className="size-option"
                aria-pressed={option === size}
                onClick={() => {
                  setSize(option);
                  setMessage(null);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-muted">Dydis: {product.sizes[0] ?? "–"}</p>
      )}

      <div className="field">
        <label htmlFor={qtyId} className="label">
          Kiekis
        </label>
        <div className="stepper w-fit">
          <button type="button" aria-label="Mažiau" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={qty <= 1}>
            <MinusIcon size={18} />
          </button>
          <input
            id={qtyId}
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={qty}
            onChange={(event) => setQty(Math.min(max, Math.max(1, Number(event.target.value) || 1)))}
          />
          <button type="button" aria-label="Daugiau" onClick={() => setQty((value) => Math.min(max, value + 1))} disabled={qty >= max}>
            <PlusIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={unavailable} className="btn btn-primary min-h-[54px] px-7 text-base">
          <BagIcon />
          {unavailable ? "Šiuo metu nėra" : `Į krepšelį · ${formatEur(product.priceCents * qty)}`}
        </button>
        <p className="text-sm text-muted">{product.stock > 0 ? `Liko ${product.stock} vnt.` : "Išparduota"}</p>
      </div>

      <p className="min-h-6 text-sm" aria-live="polite">
        {message ? (
          <span className={message.tone === "error" ? "text-danger" : undefined}>
            {message.text}{" "}
            {message.tone === "ok" ? (
              <Link href={routes.cart} className="link font-semibold">
                Atidaryti krepšelį
              </Link>
            ) : null}
          </span>
        ) : null}
      </p>
    </form>
  );
}
