# Moteriškų drabužių el. parduotuvė

Vienos kalbos (lietuvių) el. parduotuvė Lietuvos rinkai su SEB banko e. prekybos mokėjimais ir
administravimo panele prekėms, kainoms, aprašymams ir užsakymams valdyti.

## Kas viduje

| Sritis | Aprašymas |
| --- | --- |
| **Parduotuvė** | Pradinis puslapis, katalogas su kategorijomis / paieška / rikiavimu, prekės puslapis su dydžiais ir likučiais, krepšelis, atsiskaitymas, užsakymo patvirtinimas, informaciniai puslapiai (pristatymas, taisyklės, privatumas, kontaktai). |
| **Mokėjimai** | SEB e. prekyba (EveryPay Payment API v4): mokėjimo inicijavimas, grįžimo URL, callback, būsenos tikrinimas. Be raktų veikia demonstracinis režimas su imituotu banko langu. |
| **Admin panelė** `/admin` | Apžvalga (pajamos, užsakymai, mažas likutis), prekių kūrimas / redagavimas su nuotraukų įkėlimu, dydžiais ir likučiais, kaina prieš nuolaidą, kategorijos, užsakymų valdymas (būsenos, rankinis apmokėjimo žymėjimas). |

Technologijos: Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS 4, Prisma 6 (SQLite lokaliai, PostgreSQL produkcijai), Zod.

## Paleidimas

```bash
npm install
cp .env.example .env        # užpildykite reikšmes
npm run db:push             # sukuria DB pagal prisma/schema.prisma
npm run db:seed             # pavyzdinės kategorijos ir prekės (neprivaloma)
npm run dev                 # http://localhost:3000
```

Admin panelė: `http://localhost:3000/admin` – prisijungimas su `ADMIN_EMAIL` / `ADMIN_PASSWORD` iš `.env`.

## Aplinkos kintamieji

Žr. `.env.example`. Svarbiausi:

- `DATABASE_URL` – SQLite (`file:./dev.db`) arba PostgreSQL prisijungimo eilutė.
- `NEXT_PUBLIC_SITE_URL` – viešas parduotuvės adresas. Į jį SEB grąžina pirkėją, todėl produkcijoje turi būti tikras domenas (ne `localhost` ar IP).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` – admin prisijungimas ir sesijos slapuko pasirašymo raktas.
- `SEB_API_USERNAME`, `SEB_API_SECRET`, `SEB_ACCOUNT_NAME`, `SEB_ENVIRONMENT` – SEB e. prekybos prieiga.
- `UPLOAD_DIR` – katalogas įkeltoms nuotraukoms (pagal nutylėjimą `./uploads`, aptarnaujamas per `/uploads/...`).

## SEB banko integracija

SEB Baltijos šalyse el. parduotuvių mokėjimus teikia per **SEB e. prekybą**, kurios techninis pagrindas –
EveryPay mokėjimų vartai. Vienas sujungimas duoda: SEB ir kitų Lietuvos bankų el. bankininkystę (bank link /
open banking), Visa / Mastercard korteles, Apple Pay, Google Pay.

Kaip įjungti:

1. Pasirašykite SEB e. prekybos sutartį (seb.lt → Verslui → Mokėjimų surinkimas internetu). SEB suteikia prieigą prie prekybininko portalo (iš pradžių – demo aplinkos).
2. Portale **Settings → General settings** nusikopijuokite *API username* ir *API secret*, o *Processing account* pavadinimą (pvz. `EUR3D1`) įrašykite į `.env`:
   ```
   SEB_API_USERNAME="..."
   SEB_API_SECRET="..."
   SEB_ACCOUNT_NAME="EUR3D1"
   SEB_ENVIRONMENT="demo"      # gyvai aplinkai: live
   ```
3. Portale **E-shop settings → Callback URL** nurodykite:
   `https://<jusu-domenas>/api/mokejimai/seb/callback`
4. `NEXT_PUBLIC_SITE_URL` turi būti tikras HTTPS domenas – SEB neleidžia grąžinti pirkėjo į `localhost`.

Kaip veikia (`src/lib/payments/seb.ts`, `src/lib/orders.ts`):

- Atsiskaitant sukuriamas užsakymas (rezervuojamas likutis) ir kviečiamas `POST /v4/payments/oneoff`. Pirkėjas nukreipiamas į gautą `payment_link` (SEB apmokėjimo langas lietuvių kalba, `preferred_country=LT`).
- Po apmokėjimo SEB grąžina pirkėją į `/uzsakymas/<nr>?payment_reference=...` ir lygiagrečiai kviečia callback. Callback'ai nėra pasirašyti, todėl abiem atvejais būsena **visada** pertikrinama per `GET /v4/payments/:payment_reference`.
- `settled` / `authorised` → užsakymas *Apmokėtas*; `failed` / `abandoned` / `voided` → *Atšauktas*, likutis grąžinamas. Pirkėjas gali bandyti apmokėti dar kartą.
- Kol SEB raktų nėra, `/mokejimas/demo/<id>` imituoja banko langą, kad visą srautą būtų galima išbandyti lokaliai.

## Produkcija

- Pakeiskite `datasource db { provider = "postgresql" }` schemoje ir `DATABASE_URL`, tada `npx prisma migrate deploy` (arba `db push`).
- `UPLOAD_DIR` nukreipkite į nuolatinį diską (arba pakeiskite `src/lib/uploads.ts` į S3 / R2 saugyklą).
- `npm run build && npm start`.

## Struktūra

```
prisma/schema.prisma           duomenų modelis (kategorijos, prekės, nuotraukos, dydžiai, užsakymai)
prisma/seed.ts                 pavyzdiniai duomenys
src/app/(shop)/                parduotuvės puslapiai
src/app/admin/                 admin panelė (prisijungimas + (panel) grupė)
src/app/api/mokejimai/seb/     SEB callback
src/lib/payments/seb.ts        SEB e. prekybos (EveryPay v4) klientas
src/lib/orders.ts              užsakymų kūrimas, mokėjimo sinchronizavimas, likučiai
src/lib/auth.ts                admin sesijos (HMAC pasirašyti slapukai)
src/components/shop|admin      UI komponentai
```
