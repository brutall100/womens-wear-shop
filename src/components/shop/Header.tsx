import Link from "next/link";
import { prisma } from "@/lib/db";
import { shopConfig } from "@/lib/config";
import { CartLink } from "./CartLink";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    where: { products: { some: { isActive: true } } },
  });

  const links = [
    { href: "/prekes", label: "Visos prekės" },
    ...categories.map((c) => ({ href: `/prekes?kategorija=${c.slug}`, label: c.name })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <MobileNav links={links} />
          <Link href="/" className="font-display text-2xl font-semibold tracking-[0.18em] uppercase">
            {shopConfig.name}
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <CartLink />
      </div>
    </header>
  );
}
