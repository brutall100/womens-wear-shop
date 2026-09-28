"use client";

import { useState, type ReactNode } from "react";
import { saveSettings } from "@/lib/client-api";

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
  return (
    <SettingsForm group="shop" eyebrow="Parduotuvė" title="Kontaktai ir pristatymas" success="Parduotuvės duomenys išsaugoti.">
      <Text label="El. paštas" name="email" type="email" defaultValue={email} />
      <Text label="Telefonas" name="phone" type="tel" defaultValue={phone} />
      <Text label="Atsiėmimo vieta" name="pickup" defaultValue={pickup} />
      <Text label="Nemokamas pristatymas nuo, €" name="freeShipping" defaultValue={freeShipping} inputMode="decimal" />
    </SettingsForm>
  );
}

export function SebSettingsForm({
  merchantId,
  gatewayUrl,
  bankId,
  live,
  merchantBits,
  bankSubject,
  hint,
  disabled = false,
  notice,
}: {
  merchantId: string;
  gatewayUrl: string;
  bankId: string;
  live: boolean;
  merchantBits: string;
  bankSubject: string;
  hint: string;
  disabled?: boolean;
  notice?: ReactNode;
}) {
  return (
    <SettingsForm group="seb" eyebrow="Mokėjimai" title="SEB Bank Link" success="SEB nustatymai išsaugoti." disabled={disabled} clearSecrets>
      {notice}
      <p className="notice">
        {live
          ? "Gyva aplinka: pirkėja nukreipiama į banką, o atsakymas tikrinamas banko sertifikatu."
          : "Bandomoji aplinka: pinigai nenuskaičiuojami, kol neužpildyti visi keturi laukai – ID, https adresas, raktas ir sertifikatas."}
      </p>
      <Text label="Prekybininko ID (VK_SND_ID)" name="merchantId" defaultValue={merchantId === "MOTDEMO" ? "" : merchantId} disabled={disabled} />
      <Text label="Banko adresas" name="gatewayUrl" defaultValue={gatewayUrl} placeholder={hint} disabled={disabled} />
      <Text label="Banko ID atsakyme, jei žinote" name="bankId" defaultValue={bankId} disabled={disabled} />
      <div className="field">
        <label htmlFor="merchantKey" className="label">
          Privatus raktas (PEM)
        </label>
        <textarea
          id="merchantKey"
          name="merchantKey"
          rows={4}
          disabled={disabled}
          placeholder={merchantBits ? `Įkeltas, ${merchantBits} bit. Palikite tuščią, jei nekeičiate.` : "Įklijuokite privatų raktą"}
          className="textarea font-mono text-xs"
        />
      </div>
      <div className="field">
        <label htmlFor="bankCert" className="label">
          Banko sertifikatas
        </label>
        <textarea
          id="bankCert"
          name="bankCert"
          rows={4}
          disabled={disabled}
          placeholder={bankSubject ? `Įkeltas: ${bankSubject}. Palikite tuščią, jei nekeičiate.` : "Įklijuokite banko sertifikatą"}
          className="textarea font-mono text-xs"
        />
      </div>
      <p className="hint">
        Grąžinimo adresai sutarčiai: /api/seb/return ir /api/seb/cancel. Užklausa 1012, versija 009, kalba LIT. Lietuvoje pildoma paskirtis, ne
        nuorodos numeris. SEB (BIC CBVILT2X) dažnai pasiekiamas per {hint}.
      </p>
    </SettingsForm>
  );
}

function SettingsForm({
  group,
  eyebrow,
  title,
  success,
  disabled = false,
  clearSecrets = false,
  children,
}: {
  group: "shop" | "seb";
  eyebrow: string;
  title: string;
  success: string;
  disabled?: boolean;
  clearSecrets?: boolean;
  children: ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid max-w-2xl gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setPending(true);
        setError("");
        setMessage("");
        const payload = Object.fromEntries(new FormData(form).entries());
        const result = await saveSettings(group, payload);
        setPending(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMessage(success);
        if (clearSecrets) {
          for (const name of ["merchantKey", "bankCert"]) {
            const field = form.elements.namedItem(name);
            if (field instanceof HTMLTextAreaElement) field.value = "";
          }
        }
      }}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-5xl">{title}</h1>
      </div>
      <div className="pattern-card grid gap-5">{children}</div>
      {error ? (
        <p role="alert" className="notice notice--danger">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending || disabled} className="btn btn-primary">
          {pending ? "Saugoma…" : "Išsaugoti"}
        </button>
        <p className="text-sm text-ok" aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}

function Text({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  inputMode,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  inputMode?: "decimal";
  disabled?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        className="input"
      />
    </div>
  );
}
