"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui";

const LINKS = [
  { href: "/admin", label: "Apžvalga", exact: true },
  { href: "/admin/prekes", label: "Prekės" },
  { href: "/admin/kategorijos", label: "Kategorijos" },
  { href: "/admin/uzsakymai", label: "Užsakymai" },
  { href: "/admin/pristatymas", label: "Pristatymo būdai" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ink text-cream"
                : "text-muted hover:bg-sand hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
