import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveProduct } from "../../actions";

export const metadata: Metadata = { title: "Nauja prekė" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  const action = saveProduct.bind(null, null);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/prekes" className="text-sm text-ink-muted hover:text-ink">← Prekės</Link>
        <h1 className="mt-1 font-display text-3xl font-medium">Nauja prekė</h1>
      </div>
      <ProductForm
        action={action}
        categories={categories}
        initial={{
          name: "",
          slug: "",
          description: "",
          price: "",
          compareAtPrice: "",
          sku: "",
          categoryId: categories[0]?.id ?? "",
          isActive: true,
          isFeatured: false,
          variants: [],
          images: [],
        }}
      />
    </div>
  );
}
