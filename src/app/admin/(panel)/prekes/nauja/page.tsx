import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "../../ui";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <Link href="/admin/prekes" className="text-sm text-muted hover:text-ink">
        ← Prekės
      </Link>
      <PageHeader title="Nauja prekė" />
      <ProductForm
        categories={categories}
        initial={{
          name: "",
          slug: "",
          description: "",
          price: "",
          compareAtPrice: "",
          categoryId: "",
          isActive: true,
          isFeatured: false,
          images: [],
          variants: [],
        }}
      />
    </>
  );
}
