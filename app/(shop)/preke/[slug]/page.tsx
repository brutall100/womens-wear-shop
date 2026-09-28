import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { getProductBySlug } from "@/lib/db";
import { formatEur } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Prekė" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const image = product.images[0]?.path ?? "";

  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-10 lg:grid-cols-2">
      <div>
        <p className="text-sm text-muted">
          <Link href="/" className="underline">
            Pradžia
          </Link>
          {" / "}
          <Link href="/katalogas" className="underline">
            Katalogas
          </Link>
          {" / "}
          <Link href={`/katalogas?kategorija=${encodeURIComponent(product.category)}`} className="underline">
            {product.category}
          </Link>
        </p>
        <div className="mt-4 aspect-[3/4] bg-paper-2">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center font-serif text-4xl">{product.name}</div>
          )}
        </div>
        {product.images.length > 1 ? (
          <ul className="mt-3 grid grid-cols-4 gap-3">
            {product.images.slice(1).map((item) => (
              <li key={item.id} className="aspect-[3/4] bg-paper-2">
                <img src={item.path} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="lg:pt-10">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{product.category}</p>
        <h1 className="mt-2 font-serif text-5xl leading-tight">{product.name}</h1>
        <p className="num mt-4 font-serif text-3xl">{formatEur(product.priceCents)}</p>
        <p className="mt-6 max-w-lg whitespace-pre-wrap text-muted">{product.description}</p>
        <AddToCart
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            sizes: product.sizes,
            stock: product.stock,
            image,
          }}
        />
        <p className="mt-8 max-w-md text-sm text-muted">
          Siunčiame per LP Express, Omniva arba kurjerį. Nuo nurodytos sumos pristatymas nemokamas. Apmokėjimas per SEB.
        </p>
      </div>
    </div>
  );
}
