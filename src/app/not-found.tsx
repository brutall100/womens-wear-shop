import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Puslapis nerastas</h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        Tokio puslapio nėra arba prekė nebeparduodama. Grįžkite į pradžią ir apsižvalgykite kolekcijoje.
      </p>
      <Link href="/" className="btn-primary mt-8">Į pradžią</Link>
    </div>
  );
}
