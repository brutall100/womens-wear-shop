import { NextResponse, type NextRequest } from "next/server";
import { getSebConfig } from "@/lib/seb/config";
import { getBankPrivateKeyForMock, getMerchantPublicKeyForMock } from "@/lib/seb/keys";
import {
  MAC_FIELDS,
  buildMacSource,
  formatVkDateTime,
  signMac,
  verifyMac,
  type VkFields,
} from "@/lib/seb/ipizza";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Bandomasis bankas – veikia tik kai SEB_MODE=mock.
 * Imituoja SEB banklink puslapį, kad visą mokėjimo eigą būtų galima
 * išbandyti be tikros sutarties su banku.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hiddenInputs(fields: VkFields): string {
  return Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("\n      ");
}

function page(body: string): NextResponse {
  const html = `<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SEB – bandomasis mokėjimas</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f1f3f6; color: #1f2933; }
    .bar { background: #60cd18; height: 6px; }
    .head { background: #fff; border-bottom: 1px solid #e2e6eb; padding: 18px 24px; font-weight: 600; letter-spacing: .04em; }
    .wrap { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #fff; border: 1px solid #e2e6eb; border-radius: 6px; padding: 28px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .note { color: #66737f; font-size: 13px; margin: 0 0 22px; }
    dl { display: grid; grid-template-columns: 150px 1fr; gap: 10px 16px; margin: 0 0 24px; font-size: 14px; }
    dt { color: #66737f; }
    dd { margin: 0; word-break: break-word; }
    .total { font-size: 22px; font-weight: 600; }
    .ok { color: #1c7c3f; font-size: 13px; margin-bottom: 20px; }
    .bad { color: #b23b3b; font-size: 13px; margin-bottom: 20px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    button { font: inherit; border: 0; border-radius: 4px; padding: 12px 22px; cursor: pointer; }
    .primary { background: #60cd18; color: #fff; }
    .primary:hover { background: #55b415; }
    .ghost { background: #fff; color: #1f2933; border: 1px solid #c6ced6; }
    .ghost:hover { border-color: #97a3ae; }
    .hint { margin-top: 22px; font-size: 12px; color: #8a949e; line-height: 1.5; }
    input[type=text] { font: inherit; padding: 10px 12px; border: 1px solid #c6ced6; border-radius: 4px; width: 100%; box-sizing: border-box; }
    label { display: block; font-size: 13px; color: #66737f; margin: 0 0 6px; }
  </style>
</head>
<body>
  <div class="bar"></div>
  <div class="head">SEB · bandomoji mokėjimo aplinka</div>
  <div class="wrap">${body}</div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function collect(formData: FormData): VkFields {
  const fields: VkFields = {};
  formData.forEach((value, key) => {
    if (key.startsWith("VK_") && typeof value === "string") fields[key] = value;
  });
  return fields;
}

export async function POST(request: NextRequest) {
  const config = getSebConfig();
  if (config.mode !== "mock") {
    return new NextResponse("Bandomasis bankas išjungtas", { status: 404 });
  }

  const formData = await request.formData();
  const fields = collect(formData);
  const step = String(formData.get("zingsnis") ?? "");

  if (step === "patvirtinti" || step === "atsaukti") {
    return respondToShop(fields, step, String(formData.get("payerName") ?? ""));
  }

  const macSource = buildMacSource(fields, MAC_FIELDS["1012"], config.macLengthMode);
  const signatureValid = verifyMac(
    macSource,
    fields.VK_MAC ?? "",
    getMerchantPublicKeyForMock(),
    config.algorithm,
  );

  return page(`
    <div class="card">
      <h1>Mokėjimo patvirtinimas</h1>
      <p class="note">Pardavėjas: ${escapeHtml(site.company.legalName)}</p>

      ${
        signatureValid
          ? '<p class="ok">✓ Pardavėjo parašas (VK_MAC) patikrintas sėkmingai</p>'
          : '<p class="bad">✕ Neteisingas pardavėjo parašas (VK_MAC)</p>'
      }

      <dl>
        <dt>Gavėjas</dt><dd>${escapeHtml(site.company.legalName)}</dd>
        <dt>Sąskaita</dt><dd>${escapeHtml(site.company.iban)}</dd>
        <dt>Paskirtis</dt><dd>${escapeHtml(fields.VK_MSG ?? "")}</dd>
        <dt>Mokėjimo kodas</dt><dd>${escapeHtml(fields.VK_REF ?? "")}</dd>
        <dt>Suma</dt><dd class="total">${escapeHtml(fields.VK_AMOUNT ?? "")} ${escapeHtml(fields.VK_CURR ?? "")}</dd>
      </dl>

      <form method="POST" action="${escapeHtml(config.paymentUrl)}">
        ${hiddenInputs(fields)}
        <label for="payerName">Mokėtojo vardas (bandymui)</label>
        <input type="text" id="payerName" name="payerName" value="Vardenė Pavardenė" />
        <div class="row" style="margin-top:20px">
          <button class="primary" type="submit" name="zingsnis" value="patvirtinti">Patvirtinti mokėjimą</button>
          <button class="ghost" type="submit" name="zingsnis" value="atsaukti">Atšaukti</button>
        </div>
      </form>

      <p class="hint">
        Tai vietinė bandomoji aplinka (SEB_MODE=mock). Tikrame banke šiame žingsnyje
        reikėtų prisijungti prie internetinės bankininkystės. Atsakymas parduotuvei
        pasirašomas bandomuoju banko raktu iš katalogo <code>.keys</code>.
      </p>
    </div>
  `);
}

function respondToShop(
  request: VkFields,
  step: "patvirtinti" | "atsaukti",
  payerName: string,
): NextResponse {
  const config = getSebConfig();
  const returnUrl = step === "patvirtinti" ? request.VK_RETURN : request.VK_CANCEL;

  const response: VkFields =
    step === "patvirtinti"
      ? {
          VK_SERVICE: "1111",
          VK_VERSION: "008",
          VK_SND_ID: config.receiverId,
          VK_REC_ID: config.senderId,
          VK_STAMP: request.VK_STAMP ?? "",
          VK_T_NO: String(Math.floor(Math.random() * 900000) + 100000),
          VK_AMOUNT: request.VK_AMOUNT ?? "",
          VK_CURR: request.VK_CURR ?? "EUR",
          VK_REC_ACC: site.company.iban,
          VK_REC_NAME: site.company.legalName,
          VK_SND_ACC: "LT12 3456 7890 1234 5678",
          VK_SND_NAME: payerName.trim() || "Vardenė Pavardenė",
          VK_REF: request.VK_REF ?? "",
          VK_MSG: request.VK_MSG ?? "",
          VK_T_DATETIME: formatVkDateTime(),
        }
      : {
          VK_SERVICE: "1911",
          VK_VERSION: "008",
          VK_SND_ID: config.receiverId,
          VK_REC_ID: config.senderId,
          VK_STAMP: request.VK_STAMP ?? "",
          VK_REF: request.VK_REF ?? "",
          VK_MSG: request.VK_MSG ?? "",
        };

  const order = MAC_FIELDS[response.VK_SERVICE];
  const source = buildMacSource(response, order, config.macLengthMode);
  response.VK_MAC = signMac(source, getBankPrivateKeyForMock(), config.algorithm);
  response.VK_AUTO = "N";
  response.VK_ENCODING = "UTF-8";
  response.VK_LANG = config.language;

  return page(`
    <div class="card">
      <h1>${step === "patvirtinti" ? "Mokėjimas patvirtintas" : "Mokėjimas atšauktas"}</h1>
      <p class="note">Grįžtama į parduotuvę…</p>
      <form id="atgal" method="POST" action="${escapeHtml(returnUrl ?? "/")}">
        ${hiddenInputs(response)}
        <button class="primary" type="submit">Grįžti į parduotuvę</button>
      </form>
      <script>document.getElementById("atgal").submit();</script>
    </div>
  `);
}
