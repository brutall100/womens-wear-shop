"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  deleteProduct,
  saveProduct,
  type ProductFormValues,
} from "@/app/admin/(panel)/prekes/actions";
import { centsToInput } from "@/lib/money";
import { SIZES } from "@/lib/site";
import { buttonClass, cn } from "@/lib/ui";
import { slugify } from "@/lib/slug";

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  summary: string;
  description: string;
  priceCents: number | null;
  compareAtCents: number | null;
  sku: string;
  color: string;
  material: string;
  careInstructions: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  images: Array<{ url: string; alt: string }>;
  variants: Array<{ size: string; stock: number }>;
};

export function ProductForm({
  product,
  categories,
}: {
  product: ProductFormData;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState({
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    summary: product.summary,
    description: product.description,
    price: centsToInput(product.priceCents),
    compareAt: centsToInput(product.compareAtCents),
    sku: product.sku,
    color: product.color,
    material: product.material,
    careInstructions: product.careInstructions,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
  });
  const [images, setImages] = useState(product.images);
  const [variants, setVariants] = useState(
    product.variants.length > 0
      ? product.variants
      : SIZES.slice(0, 5).map((size) => ({ size, stock: 0 as number })),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(product.slug));
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/ikelti", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Nuotraukos įkelti nepavyko");
        continue;
      }
      setImages((current) => [...current, { url: result.url, alt: "" }]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setMessage(null);
    setErrors({});

    const payload: ProductFormValues = {
      id: product.id,
      ...values,
      images: images.map((image) => ({ url: image.url, alt: image.alt })),
      variants: variants
        .filter((variant) => variant.size.trim() !== "")
        .map((variant) => ({ size: variant.size, stock: variant.stock })),
    };

    const result = await saveProduct(payload);
    setPending(false);

    if (!result.ok) {
      setMessage(result.message);
      setErrors(result.fieldErrors ?? {});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/admin/prekes");
    router.refresh();
  }

  async function handleDelete() {
    if (!product.id) return;
    if (!window.confirm("Ar tikrai norite ištrinti šią prekę?")) return;

    setPending(true);
    const result = await deleteProduct(product.id);
    setPending(false);

    if (result.message) window.alert(result.message);
    router.push("/admin/prekes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <p className="mb-5 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Pagrindinė informacija</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="name">
                  Pavadinimas *
                </label>
                <input
                  id="name"
                  className={cn("field", errors.name && "border-danger")}
                  value={values.name}
                  onChange={(event) => {
                    update("name", event.target.value);
                    if (!slugTouched) update("slug", slugify(event.target.value));
                  }}
                  placeholder="Pvz. Lininė suknelė „Vakarė“"
                />
                {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="slug">
                  Nuoroda (URL)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">/preke/</span>
                  <input
                    id="slug"
                    className="field"
                    value={values.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      update("slug", event.target.value);
                    }}
                    placeholder="linine-suknele-vakare"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="summary">
                  Trumpas aprašymas
                </label>
                <textarea
                  id="summary"
                  rows={2}
                  className="field"
                  value={values.summary}
                  onChange={(event) => update("summary", event.target.value)}
                  placeholder="Vienas sakinys, matomas prekių sąraše"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="description">
                  Pilnas aprašymas
                </label>
                <textarea
                  id="description"
                  rows={9}
                  className="field font-sans"
                  value={values.description}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="Medžiaga, kirpimas, modelio ūgis…&#10;&#10;Naują pastraipą atskirkite tuščia eilute."
                />
                <p className="mt-1 text-xs text-muted">
                  Pastraipas atskirkite tuščia eilute.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Kaina</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="price">
                  Kaina (€) *
                </label>
                <input
                  id="price"
                  inputMode="decimal"
                  className={cn("field", errors.price && "border-danger")}
                  value={values.price}
                  onChange={(event) => update("price", event.target.value)}
                  placeholder="49,90"
                />
                {errors.price && <p className="mt-1 text-xs text-danger">{errors.price}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="compareAt">
                  Sena kaina (€)
                </label>
                <input
                  id="compareAt"
                  inputMode="decimal"
                  className={cn("field", errors.compareAt && "border-danger")}
                  value={values.compareAt}
                  onChange={(event) => update("compareAt", event.target.value)}
                  placeholder="69,00"
                />
                {errors.compareAt && (
                  <p className="mt-1 text-xs text-danger">{errors.compareAt}</p>
                )}
              </div>
              <div>
                <label className="field-label" htmlFor="sku">
                  Prekės kodas
                </label>
                <input
                  id="sku"
                  className="field"
                  value={values.sku}
                  onChange={(event) => update("sku", event.target.value)}
                  placeholder="VEJ-0001"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Kainos nurodomos su PVM. Sena kaina rodoma perbraukta, jei ji didesnė už
              dabartinę.
            </p>
          </section>

          <section className="border border-line bg-shell p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Nuotraukos</h2>
              <span className="text-xs text-muted">{images.length} / 10</span>
            </div>

            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <li key={`${image.url}-${index}`} className="border border-line">
                    <div className="relative aspect-[3/4] bg-sand">
                      <Image
                        src={image.url}
                        alt={image.alt || "Prekės nuotrauka"}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] text-cream">
                          Pagrindinė
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 p-1.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          className="px-1.5 text-xs text-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                          aria-label="Perkelti kairėn"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === images.length - 1}
                          className="px-1.5 text-xs text-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                          aria-label="Perkelti dešinėn"
                        >
                          →
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setImages((current) => current.filter((_, i) => i !== index))
                        }
                        className="px-1.5 text-xs text-muted hover:text-danger cursor-pointer"
                      >
                        Šalinti
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={(event) => handleUpload(event.target.files)}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className={buttonClass("secondary", "md", "cursor-pointer")}
              >
                {uploading ? "Keliama…" : "Įkelti nuotraukas"}
              </label>
              <span className="text-xs text-muted">JPG, PNG, WebP iki 6 MB</span>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className="field"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="arba įklijuokite nuotraukos nuorodą (https://…)"
              />
              <button
                type="button"
                onClick={() => {
                  if (!imageUrl.trim()) return;
                  setImages((current) => [...current, { url: imageUrl.trim(), alt: "" }]);
                  setImageUrl("");
                }}
                className={buttonClass("secondary", "md", "shrink-0")}
              >
                Pridėti
              </button>
            </div>
          </section>

          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Dydžiai ir likučiai</h2>
            <p className="mt-1 text-xs text-muted">
              Dydis rodomas prekės puslapyje tik tuomet, kai likutis didesnis už 0.
            </p>

            <ul className="mt-4 space-y-2">
              {variants.map((variant, index) => (
                <li key={index} className="flex items-center gap-3">
                  <input
                    className="field w-24"
                    value={variant.size}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, size: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="M"
                    aria-label="Dydis"
                  />
                  <input
                    type="number"
                    min={0}
                    className="field w-28"
                    value={variant.stock}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, stock: Number(event.target.value) || 0 }
                            : item,
                        ),
                      )
                    }
                    aria-label="Likutis"
                  />
                  <span className="text-xs text-muted">vnt.</span>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((current) => current.filter((_, i) => i !== index))
                    }
                    className="ml-auto text-xs text-muted hover:text-danger cursor-pointer"
                  >
                    Šalinti
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setVariants((current) => [...current, { size: "", stock: 0 }])}
              className={buttonClass("secondary", "sm", "mt-4")}
            >
              + Pridėti dydį
            </button>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Publikavimas</h2>

            <label className="mt-4 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="mt-1 accent-[var(--color-clay)]"
              />
              <span>
                Rodoma parduotuvėje
                <span className="block text-xs text-muted">
                  Išjungus prekė lieka tik administravime
                </span>
              </span>
            </label>

            <label className="mt-3 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(event) => update("isFeatured", event.target.checked)}
                className="mt-1 accent-[var(--color-clay)]"
              />
              <span>
                Sezono favoritas
                <span className="block text-xs text-muted">
                  Rodoma pradžios puslapyje
                </span>
              </span>
            </label>

            <div className="mt-4">
              <label className="field-label" htmlFor="sortOrder">
                Rikiavimo numeris
              </label>
              <input
                id="sortOrder"
                type="number"
                min={0}
                className="field"
                value={values.sortOrder}
                onChange={(event) => update("sortOrder", Number(event.target.value) || 0)}
              />
              <p className="mt-1 text-xs text-muted">Mažesnis numeris rodomas pirmiau.</p>
            </div>
          </section>

          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Kategorija</h2>
            <select
              className="field mt-4 cursor-pointer"
              value={values.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              aria-label="Kategorija"
            >
              <option value="">Be kategorijos</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </section>

          <section className="border border-line bg-shell p-5">
            <h2 className="text-lg">Savybės</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="color">
                  Spalva
                </label>
                <input
                  id="color"
                  className="field"
                  value={values.color}
                  onChange={(event) => update("color", event.target.value)}
                  placeholder="Smėlio"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="material">
                  Sudėtis
                </label>
                <input
                  id="material"
                  className="field"
                  value={values.material}
                  onChange={(event) => update("material", event.target.value)}
                  placeholder="100 % linas"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="careInstructions">
                  Priežiūra
                </label>
                <textarea
                  id="careInstructions"
                  rows={3}
                  className="field"
                  value={values.careInstructions}
                  onChange={(event) => update("careInstructions", event.target.value)}
                  placeholder="Skalbti 30 °C, nebalinti."
                />
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass("primary", "lg")}>
          {pending ? "Saugoma…" : product.id ? "Išsaugoti pakeitimus" : "Sukurti prekę"}
        </button>
        <Link href="/admin/prekes" className={buttonClass("secondary", "lg")}>
          Atšaukti
        </Link>
        {product.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className={buttonClass("danger", "lg", "ml-auto")}
          >
            Ištrinti
          </button>
        )}
      </div>
    </form>
  );
}
