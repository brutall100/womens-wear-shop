import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getProduct, listProducts } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const categories = [...new Set(listProducts().map((item) => item.category))];
  const price = (product.priceCents / 100).toFixed(2).replace(".", ",");
  return (
    <div>
      <Link href="/admin/prekes" className="text-sm underline">
        Visos prekės
      </Link>
      <h1 className="mt-3 font-serif text-5xl">Redaguoti</h1>
      <p className="mt-2 text-sm">
        <Link href={`/preke/${product.slug}`} className="underline">
          Peržiūrėti parduotuvėje
        </Link>
      </p>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price,
          category: product.category,
          sizes: product.sizes,
          stock: product.stock,
          published: product.published,
          images: product.images.map((image) => ({ id: image.id, path: image.path })),
        }}
        categories={categories}
      />
    </div>
  );
}
