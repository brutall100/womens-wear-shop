import Link from "next/link";
import { shopConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/8 bg-cream-dark/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold uppercase tracking-[0.18em]">{shopConfig.name}</p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Moteriški drabužiai, kuriuose norisi būti kiekvieną dieną. Kuruota kolekcija, greitas pristatymas
            visoje Lietuvoje.
          </p>
        </div>
        <div>
          <p className="label">Informacija</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link href="/pristatymas" className="hover:text-ink">Pristatymas ir grąžinimas</Link></li>
            <li><Link href="/taisykles" className="hover:text-ink">Pirkimo taisyklės</Link></li>
            <li><Link href="/privatumas" className="hover:text-ink">Privatumo politika</Link></li>
            <li><Link href="/kontaktai" className="hover:text-ink">Kontaktai</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Saugus apmokėjimas</p>
          <p className="text-sm text-ink-soft">
            Mokėjimai apdorojami per SEB banko e. prekybos mokėjimų vartus: SEB ir kitų bankų el. bankininkystė,
            Visa / Mastercard, Apple Pay, Google Pay.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["SEB", "Swedbank", "Luminor", "Visa", "Mastercard", "Apple Pay", "Google Pay"].map((m) => (
              <span key={m} className="badge border border-ink/10 bg-white text-ink-soft">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-ink/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} {shopConfig.name}. Visos teisės saugomos.</span>
          <span>Kainos nurodytos eurais su PVM.</span>
        </div>
      </div>
    </footer>
  );
}
