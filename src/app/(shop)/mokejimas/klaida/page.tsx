import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Mokėjimo klaida",
  robots: { index: false },
};

export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ priezastis?: string }>;
}) {
  const { priezastis } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="eyebrow">Mokėjimas</p>
      <h1 className="mt-3 text-4xl">Mokėjimo patvirtinti nepavyko</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Banko atsakymo nepavyko patikrinti, todėl užsakymo apmokėti negalime.
        Jei pinigai buvo nurašyti, susisiekite su mumis – patikrinsime rankiniu būdu.
      </p>
      {priezastis && (
        <p className="mt-4 inline-block border border-line bg-shell px-4 py-2 text-xs text-muted">
          Priežastis: {priezastis}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/krepselis" className={buttonClass("primary", "lg")}>
          Grįžti į krepšelį
        </Link>
        <Link href="/kontaktai" className={buttonClass("secondary", "lg")}>
          Susisiekti
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        {site.email} · {site.phone}
      </p>
    </div>
  );
}
