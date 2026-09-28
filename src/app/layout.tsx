import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { shopConfig } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${shopConfig.name} – moteriški drabužiai`,
    template: `%s | ${shopConfig.name}`,
  },
  description:
    "Moteriškų drabužių internetinė parduotuvė Lietuvoje. Suknelės, palaidinės, kelnės, paltai ir aksesuarai. Saugus apmokėjimas per SEB.",
  metadataBase: new URL(shopConfig.siteUrl),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
