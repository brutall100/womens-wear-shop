"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createCheckout } from "@/app/(shop)/atsiskaitymas/actions";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice, vatAmountCents } from "@/lib/money";
import { site } from "@/lib/site";
import { buttonClass, cn } from "@/lib/ui";

export type CheckoutShippingMethod = {
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  freeFromCents: number | null;
};

/** Nematoma forma, kuria naršyklė nukreipiama į banko mokėjimo puslapį. */
function postToBank(url: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.acceptCharset = "UTF-8";
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export function CheckoutForm({ methods }: { methods: CheckoutShippingMethod[] }) {
  const router = useRouter();
  const { items, ready, subtotalCents, clear } = useCart();

  const [shippingCode, setShippingCode] = useState(methods[0]?.code ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ready && items.length === 0 && !pending) {
      router.replace("/krepselis");
    }
  }, [ready, items.length, pending, router]);

  const method = methods.find((candidate) => candidate.code === shippingCode);
  const needsAddress = method ? method.code !== "atsiemimas" : true;

  const shippingCents = useMemo(() => {
    if (!method) return 0;
    if (method.freeFromCents !== null && subtotalCents >= method.freeFromCents) return 0;
    return method.priceCents;
  }, [method, subtotalCents]);

  const totalCents = subtotalCents + shippingCents;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setMessage(null);
    setFieldErrors({});

    const result = await createCheckout({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      shippingMethodCode: shippingCode,
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      acceptTerms: formData.get("acceptTerms") === "on",
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      })),
    } as Parameters<typeof createCheckout>[0]);

    if (!result.ok) {
      setPending(false);
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    clear();
    postToBank(result.payment.url, result.payment.fields);
  }

  if (!ready) {
    return <p className="py-16 text-sm text-muted">Kraunama…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="border border-line bg-shell px-6 py-20 text-center">
        <p className="text-lg">Krepšelis tuščias</p>
        <Link href="/parduotuve" className={buttonClass("primary", "lg", "mt-6")}>
          Į parduotuvę
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {message && (
          <p className="mb-6 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {message}
          </p>
        )}

        <section>
          <h2 className="text-xl">1. Kontaktiniai duomenys</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Vardas" name="firstName" error={fieldErrors.firstName} autoComplete="given-name" required />
            <Field label="Pavardė" name="lastName" error={fieldErrors.lastName} autoComplete="family-name" required />
            <Field label="El. paštas" name="email" type="email" error={fieldErrors.email} autoComplete="email" required />
            <Field label="Telefonas" name="phone" type="tel" placeholder="+370 6.." error={fieldErrors.phone} autoComplete="tel" required />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl">2. Pristatymas</h2>
          <div className="mt-4 space-y-2">
            {methods.map((option) => {
              const free =
                option.freeFromCents !== null && subtotalCents >= option.freeFromCents;
              return (
                <label
                  key={option.code}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border bg-shell px-4 py-3.5 transition-colors",
                    shippingCode === option.code
                      ? "border-ink"
                      : "border-line hover:border-ink/40",
                  )}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.code}
                    checked={shippingCode === option.code}
                    onChange={() => setShippingCode(option.code)}
                    className="mt-1 accent-[var(--color-clay)]"
                  />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm">{option.name}</span>
                      <span className="text-sm">
                        {free || option.priceCents === 0
                          ? "Nemokamai"
                          : formatPrice(option.priceCents)}
                      </span>
                    </span>
                    {option.description && (
                      <span className="mt-1 block text-xs text-muted">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {needsAddress && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Adresas arba paštomatas"
                  name="address"
                  error={fieldErrors.address}
                  autoComplete="street-address"
                  placeholder="Pvz. Omniva paštomatas, Ozo g. 25, Vilnius"
                  required
                />
              </div>
              <Field label="Miestas" name="city" error={fieldErrors.city} autoComplete="address-level2" required />
              <Field label="Pašto kodas" name="postalCode" error={fieldErrors.postalCode} autoComplete="postal-code" placeholder="LT-01103" />
            </div>
          )}

          <div className="mt-4">
            <label className="field-label" htmlFor="comment">
              Komentaras (nebūtina)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="field"
              placeholder="Papildoma informacija kurjeriui"
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl">3. Apmokėjimas</h2>
          <div className="mt-4 flex items-start gap-3 border border-ink bg-shell px-4 py-4">
            <input
              type="radio"
              name="paymentMethod"
              value="SEB"
              defaultChecked
              className="mt-1 accent-[var(--color-clay)]"
              readOnly
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm">SEB internetinė bankininkystė</span>
                <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                  SEB
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Būsite nukreipti į SEB banką. Užsakymas patvirtinamas iškart po
                sėkmingo apmokėjimo.
              </p>
            </div>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="acceptTerms"
              className="mt-1 accent-[var(--color-clay)]"
            />
            <span className={fieldErrors.acceptTerms ? "text-danger" : "text-muted"}>
              Susipažinau su{" "}
              <Link href="/taisykles" className="text-ink link-underline" target="_blank">
                pirkimo taisyklėmis
              </Link>{" "}
              ir sutinku su asmens duomenų tvarkymu.
            </span>
          </label>
        </section>
      </div>

      <aside className="h-fit border border-line bg-shell p-6 lg:sticky lg:top-32">
        <h2 className="text-xl">Jūsų užsakymas</h2>

        <ul className="mt-5 space-y-4 border-b border-line pb-5">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex gap-3">
              <div className="relative h-20 w-[60px] shrink-0 overflow-hidden bg-sand">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="60px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="leading-snug">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.size} · {item.quantity} vnt.
                </p>
              </div>
              <span className="text-sm">{formatPrice(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Prekės</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Pristatymas</dt>
            <dd>{shippingCents === 0 ? "Nemokamai" : formatPrice(shippingCents)}</dd>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <dt>Iš jų PVM ({site.vatRate} %)</dt>
            <dd>{formatPrice(vatAmountCents(totalCents, site.vatRate))}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="eyebrow">Iš viso</span>
          <span className="font-display text-3xl">{formatPrice(totalCents)}</span>
        </div>

        <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-6 w-full")}>
          {pending ? "Nukreipiama į SEB…" : "Mokėti su SEB"}
        </button>

        <p className="mt-3 text-center text-[11px] text-muted">
          Mokėjimas apsaugotas banko saugumo priemonėmis
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn("field", error && "border-danger")}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
