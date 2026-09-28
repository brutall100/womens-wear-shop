"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BankIcon, BoxIcon, ListIcon, LogoutIcon, ResetIcon, StoreIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { adminLogout } from "@/lib/client-api";
import { resetDemo } from "@/lib/demo/store";
import { isDemo, routes } from "@/lib/routes";

const LINKS = [
  { href: routes.adminProducts, label: "Prekės", icon: BoxIcon },
  { href: routes.adminOrders, label: "Užsakymai", icon: ListIcon },
  { href: routes.adminSeb, label: "SEB", icon: BankIcon },
  { href: routes.adminShop, label: "Parduotuvė", icon: StoreIcon },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div className="admin-nav flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-5">
        <div className="flex items-center gap-3">
          <Link href={routes.home} className="logo text-[26px]">
            MOT
          </Link>
          <span className="badge badge--preparing">valdymas</span>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label="Valdymas" className="overflow-x-auto px-3 pb-3 lg:flex-1 lg:px-4">
        <ul className="flex gap-1 lg:grid">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link href={href} className="admin-nav__link" aria-current={active ? "page" : undefined}>
                  <Icon size={19} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-line px-4 py-4 lg:grid">
        <Link href={routes.home} className="btn btn-quiet btn-sm justify-start">
          Į parduotuvę
        </Link>
        {isDemo ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm justify-start"
            onClick={() => {
              if (!window.confirm("Atstatyti prekes, užsakymus ir nustatymus į pradinius?")) return;
              resetDemo();
              router.push(routes.adminProducts);
            }}
          >
            <ResetIcon size={17} /> Atstatyti demo duomenis
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          className="btn btn-ghost btn-sm justify-start"
          onClick={async () => {
            setBusy(true);
            await adminLogout();
            router.push(routes.adminLogin);
            router.refresh();
          }}
        >
          <LogoutIcon size={17} /> Atsijungti
        </button>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
