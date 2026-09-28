import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/views/product-view";
import { getProductBySlug, shopConfig } from "@/lib/db";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Prekė" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductView product={product} shop={shopConfig()} />;
}
