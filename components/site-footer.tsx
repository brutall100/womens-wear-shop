import Link from "next/link";
import { formatEur } from "@/lib/money";
import { isDemo, routes } from "@/lib/routes";
import type { ShopConfig } from "@/lib/types";
import { ScissorsIcon } from "./icons";

export function SiteFooter({ shop }: { shop: ShopConfig }) {
  return (
    <footer className="site-footer">
      <span className="site-footer__scissors" aria-hidden="true">
        <ScissorsIcon size={18} />
      </span>
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="logo">MOT</p>
          <p className="mt-4 max-w-xs text-sm text-muted">Drabužiai, kurie lieka. Nedidelė moteriškų drabužių linija Lietuvai.</p>
        </div>
        <div className="text-sm">
          <h2 className="font-sans text-base font-semibold tracking-normal">Parduotuvė</h2>
          <ul className="mt-3 grid gap-2 text-muted">
            <li>
              <Link href={routes.catalog} className="link">
                Katalogas
              </Link>
            </li>
            <li>
              <Link href={routes.cart} className="link">
                Krepšelis
              </Link>
            </li>
            <li>
              <Link href="/#kaip-dirbame" className="link">
                Kaip dirbame
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="font-sans text-base font-semibold tracking-normal">Pristatymas</h2>
          <p className="mt-3 text-muted">LP Express, Omniva arba kurjeris. Nemokamai nuo {formatEur(shop.freeShippingCents)}.</p>
          <p className="mt-2 text-muted">{shop.pickup || "Atsiėmimo vietą įrašykite administracijoje."}</p>
        </div>
        <div className="text-sm">
          <h2 className="font-sans text-base font-semibold tracking-normal">Kontaktai</h2>
          <p className="mt-3 text-muted">{shop.email || "El. paštas dar neįrašytas"}</p>
          <p className="mt-1 text-muted">{shop.phone || "Telefonas dar neįrašytas"}</p>
          <p className="mt-3 text-muted">Mokėjimas per SEB banką.</p>
          <Link href={routes.admin} className="link mt-3 inline-block">
            Valdymas
          </Link>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-wrap justify-between gap-2 py-5 text-sm text-muted">
          <p>© {new Date().getFullYear()} MOT</p>
          <p>
            {isDemo ? "Demo: užsakymai ir pakeitimai saugomi tik jūsų naršyklėje, pinigai nenuskaičiuojami." : "Nuotraukos: Unsplash"}
          </p>
        </div>
      </div>
    </footer>
  );
}
