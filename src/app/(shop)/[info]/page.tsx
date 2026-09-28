import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { shopConfig } from "@/lib/config";
import { formatEur } from "@/lib/format";

interface InfoPage {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

function pages(): Record<string, InfoPage> {
  const s = shopConfig.shipping;
  return {
    pristatymas: {
      title: "Pristatymas ir grąžinimas",
      intro: "Užsakymus išsiunčiame per 1–3 darbo dienas nuo apmokėjimo visoje Lietuvoje.",
      sections: [
        {
          heading: "Pristatymo būdai ir kainos",
          body: `Kurjeris į namus – ${formatEur(s.courier)} (1–2 d. d.). Paštomatas (Omniva, LP Express, Venipak) – ${formatEur(s.parcel_locker)} (2–3 d. d.).${
            s.freeFrom > 0 ? ` Užsakymams nuo ${formatEur(s.freeFrom)} pristatymas nemokamas.` : ""
          }`,
        },
        {
          heading: "Grąžinimas",
          body: "Nepatikusias prekes galite grąžinti per 14 dienų nuo gavimo. Prekės turi būti nedėvėtos, su etiketėmis ir originalioje pakuotėje. Pinigus grąžiname per 14 dienų nuo prekės gavimo tuo pačiu mokėjimo būdu.",
        },
        {
          heading: "Keitimas",
          body: "Norite kito dydžio? Susisiekite su mumis el. paštu – rezervuosime reikiamą dydį ir pakeisime nemokamai.",
        },
      ],
    },
    taisykles: {
      title: "Pirkimo taisyklės",
      intro: `Šios taisyklės nustato ${shopConfig.name} el. parduotuvės naudojimo ir pirkimo–pardavimo sąlygas.`,
      sections: [
        {
          heading: "Sutarties sudarymas",
          body: "Pirkimo–pardavimo sutartis laikoma sudaryta, kai pirkėjas apmoka užsakymą per SEB e. prekybos mokėjimų sistemą ir gauna užsakymo patvirtinimą el. paštu.",
        },
        {
          heading: "Kainos ir apmokėjimas",
          body: "Visos kainos nurodytos eurais su PVM. Apmokėti galima SEB ar kito banko el. bankininkyste, Visa / Mastercard kortele, Apple Pay arba Google Pay. Mokėjimus apdoroja SEB bankas – kortelės duomenys parduotuvei neperduodami.",
        },
        {
          heading: "Pirkėjo teisės",
          body: "Pirkėjas turi teisę atsisakyti sutarties per 14 dienų nuo prekės gavimo, pranešdamas apie tai el. paštu, ir grąžinti prekę pagal grąžinimo taisykles.",
        },
      ],
    },
    privatumas: {
      title: "Privatumo politika",
      intro: "Gerbiame jūsų privatumą ir tvarkome asmens duomenis pagal BDAR reikalavimus.",
      sections: [
        {
          heading: "Kokius duomenis renkame",
          body: "Užsakymui įvykdyti renkame vardą, pavardę, el. paštą, telefoną ir pristatymo adresą. Mokėjimo duomenis tvarko SEB bankas – mes jų nematome ir nesaugome.",
        },
        {
          heading: "Kam naudojame",
          body: "Duomenys naudojami tik užsakymui įvykdyti, pristatyti ir su juo susijusiai komunikacijai. Naujienlaiškius siunčiame tik gavę atskirą sutikimą.",
        },
        {
          heading: "Saugojimas ir jūsų teisės",
          body: "Užsakymų duomenis saugome 10 metų pagal buhalterinės apskaitos reikalavimus. Turite teisę susipažinti su savo duomenimis, juos ištaisyti arba prašyti ištrinti – kreipkitės el. paštu.",
        },
      ],
    },
    kontaktai: {
      title: "Kontaktai",
      intro: "Turite klausimų dėl dydžių, užsakymo ar grąžinimo? Parašykite – atsakome per 1 darbo dieną.",
      sections: [
        { heading: "El. paštas", body: "info@example.lt" },
        { heading: "Telefonas", body: "+370 600 00000 (I–V 9:00–17:00)" },
        { heading: "Rekvizitai", body: `${shopConfig.name}, UAB · Įmonės kodas 000000000 · PVM kodas LT000000000 · Vilnius, Lietuva` },
      ],
    },
  };
}

export async function generateMetadata({ params }: PageProps<"/[info]">): Promise<Metadata> {
  const { info } = await params;
  const page = pages()[info];
  return { title: page?.title ?? "Puslapis nerastas" };
}

export default async function InfoPage({ params }: PageProps<"/[info]">) {
  const { info } = await params;
  const page = pages()[info];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">{page.title}</h1>
      <p className="mt-4 text-lg text-ink-soft">{page.intro}</p>
      <div className="mt-10 space-y-8">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
