import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/root-document";
import { siteMetadata } from "@/lib/site";
import "./globals.css";

// GitHub Pages demo: a static copy of the shop, data is kept in the visitor's browser.
export const metadata: Metadata = siteMetadata;

export default function DemoRootLayout({ children }: { children: ReactNode }) {
  return <RootDocument>{children}</RootDocument>;
}
