import Link from "next/link";
import { formatEur } from "@/lib/money";

export function Footer({
  email,
  phone,
  pickup,
  freeShippingCents,
}: {
  email: string;
  phone: string;
  pickup: string;
  freeShippingCents: number;
}) {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-3xl tracking-[0.18em]">MOT</p>
          <p className="mt-3 max-w-xs text-sm text-muted">Moteriški drabužiai Lietuvos rinkai. Viena kalba, kainos eurais.</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Pristatymas</p>
          <p className="mt-2 text-muted">Nemokamas pristatymas nuo {formatEur(freeShippingCents)}.</p>
          <p className="mt-2 text-muted">{pickup || "Atsiėmimo vietą įrašykite administracijoje."}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Kontaktai</p>
          <p className="mt-2 text-muted">{email || "El. paštas dar neįrašytas"}</p>
          <p className="text-muted">{phone || "Telefonas dar neįrašytas"}</p>
          <p className="mt-4 text-muted">Mokėjimas per SEB banką.</p>
          <Link href="/admin" className="mt-4 inline-block underline">
            Valdymas
          </Link>
        </div>
      </div>
    </footer>
  );
}
