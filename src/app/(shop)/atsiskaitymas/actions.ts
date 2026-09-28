"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { nextOrderNumber } from "@/lib/orders";
import { getSebConfig, sebCancelUrl, sebReturnUrl } from "@/lib/seb/config";
import { getMerchantPrivateKey } from "@/lib/seb/keys";
import { buildPaymentRequest, referenceWithCheckDigit } from "@/lib/seb/ipizza";
import { site } from "@/lib/site";

const itemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "Įveskite vardą"),
  lastName: z.string().trim().min(2, "Įveskite pavardę"),
  email: z.string().trim().email("Neteisingas el. pašto adresas"),
  phone: z
    .string()
    .trim()
    .min(8, "Įveskite telefono numerį")
    .regex(/^[+0-9 ()-]+$/, "Neteisingas telefono numeris"),
  shippingMethodCode: z.string().min(1, "Pasirinkite pristatymo būdą"),
  address: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  postalCode: z.string().trim().optional().default(""),
  comment: z.string().trim().max(500).optional().default(""),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Susipažinkite su pirkimo taisyklėmis" }),
  }),
  items: z.array(itemSchema).min(1, "Krepšelis tuščias"),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      payment: { url: string; fields: Record<string, string> };
    }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Pristatymo kaina pagal pasirinktą būdą ir krepšelio sumą. */
function shippingPriceFor(
  method: { priceCents: number; freeFromCents: number | null },
  subtotalCents: number,
): number {
  if (method.freeFromCents !== null && subtotalCents >= method.freeFromCents) {
    return 0;
  }
  return method.priceCents;
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Patikslinkite užsakymo duomenis", fieldErrors };
  }

  const data = parsed.data;

  const method = await prisma.shippingMethod.findFirst({
    where: { code: data.shippingMethodCode, isActive: true },
  });
  if (!method) {
    return { ok: false, message: "Pasirinktas pristatymo būdas nebegalioja" };
  }

  const needsAddress = method.code !== "atsiemimas";
  if (needsAddress) {
    const fieldErrors: Record<string, string> = {};
    if (data.address.length < 3) fieldErrors.address = "Įveskite adresą arba paštomatą";
    if (data.city.length < 2) fieldErrors.city = "Įveskite miestą";
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, message: "Patikslinkite pristatymo duomenis", fieldErrors };
    }
  }

  // Kainos ir likučiai visada tikrinami duomenų bazėje, o ne pagal naršyklės duomenis.
  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((item) => item.productId) }, isActive: true },
    include: { variants: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const lines: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    size: string;
    imageUrl: string | null;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
  }> = [];

  for (const item of data.items) {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return { ok: false, message: "Viena iš prekių nebeprekiaujama. Atnaujinkite krepšelį." };
    }
    const variant = product.variants.find((candidate) => candidate.size === item.size);
    if (!variant) {
      return {
        ok: false,
        message: `Prekės „${product.name}“ dydis ${item.size} nebeprieinamas.`,
      };
    }
    if (variant.stock < item.quantity) {
      return {
        ok: false,
        message:
          variant.stock === 0
            ? `Prekės „${product.name}“ (${item.size}) nebeliko.`
            : `Prekės „${product.name}“ (${item.size}) liko tik ${variant.stock} vnt.`,
      };
    }

    lines.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: item.size,
      imageUrl: product.images[0]?.url ?? null,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
      totalCents: product.priceCents * item.quantity,
    });
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
  const shippingCents = shippingPriceFor(method, subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const number = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      number,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      address: needsAddress ? data.address : null,
      city: needsAddress ? data.city : null,
      postalCode: needsAddress ? data.postalCode : null,
      comment: data.comment || null,
      shippingMethodId: method.id,
      shippingMethodName: method.name,
      shippingPriceCents: shippingCents,
      subtotalCents,
      totalCents,
      vatRate: site.vatRate,
      status: "NEW",
      paymentStatus: "PENDING",
      paymentMethod: "SEB",
      items: { create: lines },
    },
  });

  const config = getSebConfig();
  const stamp = `${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
  const reference = referenceWithCheckDigit(number.replace(/\D/g, ""));

  const payment = buildPaymentRequest({
    config,
    privateKeyPem: getMerchantPrivateKey(),
    stamp,
    amountCents: totalCents,
    reference,
    message: `Užsakymas ${number}`,
    returnUrl: sebReturnUrl(config),
    cancelUrl: sebCancelUrl(config),
  });

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "SEB",
      stamp,
      reference,
      amountCents: totalCents,
      currency: "EUR",
      status: "PENDING",
      requestPayload: JSON.stringify(payment.fields),
    },
  });

  return { ok: true, orderNumber: number, payment };
}
