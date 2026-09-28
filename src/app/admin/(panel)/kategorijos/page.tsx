import { deleteCategory } from "@/app/admin/(panel)/kategorijos/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kategorijos" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <header>
        <h1 className="text-3xl">Kategorijos</h1>
        <p className="mt-1 text-sm text-muted">
          Kategorijos rodomos meniu, poraštėje ir katalogo filtruose.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="border border-line bg-shell">
          {categories.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-muted">
              Kategorijų dar nėra
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {categories.map((category) => (
                <li key={category.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-sand/50">
                      <span className="w-8 text-xs text-muted">{category.sortOrder}</span>
                      <span className="flex-1">
                        <span className="text-sm">{category.name}</span>
                        <span className="block text-xs text-muted">/{category.slug}</span>
                      </span>
                      <span className="text-xs text-muted">
                        {category._count.products} prekės
                      </span>
                      <span
                        className={cn(
                          "border px-2 py-0.5 text-[11px]",
                          category.isActive
                            ? "border-success/40 text-success"
                            : "border-line text-muted",
                        )}
                      >
                        {category.isActive ? "Rodoma" : "Paslėpta"}
                      </span>
                      <span className="text-xs text-clay group-open:hidden">Redaguoti</span>
                      <span className="hidden text-xs text-muted group-open:inline">
                        Uždaryti
                      </span>
                    </summary>

                    <div className="border-t border-line bg-cream/60 px-5 py-5">
                      <CategoryForm
                        category={{
                          id: category.id,
                          name: category.name,
                          slug: category.slug,
                          description: category.description ?? "",
                          sortOrder: category.sortOrder,
                          isActive: category.isActive,
                        }}
                      />

                      <form
                        action={async () => {
                          "use server";
                          await deleteCategory(category.id);
                        }}
                        className="mt-5 border-t border-line pt-4"
                      >
                        <button
                          type="submit"
                          className="text-xs text-muted link-underline hover:text-danger cursor-pointer"
                        >
                          Ištrinti kategoriją
                        </button>
                        <span className="ml-2 text-xs text-muted">
                          (prekės liks, tik netenka kategorijos)
                        </span>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit border border-line bg-shell p-5">
          <h2 className="text-lg">Nauja kategorija</h2>
          <div className="mt-4">
            <CategoryForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
