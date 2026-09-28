import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProduct, moveProductImage, removeProductImage, saveProduct } from "../../actions";

export const metadata: Metadata = { title: "Redaguoti prekę" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/prekes/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { position: "asc" } },
        images: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!product) notFound();

  const action = saveProduct.bind(null, product.id);
  const toEur = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/prekes" className="text-sm text-ink-muted hover:text-ink">← Prekės</Link>
          <h1 className="mt-1 font-display text-3xl font-medium">{product.name}</h1>
          <p className="text-sm text-ink-muted">
            <Link href={`/prekes/${product.slug}`} target="_blank" className="hover:underline">
              Peržiūrėti parduotuvėje ↗
            </Link>
          </p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button type="submit" className="btn-ghost text-sm text-danger">Ištrinti prekę</button>
        </form>
      </div>

      {sp.sukurta === "1" && (
        <p className="rounded-lg bg-success/10 px-4 py-2 text-sm text-success" role="status">
          Prekė sukurta. Galite pridėti daugiau nuotraukų ar patikslinti informaciją.
        </p>
      )}

      <ProductForm
        action={action}
        categories={categories}
        imageActions={{ remove: removeProductImage, move: moveProductImage }}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: toEur(product.priceCents),
          compareAtPrice: toEur(product.compareAtPriceCents),
          sku: product.sku ?? "",
          categoryId: product.categoryId ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
          images: product.images.map((i) => ({ id: i.id, url: i.url, position: i.position })),
        }}
      />
    </div>
  );
}
