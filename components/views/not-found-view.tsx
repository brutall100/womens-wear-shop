import Link from "next/link";
import { ArrowIcon, ScissorsIcon } from "@/components/icons";
import { routes } from "@/lib/routes";

export function NotFoundView({ withLogo = false }: { withLogo?: boolean }) {
  return (
    <div className="container-page max-w-2xl py-16 sm:py-24">
      {withLogo ? (
        <Link href={routes.home} className="logo">
          MOT
        </Link>
      ) : null}
      <div className="pattern-card mt-8">
        <ScissorsIcon size={40} className="text-accent-ink" />
        <p className="eyebrow mt-5">Klaida 404</p>
        <h1 className="mt-3 text-5xl">Šis puslapis nukirptas</h1>
        <p className="mt-4 text-muted">Tokios nuorodos parduotuvėje nėra. Galbūt prekė jau išparduota arba adresas su klaida.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={routes.catalog} className="btn btn-primary">
            Į katalogą <ArrowIcon size={18} />
          </Link>
          <Link href={routes.home} className="btn btn-ghost">
            Į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
