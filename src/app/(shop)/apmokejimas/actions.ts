"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { startPayment } from "@/lib/payments";
import { shippingMethods, shippingPrice } from "@/config/store";

const schema = z
  .object({
    email: z.string().trim().email("Neteisingas el. pašto adresas"),
    phone: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, ""))
      .refine((v) => /^(\+370|8)\d{8}$/.test(v), "Įveskite telefono numerį formatu +370 6xx xxxxx"),
    firstName: z.string().trim().min(1, "Įveskite vardą"),
    lastName: z.string().trim().min(1, "Įveskite pavardę"),
    shippingMethod: z.string(),
    address: z.string().trim().min(3, "Įveskite adresą"),
    city: z.string().trim().min(2, "Įveskite miestą"),
    postalCode: z.string().trim(),
    note: z.string().trim().max(1000).optional(),
    acceptTerms: z.literal(true, { error: "Turite sutikti su pirkimo taisyklėmis" }),
    items: z
      .array(z.object({ variantId: z.string(), quantity: z.number().int().positive().max(20) }))
      .min(1, "Krepšelis tuščias"),
  })
  .superRefine((data, ctx) => {
    const method = shippingMethods.find((m) => m.id === data.shippingMethod);
    if (!method) ctx.addIssue({ code: "custom", path: ["shippingMethod"], message: "Pasirinkite pristatymo būdą" });
    if (method && !method.requiresLocker && !/^(LT-?)?\d{5}$/i.test(data.postalCode)) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Pašto kodas, pvz. LT-01103" });
    }
  });

export type CheckoutInput = z.input<typeof schema>;

export type CheckoutResult =
  | { ok: true; redirectUrl: string }
  | {
      ok: false;
      error?: string;
      fieldErrors?: Record<string, string>;
      stockIssues?: { variantId: string; available: number }[];
    };

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, fieldErrors, error: fieldErrors.items };
  }
  const data = parsed.data;

  const variantIds = [...new Set(data.items.map((i) => i.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const stockIssues: { variantId: string; available: number }[] = [];
  const lines = data.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    const available = variant && variant.product.isActive ? variant.stock : 0;
    if (!variant || available < item.quantity) stockIssues.push({ variantId: item.variantId, available });
    return { item, variant };
  });

  if (stockIssues.length > 0) {
    return {
      ok: false,
      error: "Kai kurių prekių likutis pasikeitė. Krepšelis atnaujintas — peržiūrėkite ir bandykite dar kartą.",
      stockIssues,
    };
  }

  const method = shippingMethods.find((m) => m.id === data.shippingMethod)!;
  const subtotal = lines.reduce((sum, { item, variant }) => sum + variant!.product.price * item.quantity, 0);
  const shipping = shippingPrice(method, subtotal);

  const order = await prisma.order.create({
    data: {
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      note: data.note || null,
      shippingMethod: method.name,
      shippingPrice: shipping,
      subtotal,
      total: subtotal + shipping,
      items: {
        create: lines.map(({ item, variant }) => ({
          productId: variant!.productId,
          variantId: variant!.id,
          productName: variant!.product.name,
          size: variant!.size,
          unitPrice: variant!.product.price,
          quantity: item.quantity,
        })),
      },
    },
  });

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const redirectUrl = await startPayment(order.id, ip);
    return { ok: true, redirectUrl };
  } catch (error) {
    console.error("[checkout] Nepavyko sukurti mokėjimo", error);
    return {
      ok: true,
      redirectUrl: `/uzsakymas/${order.publicId}?klaida=mokejimas`,
    };
  }
}
