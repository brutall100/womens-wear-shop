import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export const sortOptions = [
  { value: "naujausios", label: "Naujausios" },
  { value: "pigiausios", label: "Kaina: nuo mažiausios" },
  { value: "brangiausios", label: "Kaina: nuo didžiausios" },
] as const;

export function orderByFromSort(sort: string | undefined): Prisma.ProductOrderByWithRelationInput {
  if (sort === "pigiausios") return { price: "asc" };
  if (sort === "brangiausios") return { price: "desc" };
  return { createdAt: "desc" };
}

export async function listProducts(where: Prisma.ProductWhereInput, sort?: string, take?: number) {
  return prisma.product.findMany({
    where: { isActive: true, ...where },
    include: productCardInclude,
    orderBy: orderByFromSort(sort),
    take,
  });
}
