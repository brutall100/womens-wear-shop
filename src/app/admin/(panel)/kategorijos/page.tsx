import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { deleteCategory } from "../actions";

export const metadata: Metadata = { title: "Kategorijos" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">Kategorijos</h1>
        <p className="text-sm text-ink-muted">Kategorijos rodomos meniu pagal eilės numerį.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <ul className="divide-y divide-ink/8">
            {categories.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <CategoryForm initial={{ id: c.id, name: c.name, position: c.position }} compact />
                <span className="text-xs text-ink-muted">{c._count.products} prekių</span>
                <form action={deleteCategory} className="ml-auto">
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="btn-ghost text-xs text-danger" disabled={c._count.products > 0}
                    title={c._count.products > 0 ? "Pirmiausia perkelkite prekes į kitą kategoriją" : undefined}>
                    Ištrinti
                  </button>
                </form>
              </li>
            ))}
            {categories.length === 0 && <li className="px-5 py-8 text-sm text-ink-muted">Kategorijų dar nėra.</li>}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="font-medium">Nauja kategorija</h2>
          <div className="mt-4">
            <CategoryForm initial={{ id: "", name: "", position: categories.length + 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
