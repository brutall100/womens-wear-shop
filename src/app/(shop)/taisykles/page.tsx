import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pirkimo taisyklės",
  description: "Prekių pirkimo–pardavimo taisyklės ir asmens duomenų tvarkymas.",
};

const SECTIONS = [
  {
    title: "1. Bendrosios nuostatos",
    paragraphs: [
      `Šios prekių pirkimo–pardavimo taisyklės nustato ${site.company.legalName} (įmonės kodas ${site.company.code}) elektroninėje parduotuvėje ${site.name} perkančio pirkėjo ir pardavėjo teises bei pareigas.`,
      "Pateikdamas užsakymą pirkėjas patvirtina, kad susipažino su šiomis taisyklėmis ir su jomis sutinka.",
    ],
  },
  {
    title: "2. Užsakymo pateikimas",
    paragraphs: [
      "Užsakymas laikomas pateiktu nuo to momento, kai pirkėjas apmoka užsakymą ir pardavėjas gauna banko patvirtinimą apie sėkmingą mokėjimą.",
      "Prekių kainos nurodytos eurais su PVM. Pristatymo kaina skaičiuojama atskirai ir matoma prieš patvirtinant užsakymą.",
    ],
  },
  {
    title: "3. Apmokėjimas",
    paragraphs: [
      "Už prekes atsiskaitoma naudojantis AB SEB banko elektroninės bankininkystės sistema. Mokėjimo duomenys pardavėjui neperduodami – mokėjimas atliekamas saugioje banko aplinkoje.",
      "Negavus apmokėjimo per 24 valandas, užsakymas anuliuojamas.",
    ],
  },
  {
    title: "4. Prekių pristatymas",
    paragraphs: [
      "Prekės pristatomos Lietuvos Respublikos teritorijoje pirkėjo pasirinktu būdu: į paštomatą arba kurjeriu nurodytu adresu.",
      "Numatomas pristatymo terminas – 1–3 darbo dienos nuo apmokėjimo gavimo.",
    ],
  },
  {
    title: "5. Grąžinimas ir keitimas",
    paragraphs: [
      "Pirkėjas turi teisę atsisakyti sutarties per 14 dienų nuo prekės gavimo, nenurodydamas priežasties.",
      "Grąžinama prekė turi būti nedėvėta, nepraradusi prekinės išvaizdos, su originaliomis etiketėmis.",
      "Pinigai grąžinami per 14 dienų nuo grąžinamos prekės gavimo.",
    ],
  },
  {
    title: "6. Asmens duomenys",
    paragraphs: [
      "Pardavėjas tvarko pirkėjo asmens duomenis (vardą, pavardę, el. pašto adresą, telefono numerį, pristatymo adresą) tik užsakymo vykdymo tikslu.",
      "Duomenys saugomi teisės aktų nustatytą laikotarpį ir neperduodami tretiesiems asmenims, išskyrus pristatymo paslaugų teikėjus.",
    ],
  },
  {
    title: "7. Ginčų sprendimas",
    paragraphs: [
      "Nesutarimai sprendžiami derybomis. Nepavykus susitarti, pirkėjas gali kreiptis į Valstybinę vartotojų teisių apsaugos tarnybą arba į elektroninę ginčų sprendimo platformą.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Pirkimo taisyklės</h1>
      <p className="mt-3 text-sm text-muted">
        Paskutinį kartą atnaujinta: 2026 m.
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl">{section.title}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
