import { prisma } from "@/lib/prisma";
import { PageHeader } from "../ui";
import { CategoryRow, NewCategoryForm } from "./category-forms";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Kategorijos" />
      <div className="max-w-3xl space-y-6">
        <NewCategoryForm nextOrder={(categories.at(-1)?.sortOrder ?? 0) + 1} />
        <div className="card divide-y divide-line">
          <div className="grid grid-cols-[1fr_1fr_5rem_auto] gap-3 px-5 py-3 text-xs font-semibold tracking-wide text-muted uppercase">
            <span>Pavadinimas</span>
            <span>Nuoroda</span>
            <span>Eilė</span>
            <span className="w-36" />
          </div>
          {categories.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">Kategorijų dar nėra.</p>}
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} productCount={c._count.products} />
          ))}
        </div>
        <p className="text-xs text-muted">
          Eilė nustato, kokia tvarka kategorijos rodomos meniu. Ištrynus kategoriją, jos prekės lieka, tik be kategorijos.
        </p>
      </div>
    </>
  );
}
