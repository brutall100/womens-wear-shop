import type { ReactNode } from "react";
import { ShopFrame } from "@/components/shop-frame";
import { featuredCategories } from "@/lib/catalog";
import { listCategories, listProducts, shopConfig } from "@/lib/db";

export default function ShopLayout({ children }: { children: ReactNode }) {
  const products = listProducts({ publishedOnly: true });
  return (
    <ShopFrame categories={listCategories()} featured={featuredCategories(products)} shop={shopConfig()}>
      {children}
    </ShopFrame>
  );
}
