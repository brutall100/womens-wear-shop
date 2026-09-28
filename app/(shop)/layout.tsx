import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { listCategories, shopConfig } from "@/lib/db";
import { formatEur } from "@/lib/money";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = listCategories();
  const shop = shopConfig();
  return (
    <>
      <a className="skip" href="#turinys">
        Praleisti navigaciją
      </a>
      <p className="border-b border-line px-5 py-2 text-center text-sm text-muted">
        Lietuva · nemokamas pristatymas nuo {formatEur(shop.freeShippingCents)}
      </p>
      <Header categories={categories} />
      <main id="turinys">{children}</main>
      <Footer {...shop} />
    </>
  );
}
