"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SIZE_OPTIONS } from "@/lib/labels";

type ImageItem = { id: string; path: string };

export function ProductForm({
  product,
  categories,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    sizes: string[];
    stock: number;
    published: boolean;
    images: ImageItem[];
  } | null;
  categories: string[];
}) {
  const router = useRouter();
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M"]);
  const [extra, setExtra] = useState("");
  const [images, setImages] = useState<ImageItem[]>(product?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState("");

  function toggleSize(size: string) {
    setSizes((current) => (current.includes(size) ? current.filter((item) => item !== size) : [...current, size]));
  }

  async function upload(id: string, selected: File[]) {
    if (selected.length === 0) return;
    const data = new FormData();
    for (const file of selected) data.append("files", file);
    const response = await fetch(`/api/admin/products/${id}/images`, { method: "POST", body: data });
    const body = (await response.json()) as { error?: string; images?: ImageItem[] };
    if (!response.ok) throw new Error(body.error || "Nuotraukos neįkeltos.");
    setImages((current) => [...current, ...(body.images ?? [])]);
    setFiles([]);
  }

  return (
    <form
      className="mt-8 grid max-w-3xl gap-5"
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
        const payload = {
          name: data.get("name"),
          description: data.get("description"),
          price: data.get("price"),
          category: data.get("category"),
          stock: Number(data.get("stock")),
          published: data.get("published") === "on",
          sizes: [...sizes, ...extraSizes],
        };
        try {
          const response = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
            method: product ? "PATCH" : "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          const body = (await response.json()) as { error?: string; product?: { id: string } };
          if (!response.ok || !body.product) throw new Error(body.error || "Nepavyko išsaugoti.");
          await upload(body.product.id, files);
          setPending(false);
          if (!product) {
            router.push(`/admin/prekes/${body.product.id}`);
            router.refresh();
            return;
          }
          setSaved("Išsaugota.");
          router.refresh();
        } catch (caught) {
          setPending(false);
          setError(caught instanceof Error ? caught.message : "Nepavyko išsaugoti.");
        }
      }}
    >
      <label className="grid gap-2 text-sm">
        Pavadinimas
        <input name="name" required defaultValue={product?.name ?? ""} className="h-12 border border-line bg-card px-3 text-base" />
      </label>
      <label className="grid gap-2 text-sm">
        Kaina, €
        <input
          name="price"
          required
          inputMode="decimal"
          defaultValue={product?.price ?? ""}
          placeholder="119,00"
          className="h-12 w-40 border border-line bg-card px-3 text-base"
        />
      </label>
      <label className="grid gap-2 text-sm">
        Kategorija
        <input
          name="category"
          required
          list="kategorijos"
          defaultValue={product?.category ?? ""}
          className="h-12 border border-line bg-card px-3 text-base"
        />
        <datalist id="kategorijos">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </label>
      <label className="grid gap-2 text-sm">
        Aprašymas
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={product?.description ?? ""}
          className="border border-line bg-card px-3 py-3 text-base"
        />
      </label>
      <fieldset>
        <legend className="text-sm">Dydžiai</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const active = sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSize(size)}
                className={`h-11 min-w-11 border px-3 text-sm ${active ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <label className="mt-3 grid gap-2 text-sm">
          Kiti dydžiai, per kablelį
          <input value={extra} onChange={(event) => setExtra(event.target.value)} className="h-12 border border-line bg-card px-3 text-base" />
        </label>
      </fieldset>
      <label className="grid gap-2 text-sm">
        Likutis
        <input
          name="stock"
          type="number"
          min={0}
          required
          defaultValue={product?.stock ?? 1}
          className="h-12 w-32 border border-line bg-card px-3 text-base"
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? true} />
        Rodyti parduotuvėje
      </label>
      <div>
        <p className="text-sm">Nuotraukos</p>
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="relative">
              <img src={image.path} alt="" className="aspect-[3/4] w-full object-cover" />
              <button
                type="button"
                className="mt-2 text-sm underline"
                onClick={async () => {
                  if (!window.confirm("Pašalinti nuotrauką?")) return;
                  const response = await fetch(`/api/admin/images/${image.id}`, { method: "DELETE" });
                  if (response.ok) {
                    setImages((current) => current.filter((item) => item.id !== image.id));
                    router.refresh();
                  }
                }}
              >
                Pašalinti
              </button>
            </li>
          ))}
        </ul>
        <label className="mt-4 grid gap-2 text-sm">
          Pridėti JPG, PNG arba WEBP, iki 5 MB
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="block text-sm"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
        {files.length > 0 ? <p className="mt-2 text-sm text-muted">Bus įkelta išsaugojus: {files.length}</p> : null}
      </div>
      {error ? (
        <p role="alert" className="border border-danger px-3 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="h-12 bg-ink px-6 text-sm text-paper">
          {pending ? "Saugoma…" : "Išsaugoti prekę"}
        </button>
        <p className="text-sm" aria-live="polite">
          {saved}
        </p>
        {product ? (
          <button
            type="button"
            className="h-12 px-3 text-sm text-danger underline"
            onClick={async () => {
              if (!window.confirm("Ištrinti prekę?")) return;
              setPending(true);
              const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
              if (!response.ok) {
                setPending(false);
                setError("Nepavyko ištrinti.");
                return;
              }
              router.push("/admin/prekes");
              router.refresh();
            }}
          >
            Ištrinti
          </button>
        ) : null}
      </div>
    </form>
  );
}
