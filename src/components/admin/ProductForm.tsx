"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/(panel)/actions";
import { SIZE_OPTIONS } from "@/lib/config";

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: { size: string; stock: number }[];
  images: { id: string; url: string; position: number }[];
}

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  initial: ProductFormData;
  imageActions?: {
    remove: (formData: FormData) => Promise<void>;
    move: (formData: FormData) => Promise<void>;
  };
}

export function ProductForm({ action, categories, initial, imageActions }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [variants, setVariants] = useState(
    initial.variants.length > 0 ? initial.variants : [{ size: "S", stock: 0 }, { size: "M", stock: 0 }, { size: "L", stock: 0 }],
  );
  const [previews, setPreviews] = useState<string[]>([]);

  const unusedSizes = SIZE_OPTIONS.filter((s) => !variants.some((v) => v.size === s));

  function updateVariant(index: number, patch: Partial<{ size: string; stock: number }>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="card space-y-4 p-6">
          <h2 className="font-medium">Pagrindinė informacija</h2>
          <div>
            <label htmlFor="name" className="label">Pavadinimas *</label>
            <input id="name" name="name" defaultValue={initial.name} required className="input" placeholder="pvz. Lininė midi suknelė „Rūta“" />
          </div>
          <div>
            <label htmlFor="description" className="label">Aprašymas</label>
            <textarea
              id="description"
              name="description"
              rows={8}
              defaultValue={initial.description}
              className="input font-sans"
              placeholder={"Aprašykite audinį, kirpimą, priežiūrą.\n\nAtskiros pastraipos – tuščia eilutė tarp jų."}
            />
            <p className="mt-1 text-xs text-ink-muted">Tuščia eilutė tarp pastraipų sukuria atskirą pastraipą parduotuvėje.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sku" className="label">Prekės kodas (SKU)</label>
              <input id="sku" name="sku" defaultValue={initial.sku} className="input" placeholder="MZ-0001" />
            </div>
            <div>
              <label htmlFor="slug" className="label">Nuorodos dalis (slug)</label>
              <input id="slug" name="slug" defaultValue={initial.slug} className="input" placeholder="sugeneruojama automatiškai" />
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-medium">Kaina</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="label">Kaina, € *</label>
              <input id="price" name="price" defaultValue={initial.price} required inputMode="decimal" className="input" placeholder="49,90" />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className="label">Kaina prieš nuolaidą, €</label>
              <input id="compareAtPrice" name="compareAtPrice" defaultValue={initial.compareAtPrice} inputMode="decimal" className="input" placeholder="neprivaloma" />
              <p className="mt-1 text-xs text-ink-muted">Jei nurodyta ir didesnė už kainą – rodoma perbraukta su „Akcija“ ženklu.</p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Dydžiai ir likučiai *</h2>
            {unusedSizes.length > 0 && (
              <select
                className="input w-auto py-2 text-xs"
                value=""
                onChange={(e) => {
                  if (e.target.value) setVariants((prev) => [...prev, { size: e.target.value, stock: 0 }]);
                }}
                aria-label="Pridėti dydį"
              >
                <option value="">+ Pridėti dydį</option>
                {unusedSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  name="variantSize"
                  value={v.size}
                  onChange={(e) => updateVariant(i, { size: e.target.value })}
                  className="input w-36"
                  placeholder="Dydis"
                  required
                />
                <input
                  name="variantStock"
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: parseInt(e.target.value, 10) || 0 })}
                  className="input w-28"
                  aria-label="Likutis"
                />
                <span className="text-xs text-ink-muted">vnt.</span>
                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
                  className="btn-ghost ml-auto text-xs text-danger"
                  disabled={variants.length === 1}
                >
                  Pašalinti
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Aksesuarams naudokite vieną dydį „Universalus“. Pašalintas dydis ištrinamas išsaugant.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="font-medium">Nuotraukos</h2>
          {initial.images.length > 0 && imageActions && (
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {initial.images.map((img, i) => (
                <li key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
                  <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
                  {i === 0 && <span className="badge absolute left-2 top-2 bg-ink/80 text-cream">Pagrindinė</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                    <form action={imageActions.move} className="flex gap-1">
                      <input type="hidden" name="imageId" value={img.id} />
                      <button type="submit" name="direction" value="up" disabled={i === 0} className="rounded bg-white/90 px-2 py-1 text-xs disabled:opacity-30" aria-label="Perkelti pirmyn">←</button>
                      <button type="submit" name="direction" value="down" disabled={i === initial.images.length - 1} className="rounded bg-white/90 px-2 py-1 text-xs disabled:opacity-30" aria-label="Perkelti atgal">→</button>
                    </form>
                    <form action={imageActions.remove}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <button type="submit" className="rounded bg-white/90 px-2 py-1 text-xs text-danger">Šalinti</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <label htmlFor="images" className="label">Įkelti nuotraukas</label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-medium file:text-cream"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setPreviews(files.map((f) => URL.createObjectURL(f)));
              }}
            />
            <p className="mt-1 text-xs text-ink-muted">JPG, PNG, WEBP arba AVIF, iki 8 MB. Rekomenduojamas santykis 3:4.</p>
            {previews.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {previews.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="h-24 w-18 rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <label htmlFor="imageUrl" className="label">…arba nuotraukos nuoroda</label>
            <input id="imageUrl" name="imageUrl" type="url" className="input" placeholder="https://…" />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="font-medium">Matomumas</h2>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={initial.isActive} className="accent-ink" />
            Rodyti parduotuvėje
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured} className="accent-ink" />
            Išskirti pradiniame puslapyje
          </label>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-medium">Kategorija</h2>
          <select name="categoryId" defaultValue={initial.categoryId} className="input">
            <option value="">Be kategorijos</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </section>

        <div className="card sticky top-6 p-6">
          {state.error && <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>}
          {state.success && <p className="mb-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success" role="status">{state.success}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Saugoma…" : initial.id ? "Išsaugoti pakeitimus" : "Sukurti prekę"}
          </button>
        </div>
      </aside>
    </form>
  );
}
