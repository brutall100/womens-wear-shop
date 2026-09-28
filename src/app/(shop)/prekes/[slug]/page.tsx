import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { shopConfig } from "@/lib/config";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata({ params }: PageProps<"/prekes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Prekė nerasta" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: product.images[0] ? { images: [{ url: product.images[0].url }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/prekes/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { isActive: true, id: { not: product.id }, categoryId: product.categoryId ?? undefined },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { select: { stock: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const onSale = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const paragraphs = product.description.split(/\n{2,}/).filter(Boolean);
  const freeFrom = shopConfig.shipping.freeFrom;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="Naršymo kelias">
        <Link href="/" className="hover:text-ink">Pradžia</Link>
        <span>/</span>
        <Link href="/prekes" className="hover:text-ink">Prekės</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/prekes?kategorija=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            {product.category && (
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{product.category.name}</p>
            )}
            <h1 className="mt-2 font-display text-4xl font-medium leading-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-medium">{formatEur(product.priceCents)}</span>
              {onSale && (
                <>
                  <span className="text-lg text-ink-muted line-through">
                    {formatEur(product.compareAtPriceCents!)}
                  </span>
                  <span className="badge bg-rose-soft text-rose-dark">
                    −{Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)} %
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-muted">Kaina su PVM{product.sku ? ` · Kodas ${product.sku}` : ""}</p>

            <div className="mt-8">
              <AddToCart
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  imageUrl: product.images[0]?.url ?? null,
                }}
                variants={product.variants}
              />
            </div>

            <ul className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-sm text-ink-soft">
              <li className="flex gap-3">
                <span aria-hidden>🚚</span>
                Pristatymas per 1–3 d. d. kurjeriu arba į paštomatą
                {freeFrom > 0 && <> · nemokamai nuo {formatEur(freeFrom)}</>}
              </li>
              <li className="flex gap-3"><span aria-hidden>↩︎</span> Grąžinimas per 14 dienų</li>
              <li className="flex gap-3"><span aria-hidden>🔒</span> Saugus apmokėjimas per SEB e. prekybą</li>
            </ul>

            {paragraphs.length > 0 && (
              <div className="prose-lt mt-8 border-t border-ink/10 pt-6 text-sm leading-relaxed text-ink-soft">
                <h2 className="label">Aprašymas</h2>
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow">Jums taip pat gali patikti</p>
          <h2 className="mt-2 font-display text-3xl font-medium">Panašios prekės</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
