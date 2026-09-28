import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { formatEur } from "@/lib/money";
import { asset, routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

export function ProductsView({ products }: { products: Product[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Katalogas</p>
          <h1 className="mt-3 text-5xl">Prekės</h1>
          <p className="mt-2 text-sm text-muted">Pavadinimas, kaina, aprašymas, dydžiai ir nuotraukos.</p>
        </div>
        <Link href={routes.adminNewProduct} className="btn btn-primary">
          <PlusIcon size={18} /> Nauja prekė
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="pattern-card mt-10">Prekių dar nėra. Sukurkite pirmąją.</p>
      ) : (
        <ul className="panel mt-8 grid gap-1 p-2">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={routes.adminProduct(product.id)} className="data-row">
                <span className="block h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {product.images[0] ? (
                    <img src={asset(product.images[0].path)} alt="" width={48} height={64} loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-semibold leading-tight">{product.name}</span>
                  <span className="text-sm text-muted">
                    {product.category} · likutis {product.stock}
                  </span>
                </span>
                {product.published ? null : <span className="badge badge--failed hidden sm:inline-flex">paslėpta</span>}
                <span className="price text-sm">{formatEur(product.priceCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
