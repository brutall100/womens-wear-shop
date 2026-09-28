"use client";

import Image from "next/image";
import { useState } from "react";

interface Img {
  id: string;
  url: string;
  alt: string;
}

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-3xl bg-sand text-ink-muted">
        Nėra nuotraukos
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-3xl bg-sand">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl border-2 transition lg:w-full ${
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Nuotrauka ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
