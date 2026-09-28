"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SHIPPING_METHODS } from "@/lib/config";
import { createOrder, OrderError, startPayment } from "@/lib/orders";
import { SebApiError } from "@/lib/payments/seb";

const lineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
});

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Įveskite vardą ir pavardę.").max(120),
  email: z.string().trim().email("Neteisingas el. pašto adresas.").max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Įveskite telefono numerį.")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Telefono numeris gali turėti tik skaičius, tarpus ir „+“."),
  shippingMethod: z.enum(SHIPPING_METHODS as [string, ...string[]]),
  address: z.string().trim().min(3, "Įveskite adresą arba paštomatą.").max(200),
  city: z.string().trim().min(2, "Įveskite miestą.").max(100),
  postalCode: z.string().trim().min(4, "Įveskite pašto kodą.").max(12),
  note: z.string().trim().max(500).optional(),
  terms: z.literal("on", { message: "Turite sutikti su pirkimo taisyklėmis." }),
  items: z.string(),
});

export interface CheckoutState {
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectUrl?: string;
}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors, error: "Patikrinkite pažymėtus laukus." };
  }

  let lines: z.infer<typeof lineSchema>[];
  try {
    lines = z.array(lineSchema).min(1).parse(JSON.parse(parsed.data.items));
  } catch {
    return { error: "Krepšelis tuščias arba pažeistas. Atnaujinkite puslapį." };
  }

  const { name, email, phone, shippingMethod, address, city, postalCode, note } = parsed.data;

  try {
    const order = await createOrder(lines, {
      name,
      email,
      phone,
      shippingMethod: shippingMethod as (typeof SHIPPING_METHODS)[number],
      address,
      city,
      postalCode,
      note,
    });

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || undefined;
    const redirectUrl = await startPayment(order, ip);
    return { redirectUrl };
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message };
    if (err instanceof SebApiError) {
      console.error("SEB payment init failed", err.status, err.body);
      return { error: "Nepavyko pradėti apmokėjimo per SEB. Bandykite dar kartą arba susisiekite su mumis." };
    }
    console.error(err);
    return { error: "Įvyko nenumatyta klaida. Bandykite dar kartą." };
  }
}
