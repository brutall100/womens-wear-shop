import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "../ui";
import { toggleProductActive } from "./actions";

export default async function AdminProductsPage(props: PageProps<"/admin/prekes">) {
  const { q, kategorija } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const categoryId = typeof kategorija === "string" ? kategorija : "";

  const where: Prisma.ProductWhereInput = {
    ...(query ? { name: { contains: query } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Prekės">
        <Link href="/admin/prekes/nauja" className="btn-primary">
          + Nauja prekė
        </Link>
      </PageHeader>

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={query} placeholder="Ieškoti pagal pavadinimą…" className="input max-w-xs" />
        <select name="kategorija" defaultValue={categoryId} className="input max-w-[14rem]">
          <option value="">Visos kategorijos</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-outline py-2">Filtruoti</button>
      </form>

      <div className="card overflow-x-auto">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-muted">Prekių nerasta.</p>
            <Link href="/admin/prekes/nauja" className="btn-primary mt-4">
              Sukurti pirmą prekę
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3">Prekė</th>
                <th className="px-3 py-3">Kategorija</th>
                <th className="px-3 py-3">Kaina</th>
                <th className="px-3 py-3">Likutis</th>
                <th className="px-5 py-3 text-right">Būsena</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-cream">
                    <td className="px-5 py-3">
                      <Link href={`/admin/prekes/${p.id}`} className="flex items-center gap-3">
                        <span className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-sand">
                          {p.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        <span>
                          <span className="block font-medium hover:underline">{p.name}</span>
                          {p.isFeatured && <span className="text-xs text-accent">Rekomenduojama</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">{p.category?.name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className="font-medium">{formatPrice(p.price)}</span>
                      {p.compareAtPrice && (
                        <span className="ml-1.5 text-xs text-muted line-through">{formatPrice(p.compareAtPrice)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={stock === 0 ? "font-semibold text-accent" : ""}>{stock} vnt.</span>
                      <span className="block text-xs text-muted">
                        {p.variants.map((v) => `${v.size}: ${v.stock}`).join(" · ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                          }`}
                          title="Spustelėkite, kad pakeistumėte"
                        >
                          {p.isActive ? "Rodoma" : "Paslėpta"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
