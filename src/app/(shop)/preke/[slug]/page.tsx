import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ProductGrid } from "@/components/shop/product-card";
import { formatPrice } from "@/lib/money";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prekė nerasta" };

  return {
    title: product.name,
    description: product.summary ?? site.description,
    openGraph: {
      title: product.name,
      description: product.summary ?? site.description,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

const SIZE_TABLE = [
  { size: "XS", chest: "82–86", waist: "62–66", hips: "88–92" },
  { size: "S", chest: "86–90", waist: "66–70", hips: "92–96" },
  { size: "M", chest: "90–94", waist: "70–74", hips: "96–100" },
  { size: "L", chest: "94–99", waist: "74–79", hips: "100–105" },
  { size: "XL", chest: "99–105", waist: "79–85", hips: "105–111" },
  { size: "XXL", chest: "105–112", waist: "85–92", hips: "111–118" },
];

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const onSale =
    product.compareAtCents !== null && product.compareAtCents > product.priceCents;
  const details = [
    product.color && { label: "Spalva", value: product.color },
    product.material && { label: "Sudėtis", value: product.material },
    product.careInstructions && { label: "Priežiūra", value: product.careInstructions },
    product.sku && { label: "Prekės kodas", value: product.sku },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 text-xs text-muted" aria-label="Naršymo kelias">
        <Link href="/" className="hover:text-ink">
          Pradžia
        </Link>
        <span className="mx-2">/</span>
        <Link href="/parduotuve" className="hover:text-ink">
          Parduotuvė
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/parduotuve?kategorija=${product.category.slug}`}
              className="hover:text-ink"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:sticky lg:top-32 lg:self-start">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="mt-2 text-4xl leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`font-display text-3xl ${onSale ? "text-clay" : ""}`}>
              {formatPrice(product.priceCents)}
            </span>
            {onSale && product.compareAtCents && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Kaina su PVM ({site.vatRate} %)
          </p>

          {product.summary && (
            <p className="mt-6 text-[15px] leading-relaxed text-muted">
              {product.summary}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <ProductPurchase
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceCents={product.priceCents}
              imageUrl={product.images[0]?.url ?? null}
              variants={product.variants.map((variant) => ({
                size: variant.size,
                stock: variant.stock,
              }))}
            />
          </div>

          {product.description && (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="text-xl">Aprašymas</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
                {product.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-8 border-t border-line pt-8">
              <h2 className="text-xl">Informacija</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {details.map((detail) => (
                  <div key={detail.label} className="flex gap-3">
                    <dt className="w-32 shrink-0 text-muted">{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div id="dydziu-lentele" className="mt-8 scroll-mt-32 border-t border-line pt-8">
            <h2 className="text-xl">Dydžių lentelė</h2>
            <p className="mt-2 text-sm text-muted">Matmenys nurodyti centimetrais.</p>
            <table className="mt-4 w-full border border-line text-sm">
              <thead className="bg-sand text-left">
                <tr>
                  <th className="px-3 py-2 font-normal">Dydis</th>
                  <th className="px-3 py-2 font-normal">Krūtinė</th>
                  <th className="px-3 py-2 font-normal">Juosmuo</th>
                  <th className="px-3 py-2 font-normal">Klubai</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row) => (
                  <tr key={row.size} className="border-t border-line">
                    <td className="px-3 py-2">{row.size}</td>
                    <td className="px-3 py-2 text-muted">{row.chest}</td>
                    <td className="px-3 py-2 text-muted">{row.waist}</td>
                    <td className="px-3 py-2 text-muted">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 border-b border-line pb-4 text-2xl">Taip pat gali patikti</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
