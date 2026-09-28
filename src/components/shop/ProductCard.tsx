import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/format";

export interface ProductCardData {
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  images: { url: string; alt: string }[];
  category?: { name: string } | null;
  variants: { stock: number }[];
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const onSale = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;

  return (
    <Link href={`/prekes/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">Nėra nuotraukos</div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {onSale && <span className="badge bg-rose text-white">Akcija</span>}
          {soldOut && <span className="badge bg-ink/80 text-cream">Išparduota</span>}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {product.category && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{product.category.name}</p>
        )}
        <h3 className="font-display text-lg leading-snug text-ink group-hover:underline group-hover:decoration-ink/30 group-hover:underline-offset-4">
          {product.name}
        </h3>
        <p className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{formatEur(product.priceCents)}</span>
          {onSale && (
            <span className="text-ink-muted line-through">{formatEur(product.compareAtPriceCents!)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
