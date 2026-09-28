import Link from "next/link";
import { formatEur } from "@/lib/money";
import type { Product } from "@/lib/db";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0]?.path;
  return (
    <article>
      <Link href={`/preke/${product.slug}`} className="group block">
        <div className="aspect-[3/4] overflow-hidden bg-paper-2">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center font-serif text-3xl">{product.name}</div>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{product.category}</p>
            <h2 className="mt-1 font-serif text-2xl leading-tight group-hover:underline">{product.name}</h2>
          </div>
          <p className="num shrink-0 text-sm">{formatEur(product.priceCents)}</p>
        </div>
      </Link>
    </article>
  );
}
