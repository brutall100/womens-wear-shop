"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Apžvalga", exact: true },
  { href: "/admin/prekes", label: "Prekės" },
  { href: "/admin/kategorijos", label: "Kategorijos" },
  { href: "/admin/uzsakymai", label: "Užsakymai" },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1"}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-dark hover:text-ink"
            } ${horizontal ? "shrink-0" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
