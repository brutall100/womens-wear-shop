"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/ui";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-sand text-sm text-muted">
        Nuotraukos nėra
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Rodyti ${index + 1} nuotrauką`}
              aria-current={index === active}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden border bg-sand transition-colors cursor-pointer",
                index === active ? "border-ink" : "border-transparent hover:border-line",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-sand">
        <Image
          src={current.url}
          alt={current.alt ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
