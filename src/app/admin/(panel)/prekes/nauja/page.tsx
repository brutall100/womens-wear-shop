import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nauja prekė" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <nav className="text-xs text-muted">
        <Link href="/admin/prekes" className="link-underline hover:text-ink">
          Prekės
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Nauja prekė</span>
      </nav>

      <h1 className="mt-3 mb-6 text-3xl">Nauja prekė</h1>

      <ProductForm
        categories={categories}
        product={{
          name: "",
          slug: "",
          categoryId: categories[0]?.id ?? "",
          summary: "",
          description: "",
          priceCents: null,
          compareAtCents: null,
          sku: "",
          color: "",
          material: "",
          careInstructions: "",
          isActive: true,
          isFeatured: false,
          sortOrder: 0,
          images: [],
          variants: [],
        }}
      />
    </div>
  );
}
