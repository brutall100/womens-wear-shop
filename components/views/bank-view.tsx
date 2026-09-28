import type { ReactNode } from "react";
import { BankIcon } from "@/components/icons";
import { formatEur } from "@/lib/money";
import type { Order } from "@/lib/types";

/** The test bank page. It is clearly marked, so nobody mistakes it for the real SEB. */
export function BankView({ order, actions }: { order: Order; actions: ReactNode }) {
  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <div className="pattern-card">
        <p className="eyebrow">Bandomoji aplinka</p>
        <h1 className="mt-4 flex items-center gap-3 text-4xl sm:text-5xl">
          <BankIcon size={40} className="shrink-0 text-accent-ink" />
          Mokėjimo patvirtinimas
        </h1>
        <p className="notice mt-6">
          Tai <strong>ne tikras SEB puslapis</strong>, pinigai nenuskaičiuojami. Taip parduotuvė tikrina mokėjimo užklausą, kol
          neįkelti sutarties su banku raktai.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Gavėjas</dt>
            <dd className="font-semibold">MOT</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Užsakymas</dt>
            <dd className="price">MOT-{order.stamp.slice(0, 8)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Paskirtis</dt>
            <dd className="price">{order.vkMsg}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Suma</dt>
            <dd className="price text-4xl">{formatEur(order.amountCents)}</dd>
          </div>
        </dl>
        <div className="mt-8">{actions}</div>
      </div>
    </div>
  );
}
