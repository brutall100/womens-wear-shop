"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoIcon, TrashIcon } from "@/components/icons";
import { deleteImage, deleteProduct, saveProduct, uploadImages, type SavedImage } from "@/lib/client-api";
import { SIZE_OPTIONS } from "@/lib/labels";
import { asset, isDemo, routes } from "@/lib/routes";

export type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: string[];
  stock: number;
  published: boolean;
  images: SavedImage[];
};

export function ProductForm({ product, categories }: { product: EditableProduct | null; categories: string[] }) {
  const router = useRouter();
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M"]);
  const [extra, setExtra] = useState(() => (product?.sizes ?? []).filter((size) => !SIZE_OPTIONS.includes(size)).join(", "));
  const [images, setImages] = useState<SavedImage[]>(product?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);

  const toggleSize = (size: string) =>
    setSizes((current) => (current.includes(size) ? current.filter((item) => item !== size) : [...current, size]));

  const refresh = () => {
    if (!isDemo) router.refresh();
  };

  return (
    <form
      className="mt-8 grid max-w-3xl gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setSaved("");
        setPending(true);
        const data = new FormData(event.currentTarget);
        const extraSizes = extra
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const result = await saveProduct(product?.id ?? null, {
          name: String(data.get("name") ?? ""),
          description: String(data.get("description") ?? ""),
          price: String(data.get("price") ?? ""),
          category: String(data.get("category") ?? ""),
          stock: Number(data.get("stock")),
          published: data.get("published") === "on",
          sizes: [...sizes.filter((size) => SIZE_OPTIONS.includes(size)), ...extraSizes],
        });
        if (!result.ok) {
          setPending(false);
          setError(result.error);
          return;
        }
        const upload = await uploadImages(result.product.id, files);
        setPending(false);
        if (!upload.ok) {
          setError(upload.error);
          return;
        }
        setImages((current) => [...current, ...upload.images]);
        setFiles([]);
        if (!product) {
          router.push(routes.adminProduct(result.product.id));
          return;
        }
        setSaved("Išsaugota.");
        refresh();
      }}
    >
      <div className="pattern-card grid gap-5">
        <div className="field">
          <label htmlFor="name" className="label">
            Pavadinimas
          </label>
          <input id="name" name="name" required defaultValue={product?.name ?? ""} className="input" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="price" className="label">
              Kaina, €
            </label>
            <input id="price" name="price" required inputMode="decimal" defaultValue={product?.price ?? ""} placeholder="119,00" className="input" />
          </div>
          <div className="field">
            <label htmlFor="stock" className="label">
              Likutis
            </label>
            <input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 1} className="input" />
          </div>
          <div className="field">
            <label htmlFor="category" className="label">
              Kategorija
            </label>
            <input id="category" name="category" required list="kategorijos" defaultValue={product?.category ?? ""} className="input" />
            <datalist id="kategorijos">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="field">
          <label htmlFor="description" className="label">
            Aprašymas
          </label>
          <textarea id="description" name="description" required rows={6} defaultValue={product?.description ?? ""} className="textarea" />
        </div>
        <fieldset>
          <legend className="label">Dydžiai</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => (
              <button key={size} type="button" className="size-option" aria-pressed={sizes.includes(size)} onClick={() => toggleSize(size)}>
                {size}
              </button>
            ))}
          </div>
          <div className="field mt-4">
            <label htmlFor="extra-sizes" className="label">
              Kiti dydžiai, per kablelį
            </label>
            <input id="extra-sizes" value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Vienas dydis" className="input" />
          </div>
        </fieldset>
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input type="checkbox" name="published" defaultChecked={product?.published ?? true} />
          Rodyti parduotuvėje
        </label>
      </div>

      <div className="pattern-card grid gap-4">
        <h2 className="text-2xl">Nuotraukos</h2>
        {images.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <li key={image.id}>
                <img src={asset(image.path)} alt="" width={180} height={240} className="aspect-[3/4] w-full rounded-lg object-cover" />
                <button
                  type="button"
                  className="btn btn-quiet btn-sm mt-1 px-1"
                  onClick={async () => {
                    if (!window.confirm("Pašalinti nuotrauką?")) return;
                    const result = await deleteImage(image.id);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setImages((current) => current.filter((item) => item.id !== image.id));
                    refresh();
                  }}
                >
                  <TrashIcon size={15} /> Pašalinti
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nuotraukų dar nėra.</p>
        )}
        <div className="field">
          <p className="label">JPG, PNG arba WEBP (iki 5 MB)</p>
          <input
            id="files"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="file-input"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          <label htmlFor="files" className="btn btn-ghost w-fit">
            <PhotoIcon size={18} />
            {files.length > 0 ? `Pasirinkta nuotraukų: ${files.length}` : "Pasirinkti nuotraukas"}
          </label>
          <p className="hint">
            {files.length > 0
              ? "Nuotraukos bus įkeltos paspaudus „Išsaugoti prekę“."
              : "Nuotrauka naršyklėje sumažinama iki 1200 px, paverčiama WebP ir išvaloma nuo EXIF (GPS) duomenų."}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="notice notice--danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saugoma…" : "Išsaugoti prekę"}
        </button>
        {product ? (
          <Link href={routes.product(product.slug)} className="btn btn-ghost">
            Peržiūrėti parduotuvėje
          </Link>
        ) : null}
        <p className="text-sm text-ok" aria-live="polite">
          {saved}
        </p>
        {product ? (
          <button
            type="button"
            className="btn btn-danger ml-auto"
            onClick={async () => {
              if (!window.confirm("Ištrinti prekę?")) return;
              setPending(true);
              const result = await deleteProduct(product.id);
              if (!result.ok) {
                setPending(false);
                setError(result.error);
                return;
              }
              router.push(routes.adminProducts);
              refresh();
            }}
          >
            <TrashIcon size={17} /> Ištrinti
          </button>
        ) : null}
      </div>
    </form>
  );
}
