import Link from "next/link";
import Image from "next/image";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/catalog";

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const [first, second] = product.images;
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Link href={`/preke/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
        <ProductImage
          src={first?.url}
          alt={product.name}
          priority={priority}
          className="transition duration-700 group-hover:scale-[1.03]"
        />
        {second && (
          <Image
            src={second.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
              −{Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
              Išparduota
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-sm leading-snug font-medium group-hover:underline">{product.name}</h3>
        <div className="text-right text-sm whitespace-nowrap">
          <span className={onSale ? "font-semibold text-accent" : "font-semibold"}>{formatPrice(product.price)}</span>
          {onSale && <span className="ml-1.5 block text-xs text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return <p className="py-20 text-center text-muted">Prekių kol kas nėra.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
