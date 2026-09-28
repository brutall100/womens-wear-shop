import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Prekės redagavimas" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ sortOrder: "asc" }, { size: "asc" }] },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <nav className="text-xs text-muted">
        <Link href="/admin/prekes" className="link-underline hover:text-ink">
          Prekės
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{product.name}</h1>
        <Link
          href={`/preke/${product.slug}`}
          target="_blank"
          className="text-xs text-muted link-underline hover:text-ink"
        >
          Peržiūrėti parduotuvėje ↗
        </Link>
      </div>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId ?? "",
          summary: product.summary ?? "",
          description: product.description ?? "",
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          sku: product.sku ?? "",
          color: product.color ?? "",
          material: product.material ?? "",
          careInstructions: product.careInstructions ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          sortOrder: product.sortOrder,
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt ?? "",
          })),
          variants: product.variants.map((variant) => ({
            size: variant.size,
            stock: variant.stock,
          })),
        }}
      />
    </div>
  );
}
