# AURELIA – Moteriškų Drabužių El. Parduotuvė (Lietuvos Rinka)

Moderni, prabangi vienakalbė lietuviška moteriškų drabužių elektroninė parduotuvė su **SEB banko integracija** (Banklink / PSD2 Open Banking) ir **administratoriaus panele**, skirta savarankiškam prekių, jų kainų, aprašymų, nuotraukų ir užsakymų valdymui.

---

## 🌟 Pagrindiniai Privalumai ir Funkcionalumas

### 1. 👗 Moteriškų Drabužių Parduotuvė (Lietuviška sąsaja)
- **100% lietuvių kalba**: pritaikyta Lietuvos rinkai (valiuta EUR €, terminai, pristatymo metodai, dydžių lentelė).
- **Asortimento katalogas**: Paltai, Suknelės, Švarkai, Megztiniai, Kelnės, Marškiniai ir palaidinės.
- **Interaktyvus pirkinių krepšelis**: Dinaminis nemokamo pristatymo skaičiuoklis (nuo 60 €), kiekio keitimas, dydžių ir spalvų pasirinkimas.
- **Lietuvos siuntų tarnybos**: Omniva paštomatai, DPD kurjeris į namus, LP EXPRESS paštomatai.

### 2. 🏦 SEB Banko Integracija (Banklink & PSD2)
- **Tiesioginis atsiskaitymas**: sugeneruojamas mokėjimo seansas, unikalus tranzakcijos ID ir SEPA / EPC mokėjimo paskirtis.
- **SEB autorizavimo portalas**: Smart-ID / SEB programėlės patvirtinimo langas su SEB logotipu, sumos ir IBAN duomenimis.
- **Mokėjimo statusų sinchronizacija**: momentinis statuso atnaujinimas (`paid`, `pending`, `cancelled`).
- **Saugumas**: RSA-SHA256 skaitmeninis užklausų pasirašymas pagal Lietuvos bankų Open Banking standartus.

### 3. ⚙️ Administratoriaus Panelė (`/admin`)
- **Prekių kėlimas ir valdymas**: galimybė patogiai pridėti naujus drabužius.
- **Kainų ir aprašymų redagavimas**: momentinis kainos, akcijinės kainos, audinių sudėties ir aprašymo atnaujinimas.
- **Nuotraukų galerija**: nuotraukų nuorodų valdymas.
- **Gautų užsakymų sąrašas**: pirkėjų kontaktai, pristatymo adresai, krepšelio prekės ir SEB mokėjimo statusai.
- **SEB API Nustatymai**: Merchant ID, Kliento ID, slaptažodžių, IBAN sąskaitos ir RSA raktų nustatymas tiesiai iš naršyklės.

---

## 🚀 Paleidimas ir Technologijos

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Stilius**: Tailwind CSS v4, Lucide Icons, Serif tipografija
- **Duomenų bazė**: SQLite (`better-sqlite3`), saugoma `data/store.db`
- **Mokėjimai**: SEB Banklink / PSD2 Open Banking Gateway

### Paleidimo komandos:

```bash
# Įdiegti priklausomybes
npm install

# Paleisti vystymo režimu
npm run dev

# Sukurti produkcinę versiją
npm run build

# Paleisti produkcinę versiją
npm run start
```

Parduotuvė pasiekiama adresu: [http://localhost:3000](http://localhost:3000)  
Valdymo pultas (Admin): [http://localhost:3000/admin](http://localhost:3000/admin)
