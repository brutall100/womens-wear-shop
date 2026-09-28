import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="font-serif text-5xl">Puslapis nerastas</h1>
      <p className="mt-4 text-muted">Šios nuorodos parduotuvėje nėra.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Į pradžią
      </Link>
    </div>
  );
}
