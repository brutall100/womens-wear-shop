import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { store } from "@/config/store";

export const metadata: Metadata = { title: "Pirkimo taisyklės" };

export default function TermsPage() {
  return (
    <ProsePage title="Pirkimo taisyklės">
      <p className="rounded-lg bg-sand px-4 py-3 text-sm">
        Šis tekstas yra šablonas. Prieš paleidžiant parduotuvę, jį turi peržiūrėti teisininkas.
      </p>
      <h2>1. Bendrosios nuostatos</h2>
      <p>
        Šios taisyklės nustato pirkėjo ir pardavėjo {store.company.name} (įmonės kodas {store.company.code}, PVM mokėtojo
        kodas {store.company.vatCode}, adresas {store.company.address}) teises ir pareigas perkant prekes internetinėje
        parduotuvėje {store.name}.
      </p>
      <h2>2. Užsakymas ir sutarties sudarymas</h2>
      <p>
        Sutartis laikoma sudaryta, kai pirkėjas pateikia užsakymą ir jį apmoka. Kainos nurodytos eurais su PVM.
      </p>
      <h2>3. Apmokėjimas</h2>
      <p>
        Už prekes atsiskaitoma per AB SEB banko e. prekybos mokėjimų sistemą — elektronine bankininkyste (banko
        nuoroda) arba mokėjimo kortele. Pardavėjas negauna ir nesaugo mokėjimo kortelės duomenų.
      </p>
      <h2>4. Pristatymas ir grąžinimas</h2>
      <p>Pristatymo ir grąžinimo sąlygos aprašytos puslapyje „Pristatymas ir grąžinimas“.</p>
      <h2>5. Ginčų sprendimas</h2>
      <p>
        Ginčai sprendžiami derybų būdu. Nepavykus susitarti, pirkėjas gali kreiptis į Valstybinę vartotojų teisių
        apsaugos tarnybą (www.vvtat.lt) arba naudotis EGS platforma (ec.europa.eu/odr).
      </p>
    </ProsePage>
  );
}
