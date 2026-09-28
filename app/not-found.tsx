import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <p className="font-serif text-3xl tracking-[0.18em]">MOT</p>
      <h1 className="mt-6 font-serif text-5xl">Puslapis nerastas</h1>
      <Link href="/" className="mt-6 inline-block underline">
        Į pradžią
      </Link>
    </main>
  );
}
