import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { store } from "@/config/store";

export const metadata: Metadata = { title: "Privatumo politika" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privatumo politika">
      <p className="rounded-lg bg-sand px-4 py-3 text-sm">
        Šis tekstas yra šablonas. Prieš paleidžiant parduotuvę, jį turi peržiūrėti teisininkas.
      </p>
      <p>
        Duomenų valdytojas — {store.company.name}, įmonės kodas {store.company.code}, {store.company.address}.
      </p>
      <h2>Kokius duomenis renkame</h2>
      <ul>
        <li>Vardą, pavardę, el. pašto adresą, telefono numerį ir pristatymo adresą — užsakymui įvykdyti.</li>
        <li>Užsakymų istoriją — buhalterinei apskaitai ir garantiniams įsipareigojimams.</li>
      </ul>
      <h2>Kam perduodame duomenis</h2>
      <p>
        Mokėjimų paslaugų teikėjui AB SEB bankas (ir jo partneriui EveryPay AS) — mokėjimui atlikti; kurjerių
        tarnyboms — prekėms pristatyti.
      </p>
      <h2>Jūsų teisės</h2>
      <p>
        Turite teisę susipažinti su savo duomenimis, juos ištaisyti ar ištrinti. Kreipkitės{" "}
        <a href={`mailto:${store.email}`} className="underline">
          {store.email}
        </a>
        . Taip pat galite pateikti skundą Valstybinei duomenų apsaugos inspekcijai.
      </p>
    </ProsePage>
  );
}
