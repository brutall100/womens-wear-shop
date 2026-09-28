import Image from "next/image";
import Link from "next/link";
import { toggleProductActive } from "@/app/admin/(panel)/prekes/actions";
import { formatPrice } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { buttonClass, cn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Prekės" };

type SearchParams = Promise<{ paieska?: string; busena?: string; kategorija?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.paieska?.trim() ?? "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
                { slug: { contains: search } },
              ],
            }
          : {}),
        ...(params.busena === "aktyvios"
          ? { isActive: true }
          : params.busena === "paslept"
            ? { isActive: false }
            : {}),
        ...(params.kategorija ? { categoryId: params.kategorija } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Prekės</h1>
          <p className="mt-1 text-sm text-muted">{products.length} įrašų</p>
        </div>
        <Link href="/admin/prekes/nauja" className={buttonClass("primary", "md")}>
          + Nauja prekė
        </Link>
      </header>

      <form className="mt-6 flex flex-wrap items-end gap-3" action="/admin/prekes">
        <div>
          <label className="field-label" htmlFor="paieska">
            Paieška
          </label>
          <input
            id="paieska"
            name="paieska"
            defaultValue={search}
            className="field w-60"
            placeholder="Pavadinimas arba kodas"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="kategorija">
            Kategorija
          </label>
          <select
            id="kategorija"
            name="kategorija"
            defaultValue={params.kategorija ?? ""}
            className="field w-48 cursor-pointer"
          >
            <option value="">Visos</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="busena">
            Būsena
          </label>
          <select
            id="busena"
            name="busena"
            defaultValue={params.busena ?? ""}
            className="field w-40 cursor-pointer"
          >
            <option value="">Visos</option>
            <option value="aktyvios">Rodomos</option>
            <option value="paslept">Paslėptos</option>
          </select>
        </div>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Filtruoti
        </button>
        {(search || params.busena || params.kategorija) && (
          <Link href="/admin/prekes" className="pb-2.5 text-xs text-muted link-underline">
            Išvalyti
          </Link>
        )}
      </form>

      <div className="mt-6 border border-line bg-shell">
        {products.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted">
            Prekių nerasta. <Link href="/admin/prekes/nauja" className="text-clay link-underline">Sukurkite pirmąją</Link>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-3 font-normal">Prekė</th>
                <th className="hidden px-3 py-3 font-normal sm:table-cell">Kategorija</th>
                <th className="px-3 py-3 font-normal">Kaina</th>
                <th className="hidden px-3 py-3 font-normal md:table-cell">Likutis</th>
                <th className="px-3 py-3 font-normal">Būsena</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.variants.reduce(
                  (sum, variant) => sum + variant.stock,
                  0,
                );
                return (
                  <tr key={product.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-sand">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/prekes/${product.id}`}
                            className="block truncate hover:text-clay"
                          >
                            {product.name}
                          </Link>
                          <span className="block truncate text-xs text-muted">
                            {product.sku ?? product.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-muted sm:table-cell">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {formatPrice(product.priceCents)}
                      {product.compareAtCents && (
                        <span className="block text-xs text-muted line-through">
                          {formatPrice(product.compareAtCents)}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-3 py-3 md:table-cell">
                      <span className={cn(stock === 0 && "text-danger", stock > 0 && stock <= 5 && "text-clay")}>
                        {stock} vnt.
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-block border px-2 py-0.5 text-[11px]",
                          product.isActive
                            ? "border-success/40 text-success"
                            : "border-line text-muted",
                        )}
                      >
                        {product.isActive ? "Rodoma" : "Paslėpta"}
                      </span>
                      {product.isFeatured && (
                        <span className="ml-1 inline-block border border-clay/40 px-2 py-0.5 text-[11px] text-clay">
                          Favoritas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <form
                          action={async () => {
                            "use server";
                            await toggleProductActive(product.id, !product.isActive);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-muted link-underline hover:text-ink cursor-pointer"
                          >
                            {product.isActive ? "Slėpti" : "Rodyti"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/prekes/${product.id}`}
                          className="text-xs text-clay link-underline"
                        >
                          Redaguoti
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
