import { getOrderByStamp, sebConfig } from "@/lib/db";
import { appOrigin, formToRecord } from "@/lib/origin";
import { buildBankReply, verifyMerchantPacket } from "@/lib/payments";
import { escapeHtml, formatBankAmount } from "@/lib/seb";
import { formatEur } from "@/lib/money";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (sebConfig().live) {
    return new Response("Bandomoji aplinka išjungta.", { status: 404 });
  }
  const fields = formToRecord(await request.formData());
  if (!verifyMerchantPacket(fields)) {
    return new Response("Mokėjimo parašas netinkamas.", { status: 400 });
  }
  const order = getOrderByStamp(fields.VK_STAMP ?? "");
  if (!order) return new Response("Užsakymas nerastas.", { status: 404 });
  const action = fields.DEMO_ACTION;
  if (action === "pay" || action === "reject") {
    const reply = buildBankReply(order, action === "pay" ? "1111" : "1911");
    const target = `${appOrigin(request)}${action === "pay" ? "/api/seb/return" : "/api/seb/cancel"}`;
    const inputs = Object.entries(reply)
      .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
      .join("");
    return new Response(
      `<!doctype html><html lang="lt"><meta charset="utf-8"><title>Grąžinama į parduotuvę</title><body><form id="f" method="post" action="${escapeHtml(target)}">${inputs}</form><script>document.getElementById("f").submit()</script></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const hidden = Object.entries(fields)
    .filter(([name]) => name !== "DEMO_ACTION")
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join("");

  const html = `<!doctype html>
<html lang="lt">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SEB bandomoji aplinka</title>
<body style="margin:0;background:#f3efe8;color:#1b1916;font-family:Georgia,serif">
  <main style="max-width:560px;margin:48px auto;padding:0 20px">
    <p style="font-family:sans-serif;letter-spacing:.14em;font-size:12px">BANDOMOJI APLINKA</p>
    <h1 style="font-weight:500;font-size:40px;margin:8px 0">SEB</h1>
    <p style="font-family:sans-serif;line-height:1.5">Tai nėra SEB prisijungimas. Pinigai nenuskaičiuojami. Čia tikrinamas parduotuvės Bank Link paketas, kol neįkelti tikri raktai.</p>
    <section style="background:#fffcf8;border:1px solid #d8d0c6;padding:20px;margin-top:24px;font-family:sans-serif">
      <p style="margin:0">Suma</p>
      <p style="font-family:Georgia,serif;font-size:36px;margin:4px 0 16px">${escapeHtml(formatEur(order.amountCents))}</p>
      <p style="margin:0">Paskirtis</p>
      <p>${escapeHtml(order.vkMsg)}</p>
      <p>Suma pakete: ${escapeHtml(formatBankAmount(order.amountCents))} EUR</p>
    </section>
    <form method="post" style="display:flex;gap:12px;margin-top:20px;font-family:sans-serif">
      ${hidden}
      <button name="DEMO_ACTION" value="pay" style="height:48px;padding:0 18px;background:#6e3b2c;color:#fffcf8;border:0">Patvirtinti mokėjimą</button>
      <button name="DEMO_ACTION" value="reject" style="height:48px;padding:0 18px;background:transparent;border:1px solid #1b1916">Atmesti</button>
    </form>
  </main>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
