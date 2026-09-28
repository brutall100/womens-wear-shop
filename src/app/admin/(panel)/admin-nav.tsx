"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Suvestinė", exact: true },
  { href: "/admin/prekes", label: "Prekės" },
  { href: "/admin/kategorijos", label: "Kategorijos" },
  { href: "/admin/uzsakymai", label: "Užsakymai" },
  { href: "/admin/nustatymai", label: "Nustatymai" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
              active ? "bg-ink text-cream" : "text-ink/80 hover:bg-sand"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
