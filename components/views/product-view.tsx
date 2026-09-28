import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { BankIcon, TruckIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { formatEur } from "@/lib/money";
import { routes } from "@/lib/routes";
import type { Product, ShopConfig } from "@/lib/types";

export function ProductView({ product, shop }: { product: Product; shop: ShopConfig }) {
  const image = product.images[0]?.path ?? "";
  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Kelias" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={routes.home} className="link">
              Pradžia
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={routes.catalog} className="link">
              Katalogas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={routes.category(product.category)} className="link">
              {product.category}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="pattern-card">
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">{product.name}</h1>
          <p className="price mt-4 text-3xl text-accent-ink">{formatEur(product.priceCents)}</p>
          <p className="mt-6 max-w-[60ch] whitespace-pre-wrap text-muted">{product.description}</p>
          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              sizes: product.sizes,
              stock: product.stock,
              image,
            }}
          />
          <ul className="mt-2 grid gap-3 border-t border-dashed border-line pt-6 text-sm text-muted">
            <li className="flex gap-3">
              <TruckIcon className="shrink-0 text-sage-ink" />
              LP Express, Omniva arba kurjeris. Nuo {formatEur(shop.freeShippingCents)} – nemokamai.
            </li>
            <li className="flex gap-3">
              <BankIcon className="shrink-0 text-sage-ink" />
              Apmokėjimas per SEB interneto banką.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
