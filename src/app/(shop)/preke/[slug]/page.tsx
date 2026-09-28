import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductGrid } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { store } from "@/config/store";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata(props: PageProps<"/preke/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage(props: PageProps<"/preke/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const related = product.categoryId
    ? (await listProducts({ categoryId: product.categoryId, id: { not: product.id } }, undefined, 4))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <nav className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Pradžia
        </Link>{" "}
        /{" "}
        {product.category ? (
          <Link href={`/kategorija/${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
        ) : (
          <Link href="/parduotuve" className="hover:text-ink">
            Prekės
          </Link>
        )}{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <ProductGallery images={product.images.map((i) => i.url)} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-2xl font-semibold ${onSale ? "text-accent" : ""}`}>{formatPrice(product.price)}</span>
            {onSale && <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>}
          </div>
          <p className="mt-1 text-xs text-muted">Kaina su PVM</p>

          <div className="mt-8">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url ?? null,
              }}
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))}
            />
          </div>

          {product.description && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="label">Aprašymas</h2>
              <div className="text-[15px] leading-relaxed whitespace-pre-line text-ink/85">{product.description}</div>
            </div>
          )}

          <div className="mt-6 divide-y divide-line border-y border-line text-sm">
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                Pristatymas
                <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">
                Pristatome į Omniva ir LP Express paštomatus bei kurjeriu į namus visoje Lietuvoje per 1–3 darbo dienas.
                Užsakymams nuo {formatPrice(store.freeShippingFrom)} pristatymas nemokamas.
              </p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                Grąžinimas
                <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">
                Prekę galite grąžinti per 14 dienų nuo gavimo. Daugiau informacijos —{" "}
                <Link href="/pristatymas-ir-grazinimas" className="underline">
                  pristatymo ir grąžinimo sąlygose
                </Link>
                .
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif text-4xl">Jums taip pat gali patikti</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
