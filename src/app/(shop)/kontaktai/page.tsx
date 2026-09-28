import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontaktai",
  description: "Susisiekite su mumis el. paštu arba telefonu.",
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Kontaktai</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Atsakome darbo dienomis, paprastai per kelias valandas.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="eyebrow">Susisiekti</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline">
                {site.phone}
              </a>
            </li>
            <li className="text-muted">{site.workingHours}</li>
          </ul>
        </section>

        <section>
          <h2 className="eyebrow">Adresas</h2>
          <p className="mt-3 text-[15px]">{site.address}</p>
          <p className="mt-1 text-sm text-muted">
            Prekes atsiimti galima darbo dienomis 10:00–18:00.
          </p>
        </section>

        <section>
          <h2 className="eyebrow">Rekvizitai</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Pavadinimas</dt>
              <dd>{site.company.legalName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Įmonės kodas</dt>
              <dd>{site.company.code}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">PVM kodas</dt>
              <dd>{site.company.vatCode}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Bankas</dt>
              <dd>{site.company.bank}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Sąskaita</dt>
              <dd>{site.company.iban}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="eyebrow">Socialiniai tinklai</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
