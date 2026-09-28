import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { centsToInput } from "@/lib/format";
import { PageHeader } from "../../ui";
import { ProductForm } from "../product-form";
import { deleteProduct } from "../actions";
import { ConfirmButton } from "../../confirm-button";

export default async function EditProductPage(props: PageProps<"/admin/prekes/[id]">) {
  const { id } = await props.params;
  const { issaugota } = await props.searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/prekes" className="text-sm text-muted hover:text-ink">
        ← Prekės
      </Link>
      <PageHeader title={product.name}>
        {product.isActive && (
          <Link href={`/preke/${product.slug}`} target="_blank" className="btn-outline py-2">
            Peržiūrėti ↗
          </Link>
        )}
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton message="Ar tikrai ištrinti šią prekę? Šio veiksmo atšaukti negalima." className="btn py-2 text-accent hover:bg-accent/10">
            Ištrinti
          </ConfirmButton>
        </form>
      </PageHeader>
      {issaugota && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Pakeitimai išsaugoti.
        </div>
      )}
      <ProductForm
        key={product.updatedAt.toISOString()}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: centsToInput(product.price),
          compareAtPrice: centsToInput(product.compareAtPrice),
          categoryId: product.categoryId ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
        }}
      />
    </>
  );
}
