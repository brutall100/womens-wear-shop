import { Besley, DM_Mono, DM_Sans } from "next/font/google";

// All three render Lithuanian letters (ą č ę ė į š ų ū ž) correctly – checked one by one.
const display = Besley({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-besley",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const fontClasses = [display.variable, body.variable, mono.variable].join(" ");
