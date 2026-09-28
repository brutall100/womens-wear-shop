# VĖJA – moteriškų drabužių el. parduotuvė

Lietuvos rinkai skirta vienos kalbos (lietuvių) el. parduotuvė su SEB banko
mokėjimais ir administravimo panele, kurioje patys galite kelti prekes, kainas
ir aprašymus.

- **Parduotuvė:** pradžios puslapis, katalogas su filtrais, prekės puslapis su
  dydžiais ir likučiais, krepšelis, atsiskaitymas.
- **Mokėjimai:** SEB banklink (IPIZZA 1.3) – užklausa pasirašoma RSA parašu,
  banko atsakymas patikrinamas prieš patvirtinant užsakymą.
- **Administravimas:** prekių, kategorijų, pristatymo būdų ir užsakymų valdymas
  adresu `/admin`.

## Technologijos

| Sritis | Sprendimas |
| --- | --- |
| Karkasas | Next.js 16 (App Router), React 19, TypeScript |
| Stilius | Tailwind CSS v4 |
| Duomenų bazė | Prisma + SQLite (lengvai keičiama į PostgreSQL) |
| Mokėjimai | SEB banklink / IPIZZA 1.3 (`src/lib/seb`) |
| Prisijungimas | Serverio sesijos + scrypt slaptažodžių maiša |

## Paleidimas

```bash
npm install
cp .env.example .env
npm run setup     # sukuria DB, schemą ir demonstracinius duomenis
npm run dev
```

Parduotuvė: <http://localhost:3000> · Administravimas: <http://localhost:3000/admin>

Pradiniai administratoriaus duomenys (keičiami `.env` faile prieš `npm run setup`):

```
El. paštas:  admin@veja.lt
Slaptažodis: Slaptazodis123
```

## Naudingos komandos

| Komanda | Paskirtis |
| --- | --- |
| `npm run dev` | Kūrimo serveris |
| `npm run build` / `npm start` | Produkcinė versija |
| `npm run setup` | Prisma klientas + DB schema + demonstraciniai duomenys |
| `npm run db:reset` | Išvalo DB ir įrašo demonstracinius duomenis iš naujo |
| `npm run test` | SEB protokolo testai (parašas, MAC, kontrolinis skaitmuo) |
| `npm run lint` / `npm run typecheck` | Kodo patikros |
| `npm run seb:keys` | Sugeneruoja bandomąsias RSA raktų poras į `.keys/` |

## Administravimo panelė

| Skiltis | Ką galima daryti |
| --- | --- |
| Apžvalga | Pajamos, užsakymų skaičius, besibaigiantys likučiai |
| Prekės | Kurti ir redaguoti prekes: pavadinimas, nuoroda, trumpas ir pilnas aprašymas, kaina, sena kaina, prekės kodas, spalva, sudėtis, priežiūra |
| Prekės → nuotraukos | Įkėlimas iš kompiuterio (JPG, PNG, WebP iki 6 MB) arba nuoroda; pirmoji nuotrauka – pagrindinė, eiliškumas keičiamas rodyklėmis |
| Prekės → dydžiai | Kiekvienam dydžiui savas likutis; kai likutis 0, dydis parduotuvėje rodomas perbrauktas |
| Kategorijos | Kūrimas, eiliškumas, matomumas |
| Pristatymo būdai | Kaina, riba nemokamam pristatymui, matomumas |
| Užsakymai | Sąrašas su filtrais, užsakymo kortelė, būsenų keitimas, SEB operacijų istorija |

Įkeltos nuotraukos saugomos `public/uploads` kataloge (į git nepatenka).

## SEB banklink integracija

Kodas: `src/lib/seb/` – `ipizza.ts` (protokolas), `config.ts` (nustatymai),
`keys.ts` (raktai), `process-response.ts` (atsakymo tikrinimas ir užsakymo
atnaujinimas).

### Kaip veikia mokėjimas

1. Pirkėjas atsiskaitymo puslapyje paspaudžia „Mokėti su SEB“.
2. Serveris iš naujo perskaičiuoja kainas ir likučius iš duomenų bazės,
   sukuria užsakymą ir `PaymentTransaction` įrašą.
3. Suformuojama `VK_SERVICE=1012` užklausa, pasirašoma pardavėjo privačiu raktu
   (`VK_MAC`), ir naršyklė POST forma nukreipiama į banką.
4. Bankas grąžina `VK_SERVICE=1111` (sėkmė) arba `1911` (atšaukta) į
   `/api/mokejimai/seb/grizimas`.
5. Parašas patikrinamas banko viešuoju raktu, papildomai lyginama suma ir
   valiuta. Tik tada užsakymas žymimas apmokėtu ir nurašomi likučiai.

Pakartotinai gautas tas pats atsakymas būsenos antrą kartą nekeičia, o
automatiniam banko pranešimui (`VK_AUTO=Y`) grąžinamas `OK` tekstas vietoje
peradresavimo.

### Bandomasis režimas

Su `SEB_MODE="mock"` (numatyta) veikia vietinis bandomasis bankas adresu
`/api/mokejimai/seb/bandomasis-bankas`: jis patikrina pardavėjo parašą, leidžia
patvirtinti arba atšaukti mokėjimą ir grąžina pasirašytą atsakymą. Raktai
sugeneruojami automatiškai į `.keys/`, tikros sutarties su banku nereikia.

### Perjungimas į tikrą SEB

Iš SEB pagal e. prekybos sutartį gaunama: pardavėjo ID, banko mokėjimo formos
adresas ir banko viešasis raktas (sertifikatas). Savo privatų raktą
sugeneruojate patys, o viešąjį pateikiate bankui.

```env
SEB_MODE="live"
SEB_SND_ID="jusu_pardavejo_id"
SEB_PAYMENT_URL="https://e.seb.lt/mainib/site/login.aspx"
SEB_ALGORITHM="sha1"          # arba sha256 – pagal sutartį
SEB_PRIVATE_KEY_PATH="/saugus/kelias/pardavejo-privatus.pem"
SEB_BANK_PUBLIC_KEY_PATH="/saugus/kelias/seb-viesasis.pem"
APP_URL="https://jusu-parduotuve.lt"
```

Vietoje failų kelių galima naudoti `SEB_PRIVATE_KEY` ir `SEB_BANK_PUBLIC_KEY`
su pačiu PEM tekstu (patogu Vercel ar Docker aplinkoje). Jei bankas MAC ilgį
skaičiuoja baitais, nustatykite `SEB_MAC_LENGTH_MODE="bytes"`.

`APP_URL` turi būti tikrasis viešas adresas – iš jo sudaromos `VK_RETURN` ir
`VK_CANCEL` nuorodos, į kurias bankas grąžina pirkėją.

## Struktūra

```
prisma/schema.prisma          duomenų modelis
prisma/seed.ts                demonstraciniai duomenys
src/app/(shop)/               parduotuvės puslapiai
src/app/admin/                administravimo panelė
src/app/api/mokejimai/seb/    SEB grįžimo adresas ir bandomasis bankas
src/app/api/admin/ikelti/     nuotraukų įkėlimas
src/components/               UI komponentai
src/lib/                      duomenų bazė, kainos, sesijos, SEB protokolas
```

## Pastabos diegimui

- **Duomenų bazė.** SQLite tinka vienam serveriui. Persikeliant į PostgreSQL
  pakanka `prisma/schema.prisma` pakeisti `provider = "postgresql"`, nurodyti
  `DATABASE_URL` ir paleisti `npx prisma migrate deploy`.
- **Nuotraukos.** Failai rašomi į vietinę failų sistemą, todėl serveriui
  be nuolatinės disko saugyklos (pvz. Vercel) reikėtų perjungti įkėlimą į
  objektų saugyklą (`src/app/api/admin/ikelti/route.ts`).
- **Kainos.** Visos sumos saugomos centais (`Int`), todėl apvalinimo klaidų
  nėra. Rodomos su PVM (21 %).
- **Saugumas.** Krepšelio kainos niekada nepasitikima – prieš kuriant užsakymą
  kainos ir likučiai perskaitomi iš duomenų bazės.
