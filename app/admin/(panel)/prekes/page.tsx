import Link from "next/link";
import { listProducts } from "@/lib/db";
import { formatEur } from "@/lib/money";

export default function ProductsPage() {
  const products = listProducts();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl">Prekės</h1>
          <p className="mt-2 text-sm text-muted">Pavadinimas, kaina, aprašymas, dydžiai ir nuotraukos.</p>
        </div>
        <Link href="/admin/prekes/nauja" className="inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
          Nauja prekė
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="mt-10 border border-line bg-card p-8">Prekių dar nėra.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/admin/prekes/${product.id}`} className="flex items-center gap-4 py-4">
                <span className="h-16 w-12 shrink-0 bg-paper-2">
                  {product.images[0] ? <img src={product.images[0].path} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-2xl leading-tight">{product.name}</span>
                  <span className="text-sm text-muted">
                    {product.category} · likutis {product.stock}
                    {product.published ? "" : " · paslėpta"}
                  </span>
                </span>
                <span className="num text-sm">{formatEur(product.priceCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
