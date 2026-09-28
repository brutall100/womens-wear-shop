import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Administravimas",
    template: "%s · Administravimas",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
