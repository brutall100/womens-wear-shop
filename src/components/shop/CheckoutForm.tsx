"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { placeOrder, type CheckoutState } from "@/app/(shop)/atsiskaitymas/actions";
import { formatEur } from "@/lib/format";
import { useCart } from "./CartProvider";

interface Props {
  shipping: { courier: number; parcel_locker: number; freeFrom: number };
  demoMode: boolean;
}

function Field({
  name,
  label,
  error,
  type = "text",
  autoComplete,
  placeholder,
  required = true,
}: {
  name: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`input ${error ? "border-danger" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

const SHIPPING_OPTIONS = [
  { value: "courier", label: "Kurjeris į namus", hint: "1–2 darbo dienos" },
  { value: "parcel_locker", label: "Paštomatas", hint: "Omniva, LP Express, Venipak – 2–3 d. d." },
] as const;

export function CheckoutForm({ shipping, demoMode }: Props) {
  const { items, subtotalCents, hydrated, clear } = useCart();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [method, setMethod] = useState<"courier" | "parcel_locker">("courier");

  useEffect(() => {
    if (state.redirectUrl) {
      clear();
      window.location.assign(state.redirectUrl);
    }
  }, [state.redirectUrl, clear]);

  const shippingCents =
    shipping.freeFrom > 0 && subtotalCents >= shipping.freeFrom ? 0 : shipping[method];
  const totalCents = subtotalCents + shippingCents;

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-cream-dark" />;

  if (items.length === 0 && !state.redirectUrl) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="font-display text-2xl">Krepšelis tuščias</p>
        <Link href="/prekes" className="btn-primary mt-6">Į parduotuvę</Link>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-12">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))}
      />

      <div className="space-y-10 lg:col-span-7">
        <section>
          <h2 className="font-display text-2xl">Kontaktiniai duomenys</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field name="name" error={fe.name} label="Vardas ir pavardė" autoComplete="name" />
            </div>
            <Field name="email" error={fe.email} label="El. paštas" type="email" autoComplete="email" />
            <Field name="phone" error={fe.phone} label="Telefonas" type="tel" autoComplete="tel" placeholder="+370" />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Pristatymas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SHIPPING_OPTIONS.map((opt) => {
              const price =
                shipping.freeFrom > 0 && subtotalCents >= shipping.freeFrom ? 0 : shipping[opt.value];
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    method === opt.value ? "border-ink bg-white" : "border-ink/15 bg-white/60 hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={opt.value}
                    checked={method === opt.value}
                    onChange={() => setMethod(opt.value)}
                    className="mt-1 accent-ink"
                  />
                  <span className="flex-1">
                    <span className="flex justify-between text-sm font-medium">
                      {opt.label}
                      <span>{price === 0 ? "Nemokamai" : formatEur(price)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{opt.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <Field
                name="address"
                label={method === "courier" ? "Adresas" : "Paštomatas (pavadinimas / adresas)"}
                autoComplete="street-address"
                placeholder={method === "courier" ? "Gatvė, namo ir buto nr." : "pvz. Omniva Akropolis, Ozo g. 25"}
              />
            </div>
            <div className="sm:col-span-4">
              <Field name="city" error={fe.city} label="Miestas" autoComplete="address-level2" />
            </div>
            <div className="sm:col-span-2">
              <Field name="postalCode" error={fe.postalCode} label="Pašto kodas" autoComplete="postal-code" placeholder="LT-00000" />
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="note" className="label">Pastaba (neprivaloma)</label>
              <textarea id="note" name="note" rows={3} className="input" placeholder="Pvz. skambinti prieš pristatant" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Apmokėjimas</h2>
          <div className="mt-4 rounded-2xl border border-ink/15 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">SEB e. prekyba</p>
              <div className="flex gap-1.5">
                {["SEB", "Visa", "MC", "Apple Pay", "G Pay"].map((m) => (
                  <span key={m} className="badge border border-ink/10 text-[10px] text-ink-soft">{m}</span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Paspaudę „Apmokėti“ būsite nukreipti į saugų SEB banko mokėjimų langą, kuriame galėsite pasirinkti
              SEB ar kito banko el. bankininkystę, mokėjimo kortelę, Apple Pay arba Google Pay.
            </p>
            {demoMode && (
              <p className="mt-3 rounded-lg bg-rose-soft px-3 py-2 text-xs text-rose-dark">
                Demonstracinis režimas: SEB prieigos raktai nenustatyti, todėl bus rodomas imituotas banko langas.
              </p>
            )}
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="terms" className="mt-1 accent-ink" required />
            <span>
              Sutinku su <Link href="/taisykles" className="underline">pirkimo taisyklėmis</Link> ir{" "}
              <Link href="/privatumas" className="underline">privatumo politika</Link>.
            </span>
          </label>
          {fe.terms && <p className="mt-1 text-xs text-danger">{fe.terms}</p>}
        </section>
      </div>

      <aside className="lg:col-span-5">
        <div className="card sticky top-24 p-6">
          <h2 className="font-display text-2xl">Jūsų užsakymas</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 py-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="leading-snug">{item.name}</p>
                  <p className="text-xs text-ink-muted">{item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatEur(item.priceCents * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Prekės</dt><dd>{formatEur(subtotalCents)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Pristatymas</dt>
              <dd>{shippingCents === 0 ? "Nemokamai" : formatEur(shippingCents)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-4">
            <span className="font-medium">Iš viso</span>
            <span className="text-xl font-medium">{formatEur(totalCents)}</span>
          </div>

          {state.error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending || !!state.redirectUrl} className="btn-accent mt-6 w-full">
            {pending || state.redirectUrl ? "Nukreipiama į banką…" : `Apmokėti ${formatEur(totalCents)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Duomenys perduodami šifruotu ryšiu. Kortelės duomenų mes nesaugome.
          </p>
        </div>
      </aside>
    </form>
  );
}
