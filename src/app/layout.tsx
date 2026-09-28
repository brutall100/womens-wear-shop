import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { store } from "@/config/store";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: `${store.name} — ${store.tagline}`, template: `%s | ${store.name}` },
  description: store.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt" className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
