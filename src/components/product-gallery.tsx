"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/product-image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:w-20 sm:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:w-full ${
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Nuotrauka ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl bg-sand">
        <ProductImage src={images[active]} alt={name} sizes="(min-width: 1024px) 50vw, 100vw" priority />
      </div>
    </div>
  );
}
