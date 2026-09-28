"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/admin/prekes", "Prekės"],
  ["/admin/uzsakymai", "Užsakymai"],
  ["/admin/seb", "SEB"],
  ["/admin/parduotuve", "Parduotuvė"],
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-line lg:min-h-dvh lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="font-serif text-3xl tracking-[0.18em]">
          MOT
        </Link>
        <p className="text-xs uppercase tracking-[0.14em] text-muted lg:hidden">Valdymas</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:px-3" aria-label="Valdymas">
        {LINKS.map(([href, label]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`block h-11 whitespace-nowrap px-3 leading-[2.75rem] text-sm ${active ? "bg-ink text-paper" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/admin/logout" method="post" className="px-3 py-4">
        <button type="submit" className="h-11 px-3 text-sm underline">
          Atsijungti
        </button>
      </form>
    </div>
  );
}
