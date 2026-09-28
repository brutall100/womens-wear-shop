import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { categoriesOf } from "@/lib/catalog";
import { getProduct, listProducts } from "@/lib/db";
import { centsToInput } from "@/lib/money";
import { routes } from "@/lib/routes";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <div>
      <Link href={routes.adminProducts} className="link text-sm">
        ← Visos prekės
      </Link>
      <h1 className="mt-4 text-5xl">{product.name}</h1>
      <ProductForm
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: centsToInput(product.priceCents),
          category: product.category,
          sizes: product.sizes,
          stock: product.stock,
          published: product.published,
          images: product.images.map((image) => ({ id: image.id, path: image.path })),
        }}
        categories={categoriesOf(listProducts())}
      />
    </div>
  );
}
