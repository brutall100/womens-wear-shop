import Link from "next/link";
import { site } from "@/lib/site";

export function Footer({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  return (
    <footer className="mt-24 border-t border-line bg-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl tracking-[0.3em] pl-[0.3em]">{site.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.description}
          </p>
        </div>

        <nav>
          <h3 className="eyebrow">Kolekcija</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/parduotuve" className="text-muted hover:text-ink">
                Visos prekės
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/parduotuve?kategorija=${category.slug}`}
                  className="text-muted hover:text-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h3 className="eyebrow">Pagalba</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/pristatymas" className="text-muted hover:text-ink">
                Pristatymas ir grąžinimas
              </Link>
            </li>
            <li>
              <Link href="/taisykles" className="text-muted hover:text-ink">
                Pirkimo taisyklės
              </Link>
            </li>
            <li>
              <Link href="/kontaktai" className="text-muted hover:text-ink">
                Kontaktai
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-muted hover:text-ink">
                Administravimas
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow">Kontaktai</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                {site.phone}
              </a>
            </li>
            <li>{site.address}</li>
            <li>{site.workingHours}</li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <span className="border border-line bg-shell px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
              SEB bankas
            </span>
            <span className="border border-line bg-shell px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
              Saugus mokėjimas
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company.legalName}, į. k. {site.company.code}
          </p>
          <p>Kainos nurodytos su PVM ({site.vatRate} %)</p>
        </div>
      </div>
    </footer>
  );
}
