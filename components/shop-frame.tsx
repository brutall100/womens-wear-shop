import type { ReactNode } from "react";
import { formatEur } from "@/lib/money";
import type { ShopConfig } from "@/lib/types";
import { MeasuringTape } from "./measuring-tape";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Tape, header, page and footer around every shop page. */
export function ShopFrame({
  categories,
  featured,
  shop,
  children,
}: {
  categories: string[];
  featured: string[];
  shop: ShopConfig;
  children: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#turinys">
        Pereiti prie turinio
      </a>
      <MeasuringTape>Nemokamas pristatymas nuo {formatEur(shop.freeShippingCents)}</MeasuringTape>
      <SiteHeader featured={featured} categories={categories} />
      <main id="turinys" className="page-main">
        {children}
      </main>
      <SiteFooter shop={shop} />
    </>
  );
}
