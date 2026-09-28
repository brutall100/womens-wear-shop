/** Parduotuvės duomenys – keiskite pagal savo įmonę. */
export const site = {
  name: "VĖJA",
  tagline: "Moteriški drabužiai",
  description:
    "Moteriškų drabužių parduotuvė Lietuvoje. Ramios spalvos, natūralūs audiniai, ribotos kolekcijos.",
  email: "info@veja.lt",
  phone: "+370 600 12345",
  url: process.env.APP_URL ?? "http://localhost:3000",
  address: "Gedimino pr. 1, LT-01103 Vilnius",
  workingHours: "I–V 9:00–18:00",
  company: {
    legalName: "MB „Vėja“",
    code: "305123456",
    vatCode: "LT100012345678",
    bank: "AB SEB bankas",
    iban: "LT00 7044 0000 0000 0000",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
  /** Nemokamas pristatymas nuo šios sumos (centais) */
  freeShippingFromCents: 6000,
  /** Standartinis PVM tarifas Lietuvoje */
  vatRate: 21,
} as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
