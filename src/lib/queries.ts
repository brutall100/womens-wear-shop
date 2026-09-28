import { prisma } from "@/lib/prisma";

export const productCardArgs = {
  select: {
    id: true,
    name: true,
    slug: true,
    summary: true,
    priceCents: true,
    compareAtCents: true,
    createdAt: true,
    category: { select: { name: true, slug: true } },
    images: {
      orderBy: { sortOrder: "asc" },
      take: 2,
      select: { url: true, alt: true },
    },
    variants: { select: { stock: true } },
  },
} as const;

export type ProductCardData = Awaited<
  ReturnType<typeof getFeaturedProducts>
>[number];

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    ...productCardArgs,
  });
}

export async function getNewestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...productCardArgs,
  });
}

export type CatalogParams = {
  categorySlug?: string;
  search?: string;
  sort?: string;
  size?: string;
};

export async function getCatalogProducts(params: CatalogParams) {
  const { categorySlug, search, sort, size } = params;

  const orderBy =
    sort === "pigiausios"
      ? [{ priceCents: "asc" as const }]
      : sort === "brangiausios"
        ? [{ priceCents: "desc" as const }]
        : sort === "pavadinimas"
          ? [{ name: "asc" as const }]
          : [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { summary: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(size ? { variants: { some: { size, stock: { gt: 0 } } } } : {}),
    },
    orderBy,
    ...productCardArgs,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: [{ sortOrder: "asc" }, { size: "asc" }] },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    ...productCardArgs,
  });
}

export async function getActiveShippingMethods() {
  return prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
  });
}
