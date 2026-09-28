import Link from "next/link";
import { formatEur } from "@/lib/money";
import { asset, routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

/** A product photo with a clothing tag hanging from it. */
export function ProductCard({
  product,
  heading: Heading = "h3",
  priority = false,
}: {
  product: Product;
  heading?: "h2" | "h3";
  priority?: boolean;
}) {
  const image = product.images[0]?.path;
  const soldOut = product.stock < 1;
  return (
    <article>
      <Link href={routes.product(product.slug)} className="tag-card">
        <div className="tag-card__photo">
          {image ? (
            <img
              src={asset(image)}
              alt={product.name}
              width={720}
              height={960}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <div className="tag-card__placeholder">{product.name}</div>
          )}
          {soldOut ? <span className="tag-card__sold">Išparduota</span> : null}
        </div>
        <div className="tag-wrap">
          <svg className="tag-card__string" viewBox="0 0 34 44" aria-hidden="true">
            <path d="M19 34 C 13 22, 18 8, 30 -6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div className="tag">
            <p className="tag__cat">{product.category}</p>
            <Heading className="tag__name">{product.name}</Heading>
            <p className="tag__price">{formatEur(product.priceCents)}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
