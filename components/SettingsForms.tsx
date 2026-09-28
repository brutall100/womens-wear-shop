"use client";

import { useState } from "react";

export function ShopSettingsForm({
  email,
  phone,
  pickup,
  freeShipping,
}: {
  email: string;
  phone: string;
  pickup: string;
  freeShipping: string;
}) {
  return <SettingsForm group="shop" title="Kontaktai ir pristatymas" success="Parduotuvės duomenys išsaugoti.">
    <Text label="El. paštas" name="email" defaultValue={email} />
    <Text label="Telefonas" name="phone" defaultValue={phone} />
    <Text label="Atsiėmimo vieta" name="pickup" defaultValue={pickup} />
    <Text label="Nemokamas pristatymas nuo, €" name="freeShipping" defaultValue={freeShipping} />
  </SettingsForm>;
}

export function SebSettingsForm({
  merchantId,
  gatewayUrl,
  bankId,
  live,
  merchantBits,
  bankSubject,
  hint,
}: {
  merchantId: string;
  gatewayUrl: string;
  bankId: string;
  live: boolean;
  merchantBits: string;
  bankSubject: string;
  hint: string;
}) {
  return (
    <SettingsForm group="seb" title="SEB Bank Link" success="SEB nustatymai išsaugoti.">
      <p className={`text-sm ${live ? "text-ok" : "text-muted"}`}>
        {live
          ? "Gyva aplinka. Pirkėja bus nukreipta į banką, o atsakymas tikrinamas sertifikatu."
          : "Bandomoji aplinka. Pinigai nenuskaičiuojami, kol neužpildyti visi keturi laukai: ID, https adresas, raktas ir sertifikatas."}
      </p>
      <Text label="Prekybininko ID (VK_SND_ID)" name="merchantId" defaultValue={merchantId === "MOTDEMO" ? "" : merchantId} />
      <Text label="Banko adresas" name="gatewayUrl" defaultValue={gatewayUrl} placeholder={hint} />
      <Text label="Banko ID atsakyme, jei žinote" name="bankId" defaultValue={bankId} />
      <label className="grid gap-2 text-sm">
        Privatus raktas PEM
        <textarea name="merchantKey" rows={4} placeholder={merchantBits ? `Įkeltas, ${merchantBits} bit. Palikite tuščią, jei nekeičiate.` : "Įklijuokite privatų raktą"} className="border border-line bg-card px-3 py-3 font-mono text-xs" />
      </label>
      <label className="grid gap-2 text-sm">
        Banko sertifikatas
        <textarea name="bankCert" rows={4} placeholder={bankSubject ? `Įkeltas: ${bankSubject}. Palikite tuščią, jei nekeičiate.` : "Įklijuokite banko sertifikatą"} className="border border-line bg-card px-3 py-3 font-mono text-xs" />
      </label>
      <p className="text-sm text-muted">
        Grąžinimo adresai, kuriuos reikia nurodyti sutarčiai: /api/seb/return ir /api/seb/cancel. Užklausa 1012, versija 009, kalba LIT. Lietuvoje pildoma paskirtis, ne nuorodos numeris. SEB BIC CBVILT2X dažnai pasiekiamas per {hint}.
      </p>
    </SettingsForm>
  );
}

function SettingsForm({
  group,
  title,
  success,
  children,
}: {
  group: string;
  title: string;
  success: string;
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid max-w-2xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        setMessage("");
        const data = new FormData(event.currentTarget);
        const payload = Object.fromEntries(data.entries());
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ group, ...payload }),
        });
        const body = (await response.json()) as { error?: string };
        setPending(false);
        if (!response.ok) {
          setError(body.error || "Nepavyko išsaugoti.");
          return;
        }
        setMessage(success);
        if (group === "seb") {
          const key = event.currentTarget.elements.namedItem("merchantKey");
          const cert = event.currentTarget.elements.namedItem("bankCert");
          if (key instanceof HTMLTextAreaElement) key.value = "";
          if (cert instanceof HTMLTextAreaElement) cert.value = "";
        }
      }}
    >
      <h1 className="font-serif text-5xl">{title}</h1>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="h-12 bg-ink px-6 text-sm text-paper">
          {pending ? "Saugoma…" : "Išsaugoti"}
        </button>
        <p className="text-sm" aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}

function Text({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="h-12 border border-line bg-card px-3 text-base" />
    </label>
  );
}
