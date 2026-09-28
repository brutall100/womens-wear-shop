"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { slugify } from "@/lib/format";
import { saveProduct } from "./actions";

type Variant = { key: string; id?: string; size: string; stock: string };
type NewImage = { key: string; file: File; preview: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  variants: { id: string; size: string; stock: number }[];
};

const SIZE_PRESETS = [
  { label: "XS–XL", sizes: ["XS", "S", "M", "L", "XL"] },
  { label: "34–44", sizes: ["34", "36", "38", "40", "42", "44"] },
  { label: "Vienas dydis", sizes: ["Universalus"] },
];

let keyCounter = 0;
const nextKey = () => `k${++keyCounter}`;

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [images, setImages] = useState<string[]>(initial.images);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>(() =>
    initial.variants.map((v) => ({ key: nextKey(), id: v.id, size: v.size, stock: String(v.stock) })),
  );
  const [dragOver, setDragOver] = useState(false);
  const [, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const errors = state?.fieldErrors ?? {};

  useEffect(() => {
    if (state?.error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  function addFiles(files: File[]) {
    const list = files.filter((f) => f.type.startsWith("image/"));
    setNewImages((prev) => [...prev, ...list.map((file) => ({ key: nextKey(), file, preview: URL.createObjectURL(file) }))]);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    newImages.forEach((img) => fd.append("newImages", img.file));
    startTransition(() => action(fd));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length + newImages.length) return;
    // Įkeltos (dar neišsaugotos) nuotraukos visada eina po esamų
    if (from < images.length && to < images.length) {
      const next = [...images];
      [next[from], next[to]] = [next[to], next[from]];
      setImages(next);
    } else if (from >= images.length && to >= images.length) {
      const next = [...newImages];
      const a = from - images.length;
      const b = to - images.length;
      [next[a], next[b]] = [next[b], next[a]];
      setNewImages(next);
    }
  }

  function applyPreset(sizes: string[]) {
    setVariants((prev) => {
      const existing = new Set(prev.map((v) => v.size.toLowerCase()));
      return [...prev, ...sizes.filter((s) => !existing.has(s.toLowerCase())).map((size) => ({ key: nextKey(), size, stock: "0" }))];
    });
  }

  const allImages = [
    ...images.map((url) => ({ key: url, src: url, onRemove: () => setImages(images.filter((u) => u !== url)) })),
    ...newImages.map((img) => ({
      key: img.key,
      src: img.preview,
      onRemove: () => setNewImages(newImages.filter((n) => n.key !== img.key)),
    })),
  ];

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="existingImages" value={JSON.stringify(images)} />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock === "" ? 0 : v.stock })))}
      />

      <div className="space-y-6">
        {state?.error && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent-dark">{state.error}</div>
        )}

        <section className="card space-y-5 p-6">
          <div>
            <label htmlFor="name" className="label">
              Pavadinimas
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="pvz. Lino suknelė „Vasara“"
              className="input text-base"
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label htmlFor="description" className="label">
              Aprašymas
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initial.description}
              rows={8}
              placeholder={"Medžiaga, sudėtis, kirpimas, priežiūra…\n\nSudėtis: 100 % linas\nModelis dėvi S dydį, ūgis 172 cm"}
              className="input leading-relaxed"
            />
            <p className="mt-1 text-xs text-muted">Nauja eilutė aprašyme bus rodoma kaip nauja pastraipa.</p>
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Nuotraukos</h2>
            <span className="text-xs text-muted">Pirma nuotrauka — pagrindinė</span>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(Array.from(e.dataTransfer.files));
            }}
            className={`grid grid-cols-2 gap-3 rounded-xl sm:grid-cols-4 ${dragOver ? "ring-2 ring-ink ring-offset-4" : ""}`}
          >
            {allImages.map((img, i) => (
              <div key={img.key} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-line bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-cream uppercase">
                    Pagrindinė
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex gap-1">
                    <IconButton label="Kairėn" onClick={() => moveImage(i, i - 1)}>
                      ←
                    </IconButton>
                    <IconButton label="Dešinėn" onClick={() => moveImage(i, i + 1)}>
                      →
                    </IconButton>
                  </div>
                  <IconButton label="Pašalinti" onClick={img.onRemove}>
                    ✕
                  </IconButton>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-sm text-muted transition hover:border-ink hover:text-ink"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="px-2 text-center">Įkelti arba nutempti nuotraukas</span>
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <p className="mt-3 text-xs text-muted">JPG, PNG arba WEBP, iki 8 MB. Rekomenduojamas santykis 3:4 (pvz. 1200×1600 px).</p>
        </section>

        <section className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Dydžiai ir likučiai</h2>
            <div className="flex flex-wrap gap-2">
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.sizes)}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-ink"
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>
          {variants.length > 0 && (
            <div className="mb-2 grid grid-cols-[1fr_8rem_2.5rem] gap-3 px-1 text-xs font-semibold text-muted uppercase">
              <span>Dydis</span>
              <span>Likutis, vnt.</span>
              <span />
            </div>
          )}
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={v.key} className="grid grid-cols-[1fr_8rem_2.5rem] items-center gap-3">
                <input
                  value={v.size}
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}
                  placeholder="pvz. M"
                  className="input"
                  aria-label="Dydis"
                />
                <input
                  value={v.stock}
                  inputMode="numeric"
                  onChange={(e) =>
                    setVariants(variants.map((x, j) => (j === i ? { ...x, stock: e.target.value.replace(/\D/g, "") } : x)))
                  }
                  className="input"
                  aria-label="Likutis"
                />
                <button
                  type="button"
                  onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                  className="h-10 rounded-lg text-muted hover:bg-sand hover:text-accent"
                  aria-label="Pašalinti dydį"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVariants([...variants, { key: nextKey(), size: "", stock: "0" }])}
            className="mt-3 text-sm font-medium underline underline-offset-4"
          >
            + Pridėti dydį
          </button>
          <FieldError message={errors.variants} />
        </section>
      </div>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <section className="card space-y-4 p-6">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold">Rodoma parduotuvėje</span>
              <span className="block text-xs text-muted">Išjungus prekė bus paslėpta</span>
            </span>
            <input type="checkbox" name="isActive" defaultChecked={initial.isActive} className="h-5 w-5 accent-ink" />
          </label>
          <label className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <span>
              <span className="block text-sm font-semibold">Rekomenduojama</span>
              <span className="block text-xs text-muted">Rodoma pradžios puslapyje</span>
            </span>
            <input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured} className="h-5 w-5 accent-ink" />
          </label>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <label htmlFor="price" className="label">
              Kaina, € (su PVM)
            </label>
            <input id="price" name="price" defaultValue={initial.price} inputMode="decimal" placeholder="49,90" className="input" />
            <FieldError message={errors.price} />
          </div>
          <div>
            <label htmlFor="compareAtPrice" className="label">
              Sena kaina, € (nebūtina)
            </label>
            <input
              id="compareAtPrice"
              name="compareAtPrice"
              defaultValue={initial.compareAtPrice}
              inputMode="decimal"
              placeholder="Nuolaidai rodyti"
              className="input"
            />
            <FieldError message={errors.compareAtPrice} />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div>
            <label htmlFor="categoryId" className="label">
              Kategorija
            </label>
            <select id="categoryId" name="categoryId" defaultValue={initial.categoryId} className="input">
              <option value="">— Be kategorijos —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="slug" className="label">
              Nuoroda (URL)
            </label>
            <div className="flex items-center rounded-lg border border-line bg-white pl-3 text-sm focus-within:border-ink">
              <span className="text-muted">/preke/</span>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                className="w-full rounded-r-lg py-2.5 pr-3 outline-none"
              />
            </div>
            <FieldError message={errors.slug} />
          </div>
        </section>

        <button disabled={pending} className="btn-primary w-full py-3.5">
          {pending ? "Saugoma…" : initial.id ? "Išsaugoti pakeitimus" : "Sukurti prekę"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-accent">{message}</p> : null;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-ink hover:bg-white"
    >
      {children}
    </button>
  );
}
