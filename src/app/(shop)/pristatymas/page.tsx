import type { Metadata } from "next";
import { formatPrice } from "@/lib/money";
import { getActiveShippingMethods } from "@/lib/queries";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pristatymas ir grąžinimas",
  description:
    "Pristatymo būdai, terminai ir prekių grąžinimo sąlygos perkant Lietuvoje.",
};

export default async function ShippingPage() {
  const methods = await getActiveShippingMethods();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Pristatymas ir grąžinimas</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Siunčiame visoje Lietuvoje. Užsakymus, pateiktus darbo dienomis iki 14:00,
        išsiunčiame tą pačią dieną.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl">Pristatymo būdai</h2>
        <ul className="mt-4 border-t border-line">
          {methods.map((method) => (
            <li
              key={method.code}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-4"
            >
              <div>
                <p className="text-[15px]">{method.name}</p>
                {method.description && (
                  <p className="mt-1 text-sm text-muted">{method.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {method.priceCents === 0 ? "Nemokamai" : formatPrice(method.priceCents)}
                </p>
                {method.freeFromCents !== null && (
                  <p className="text-xs text-muted">
                    Nemokamai nuo {formatPrice(method.freeFromCents)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Grąžinimas</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
          <p>
            Prekes galite grąžinti per 14 dienų nuo gavimo, nenurodydami priežasties.
            Prekė turi būti nedėvėta, su etiketėmis ir originalia pakuote.
          </p>
          <p>
            Norėdami grąžinti, parašykite mums el. paštu{" "}
            <a href={`mailto:${site.email}`} className="text-ink link-underline">
              {site.email}
            </a>{" "}
            ir nurodykite užsakymo numerį. Atsiųsime grąžinimo instrukcijas.
          </p>
          <p>
            Pinigus grąžiname per 14 dienų nuo prekės gavimo į tą pačią sąskaitą,
            iš kurios buvo atliktas mokėjimas.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Keitimas</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Jei netiko dydis, pakeisime prekę kitu dydžiu nemokamai – pristatymo
          išlaidas keitimo atveju dengiame mes.
        </p>
      </section>
    </div>
  );
}
