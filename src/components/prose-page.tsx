export function ProsePage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
      <h1 className="font-serif text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/85 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </article>
  );
}
