import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-7xl">404</p>
      <p className="text-muted">Tokio puslapio nėra.</p>
      <Link href="/" className="btn-primary">
        Į pradžią
      </Link>
    </div>
  );
}
