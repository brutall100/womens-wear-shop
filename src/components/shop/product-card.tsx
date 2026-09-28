import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/money";
import type { ProductCardData } from "@/lib/queries";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const [primary, secondary] = product.images;
  const onSale =
    product.compareAtCents !== null && product.compareAtCents > product.priceCents;
  const soldOut =
    product.variants.length > 0 &&
    product.variants.every((variant) => variant.stock <= 0);

  return (
    <article className="group">
      <Link href={`/preke/${product.slug}`} className="block">
        <div className="zoom-media relative aspect-[3/4] overflow-hidden bg-sand">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              Nuotraukos nėra
            </div>
          )}

          {secondary && (
            <Image
              src={secondary.url}
              alt={secondary.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {onSale && (
              <span className="bg-clay px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cream">
                Nuolaida
              </span>
            )}
            {!onSale && product.isNew && (
              <span className="bg-shell px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink">
                Naujiena
              </span>
            )}
            {soldOut && (
              <span className="bg-ink/85 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cream">
                Išparduota
              </span>
            )}
          </div>
        </div>

        <div className="pt-3.5">
          {product.category && (
            <p className="eyebrow">{product.category.name}</p>
          )}
          <h3 className="mt-1 text-[15px] leading-snug transition-colors group-hover:text-clay">
            {product.name}
          </h3>
          <p className="mt-1.5 flex items-baseline gap-2 text-sm">
            <span className={onSale ? "text-clay" : ""}>
              {formatPrice(product.priceCents)}
            </span>
            {onSale && product.compareAtCents && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: ProductCardData[];
  columns?: 3 | 4;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-5 gap-y-10 ${
        columns === 3 ? "lg:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
