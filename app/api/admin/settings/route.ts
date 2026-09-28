import { createPrivateKey, createPublicKey, X509Certificate } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { saveSecretFile, setSetting } from "@/lib/db";
import { parseEuroToCents } from "@/lib/money";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Neteisinga užklausa." }, { status: 400 });
  const group = String(body.group ?? "");

  if (group === "shop") {
    const free = parseEuroToCents(String(body.freeShipping ?? ""));
    if (free === null) return NextResponse.json({ error: "Nemokamo pristatymo suma netinka." }, { status: 400 });
    setSetting("email", String(body.email ?? "").trim().slice(0, 120));
    setSetting("phone", String(body.phone ?? "").trim().slice(0, 40));
    setSetting("pickup", String(body.pickup ?? "").trim().slice(0, 240));
    setSetting("free_shipping_cents", String(free));
    return NextResponse.json({ ok: true });
  }

  if (group === "seb") {
    const merchantId = String(body.merchantId ?? "").trim();
    const gatewayUrl = String(body.gatewayUrl ?? "").trim();
    const bankId = String(body.bankId ?? "").trim();
    if (merchantId.length > 15) return NextResponse.json({ error: "Prekybininko ID ilgiausiai 15 simbolių." }, { status: 400 });
    if (gatewayUrl && !gatewayUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Banko adresas turi prasidėti https://." }, { status: 400 });
    }
    const merchantKey = String(body.merchantKey ?? "").trim();
    const bankCert = String(body.bankCert ?? "").trim();
    if (merchantKey) {
      try {
        createPrivateKey(merchantKey);
      } catch {
        return NextResponse.json({ error: "Privatus raktas neskaitomas. Įkelkite PEM." }, { status: 400 });
      }
      saveSecretFile("merchant.pem", merchantKey);
    }
    if (bankCert) {
      try {
        if (bankCert.includes("BEGIN CERTIFICATE")) new X509Certificate(bankCert);
        else createPublicKey(bankCert);
      } catch {
        return NextResponse.json({ error: "Banko sertifikatas neskaitomas." }, { status: 400 });
      }
      saveSecretFile("bank.crt", bankCert);
    }
    setSetting("seb_merchant_id", merchantId);
    setSetting("seb_gateway_url", gatewayUrl);
    setSetting("seb_bank_id", bankId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nežinomi nustatymai." }, { status: 400 });
}
