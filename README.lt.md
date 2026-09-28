[English](README.md) · **Lietuviškai**

# MOT – moteriškų drabužių parduotuvė

Moteriškų drabužių parduotuvė Lietuvai su savo administracija ir mokėjimu per SEB banką, sukurta siuvėjos dirbtuvės stiliumi.

**[Gyva demo versija](https://brutall100.github.io/mot-fashion-shop/)** · **[Kodas](https://github.com/brutall100/mot-fashion-shop)**

![MOT parduotuvės pradžia šviesiu režimu](docs/screenshot.webp)

| Tamsus režimas | Telefonas (390 px) |
| --- | --- |
| ![MOT parduotuvė tamsiu režimu](docs/screenshot-dark.webp) | ![MOT parduotuvė telefone](docs/screenshot-mobile.webp) |

## Apie projektą

MOT – nedidelė internetinė parduotuvė: pirkėja naršo kolekciją, pasirenka dydį, užpildo atsiskaitymo formą ir sumoka per SEB interneto banką. Parduotuvės savininkė administracijoje keičia prekes, kainas ir nuotraukas bei stebi užsakymus. Visi tekstai lietuviški, kainos eurais.

Projektas veikia dviem režimais:

| | Demo (GitHub Pages) | Pilna versija (kompiuteryje ar serveryje) |
| --- | --- | --- |
| Duomenys | saugomi lankytojo naršyklėje (`localStorage`) | SQLite duomenų bazė |
| Mokėjimas | aiškiai pažymėtas bandomasis banko langas | SEB Bank Link su RSA parašais (kol neįkelti sutarties raktai – bandomasis bankas) |
| Administracija | veikia naršyklėje, slaptažodis `mot-admin` | apsaugota slaptažodžio „hash“ ir pasirašytu slapuku |
| Reikia | nieko – tik atidaryti nuorodą | Node.js 22.14 ar naujesnio |

Demo – tai statinė tos pačios programos kopija: tie patys puslapiai ir komponentai, pakeista tik duomenų dalis (vietoje duomenų bazės – naršyklės saugykla).

## Galimybės

- **Parduotuvė:** katalogas su kategorijomis, paieška, suprantanti lietuviškas raides (`siaure` randa „Šiaurė“), rikiavimas; prekės puslapis su nuotraukomis, dydžiais ir kiekiu; krepšelis su juosta „iki nemokamo pristatymo liko…“; atsiskaitymas su LP Express, Omniva, kurjeriu arba atsiėmimu.
- **Mokėjimai:** SEB Bank Link (Payment Initiation v009) – užklausos pasirašomos RSA-SHA512, banko atsakymai tikrinami, suma sutikrinama; kainos visada perskaičiuojamos serveryje.
- **Administracija:** prekės (kurti, keisti, paslėpti, ištrinti, nuotraukos), užsakymai ir jų būsenos, kontaktai ir nemokamo pristatymo riba, SEB raktai. Įkeliamos nuotraukos naršyklėje sumažinamos, paverčiamos WebP ir išvalomos nuo EXIF (GPS) duomenų.
- **Dizainas „Ateljė“:** gyvas fonas (kirpimo lekalų popierius, šilti lempos švytėjimai, „siuvama“ dygsnio linija, krentančios sagos, smeigtukai, adatos ir siūlai); viršuje juosta kaip siuvėjos centimetras; prekių kortelės kaip kabančios drabužių etiketės; mygtukai kaip prisiūtos etiketės su bangele; į krepšelį nuskrendanti etiketė; suskaičiuojantys skaičiai; slenkant atsirandantys blokai.
- **Šviesus ir tamsus režimas:** pagal sistemos nustatymą, su jungikliu, kuris įsimena pasirinkimą ir neleidžia puslapiui sumirgėti kraunantis.
- **Prieinamumas:** nuoroda „Pereiti prie turinio“, matomas fokusas, visi laukeliai su `<label>`, alt tekstai, `prefers-reduced-motion` sustabdo judėjimą, kiekvienos spalvų poros kontrastas patikrintas pagal WCAG AA.
- **Saugumas:** administratoriaus slaptažodis saugomas kaip scrypt „hash“ (niekada atviru tekstu), pasirašytas httpOnly slapukas, ribojami neteisingi prisijungimo bandymai, SQL užklausos su placeholder'iais, slapti duomenys – `.env` faile.

## Technologijos

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) išdėstymui + paprastas CSS teminėms detalėms
- Į Node.js įmontuota SQLite (`node:sqlite`) ir Node `crypto` – atskiro duomenų bazės serverio nereikia
- GitHub Actions → GitHub Pages demo versijai

**Šriftai** (Google Fonts per `next/font`, laikomi kartu su svetaine): **Besley** – antraštėms, **DM Sans** – tekstui, **DM Mono** – kainoms ir užsakymų numeriams. Kiekvienas patikrintas su visomis lietuviškomis raidėmis (ą č ę ė į š ų ū ž) – ne vienas populiarus šriftas sugadina „ū“.

**Spalvų paletė** – visos spalvos viename faile [`app/styles/palette.css`](app/styles/palette.css):

| Kintamasis | Šviesus | Tamsus | Kur naudojama |
| --- | --- | --- | --- |
| `--bg` | `#F3ECE2` linas | `#1C1612` riešutas | puslapio fonas |
| `--surface` | `#FFFAF3` | `#28201A` | kortelės, antraštė, formos |
| `--text` | `#2B211B` espresso | `#F3E9DC` grietinėlė | tekstas (13,4:1 / 14,9:1) |
| `--accent` | `#B5522B` terakota | `#E07A50` | mygtukai, ženkliukai, švytėjimas |
| `--accent-2` | `#6F8466` šalavijas | `#9DB38F` | antras akcentas, kreidos žymės |

Terakota ant lino smulkiam tekstui per šviesi (4,3:1), todėl smulkiam tekstui naudojamas tamsesnis atspalvis `#A2461F` (5,2:1).

## Ko išmokau

- Kaip veikia banko nuoroda nuo pradžios iki galo: pasirašytas paketas, pirkėjos nukreipimas į banką POST forma ir pasitikėjimas tik pasirašytu banko atsakymu.
- Kaip vieną Next.js programą paleisti dviem režimais: `pageExtensions` statinei kopijai parenka `*.demo.tsx` maršrutus, o pilna versija pasilieka API ir duomenų bazę.
- Kaip bendras taisykles (kainos, likutis, pristatymas) naudoti ir serveryje, ir naršyklėje, kad demo elgtųsi kaip tikra parduotuvė.
- Kaip sukurti teminę dizaino sistemą su CSS kintamaisiais ir `light-dark()`, o gyvą foną animuoti tik `transform` ir `opacity` savybėmis.
- Kad šriftus reikia patikrinti su lietuviškomis raidėmis prieš pasirenkant, o kontrastą – pamatuoti, ne spėti.
- Kaip saugoti slaptažodžius scrypt „hash“ forma ir kaip neleisti paslaptims patekti į git.

## Paleidimas kompiuteryje

Reikia [Node.js](https://nodejs.org/) 22.14 ar naujesnio.

```bash
git clone https://github.com/brutall100/mot-fashion-shop.git
cd mot-fashion-shop
npm install
cp .env.example .env
npm run dev
```

- Parduotuvė: http://localhost:3000
- Administracija: http://localhost:3000/admin – kol `ADMIN_PASSWORD_HASH` tuščias, `npm run dev` priima slaptažodį `mot-admin`.

**Gyvam serveriui (`npm start`) reikia tikro slaptažodžio:**

```bash
npm run hash-password -- "jusu-ilgas-slaptazodis"   # atspausdins ADMIN_PASSWORD_HASH=...
# tą eilutę įklijuokite į .env, tada:
npm run build
npm start
```

**Demo versija naršyklėje (tie patys failai kaip GitHub Pages):**

```bash
npm run build:demo   # statinė svetainė atsiranda aplanke out/
npx serve out        # atidarykite jo parodytą adresą
```

**Testai:** `npm test` (atsiskaitymo taisyklės, paieška, slaptažodžių „hash“, SEB parašai, pristatymas).

### Aplinkos kintamieji (`.env`)

Nukopijuokite `.env.example` į `.env` (`cp .env.example .env`) ir užpildykite:

| Pavadinimas | Kas tai |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | administratoriaus slaptažodžio „hash“ iš `npm run hash-password` |
| `AUTH_SECRET` | paslaptis prisijungimo slapukui pasirašyti (16+ simbolių); jei tuščia, sukuriama automatiškai |
| `APP_URL` | viešas parduotuvės adresas be pasviro brūkšnio gale – bankas grąžina pirkėją čia |
| `MOT_DB_PATH` | kur laikomas SQLite failas (numatytai `data/mot.db`) |

`.env` failas į git nekeliamas – jis įrašytas `.gitignore`.

### SEB prijungimas

Kol **Valdymas → SEB** neįrašyti visi keturi sutarties duomenys, mokėjimai eina į bandomąjį banką ir pinigai nenuskaičiuojami:

1. prekybininko ID (`VK_SND_ID`, iki 15 simbolių);
2. banko adresas, prasidedantis `https://` (SEB, BIC `CBVILT2X`, dažnai `https://pi.swedbank.com/LT/CBVILT2X`);
3. jūsų privatus RSA raktas (PEM) – viešą dalį atiduodate bankui;
4. banko sertifikatas, kuriuo tikrinami atsakymai.

Užklausa `1012`, versija `009`, kalba `LIT`, valiuta `EUR`. Grąžinimo adresai sutarčiai: `https://jusu-domenas/api/seb/return` ir `https://jusu-domenas/api/seb/cancel`.

## Projekto struktūra

```text
app/
  (shop)/            parduotuvės puslapiai: pradžia, katalogas, prekė, krepšelis, atsiskaitymas, užsakymas, bankas
  admin/             administracija: prisijungimas, prekės, užsakymai, SEB, parduotuvė
  api/               atsiskaitymas, SEB grąžinimas, bandomasis bankas, administracijos API (tik pilnai versijai)
  styles/            palette.css (visos spalvos), bazė, komponentai, gyvas fonas
  *.demo.tsx         tie patys maršrutai statinei GitHub Pages versijai
components/          sąsajos dalys; views/ naudoja abu režimai, demo/ skaito naršyklės saugyklą
lib/                 bendros taisyklės (katalogas, atsiskaitymas, pristatymas, pinigai),
                     db.ts (SQLite), seb.ts + payments.ts (banko nuoroda), auth.ts + password.ts,
                     demo/store.ts (naršyklės saugykla), client-api.ts (serveris arba demo)
public/images/       WebP nuotraukos (prekės 720 px, pagrindinė 960 px)
scripts/             build-demo.mjs, hash-password.ts
docs/                šio README ekrano nuotraukos
.github/workflows/   GitHub Pages diegimas
```

## Padėkos

- Prekių ir parduotuvės nuotraukos: [Unsplash](https://unsplash.com/) (Unsplash licencija).
- Šriftai: Besley, DM Sans ir DM Mono iš [Google Fonts](https://fonts.google.com/) (SIL Open Font License).
- Banko nuorodos laukų tvarka – pagal Swedbank / SEB Payment Initiation v009 dokumentaciją.

## Licencija

[MIT](LICENSE) © 2026 brutall100
