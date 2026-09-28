"use client";

import { useState } from "react";
import { asset } from "@/lib/routes";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="tag-card__photo">
        <div className="tag-card__placeholder">{name}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="tag-card__photo">
        <img src={asset(current.path)} alt={name} width={720} height={960} fetchPriority="high" />
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Kitos nuotraukos">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                aria-label={`Nuotrauka ${index + 1}`}
                className="block aspect-[3/4] w-full overflow-hidden rounded-[10px] border-2 border-transparent bg-surface-2 transition aria-pressed:border-accent"
              >
                <img src={asset(image.path)} alt="" width={180} height={240} loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
