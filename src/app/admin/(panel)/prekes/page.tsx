import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { toggleProductActive } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/prekes">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryId = typeof sp.kategorija === "string" ? sp.kategorija : "";

  const where: Prisma.ProductWhereInput = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (categoryId) where.categoryId = categoryId;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium">Prekės</h1>
          <p className="text-sm text-ink-muted">{products.length} prekių</p>
        </div>
        <Link href="/admin/prekes/nauja" className="btn-primary">+ Nauja prekė</Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input type="search" name="q" defaultValue={q} placeholder="Ieškoti pagal pavadinimą ar kodą…" className="input max-w-xs" />
        <select name="kategorija" defaultValue={categoryId} className="input max-w-xs">
          <option value="">Visos kategorijos</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="btn-outline">Filtruoti</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream-dark/50 text-left text-xs uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-3">Prekė</th>
              <th className="px-4 py-3">Kategorija</th>
              <th className="px-4 py-3">Kaina</th>
              <th className="px-4 py-3">Likutis</th>
              <th className="px-4 py-3">Būsena</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-cream-dark/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/prekes/${p.id}`} className="flex items-center gap-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-sand">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium hover:underline">{p.name}</p>
                        <p className="text-xs text-ink-muted">{p.sku ?? p.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {formatEur(p.priceCents)}
                    {p.compareAtPriceCents && (
                      <span className="ml-1 text-xs text-ink-muted line-through">{formatEur(p.compareAtPriceCents)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={stock === 0 ? "text-danger" : stock <= 3 ? "text-rose-dark" : ""}>{stock} vnt.</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className={`badge ${p.isActive ? "bg-success/10 text-success" : "bg-sand text-ink-soft"}`}>
                        {p.isActive ? "Rodoma" : "Paslėpta"}
                      </span>
                      {p.isFeatured && <span className="badge bg-rose-soft text-rose-dark">Išskirta</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleProductActive} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn-ghost text-xs">
                        {p.isActive ? "Paslėpti" : "Rodyti"}
                      </button>
                    </form>
                    <Link href={`/admin/prekes/${p.id}`} className="btn-ghost text-xs">Redaguoti</Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-muted">
                  Prekių nerasta. <Link href="/admin/prekes/nauja" className="underline">Pridėti pirmą prekę</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
