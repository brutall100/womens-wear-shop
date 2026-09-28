import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/root-document";
import { siteMetadata } from "@/lib/site";
import "./globals.css";

// Pages read the live database, so they are rendered on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootDocument>{children}</RootDocument>;
}
