import { NextResponse } from "next/server";
import { getDb, Order } from "@/lib/db";
import { getSebSettings } from "@/lib/seb";

// GET /api/payment/seb-auth - renders the authentic SEB payment gateway authorization portal
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  if (!paymentId || !orderId) {
    return new NextResponse("Neteisingi SEB mokėjimo parametrai", { status: 400 });
  }

  const db = getDb();
  const orderRow = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Record<string, unknown> | undefined;

  if (!orderRow) {
    return new NextResponse("Užsakymas nerastas", { status: 404 });
  }

  const settings = getSebSettings();
  const orderNumber = orderRow.orderNumber as string;
  const totalAmount = Number(orderRow.totalAmount).toFixed(2);
  const customerName = orderRow.customerName as string;

  const html = `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEB Bankas | Saugaus atsiskaitymo portalas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f6f8;
      color: #1a1a1a;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background: #000000;
      border-bottom: 4px solid #60cd18; /* SEB signature green accent */
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .seb-logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seb-badge {
      background: #60cd18;
      color: #000;
      font-weight: 800;
      font-size: 20px;
      padding: 4px 12px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .seb-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
    }
    .security-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #a0aec0;
      font-size: 13px;
    }
    main {
      flex: 1;
      max-width: 680px;
      width: 100%;
      margin: 32px auto;
      padding: 0 16px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .card-header {
      background: #f8fafc;
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .card-header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .card-header p {
      font-size: 14px;
      color: #64748b;
    }
    .card-body {
      padding: 28px 24px;
    }
    .amount-highlight {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 14px;
      color: #166534;
      font-weight: 500;
    }
    .amount-value {
      font-size: 28px;
      font-weight: 800;
      color: #15803d;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .details-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table td {
      padding: 12px 0;
    }
    .details-table td:first-child {
      color: #64748b;
      width: 40%;
    }
    .details-table td:last-child {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .auth-methods {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 28px;
      border: 1px solid #e2e8f0;
    }
    .auth-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 12px;
    }
    .auth-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: #ffffff;
      border: 2px solid #60cd18;
      border-radius: 6px;
      cursor: pointer;
    }
    .auth-option input[type="radio"] {
      accent-color: #16a34a;
      width: 18px;
      height: 18px;
    }
    .actions {
      display: flex;
      gap: 12px;
    }
    .btn {
      flex: 1;
      padding: 14px 20px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-seb {
      background: #60cd18;
      color: #000000;
      border: none;
      box-shadow: 0 2px 8px rgba(96, 205, 24, 0.3);
    }
    .btn-seb:hover {
      background: #52b814;
    }
    .btn-cancel {
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .btn-cancel:hover {
      background: #f1f5f9;
    }
    footer {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <header>
    <div class="seb-logo-container">
      <div class="seb-badge">S|E|B</div>
      <div class="seb-title">Banklink • Internetinė bankininkystė</div>
    </div>
    <div class="security-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      256-bit SSL apsauga (PSD2 / Open Banking)
    </div>
  </header>

  <main>
    <div class="card">
      <div class="card-header">
        <h1>Mokėjimo patvirtinimas</h1>
        <p>Jūs atliekate saugų atsiskaitymą per AB SEB banką</p>
      </div>
      <div class="card-body">
        <div class="amount-highlight">
          <span class="amount-label">Mokėtina suma</span>
          <span class="amount-value">${totalAmount} €</span>
        </div>

        <table class="details-table">
          <tr>
            <td>Gavėjas:</td>
            <td>${settings.recipientName}</td>
          </tr>
          <tr>
            <td>Gavėjo sąskaita (IBAN):</td>
            <td><code>${settings.accountIban}</code></td>
          </tr>
          <tr>
            <td>Mokėjimo paskirtis:</td>
            <td>Užsakymo ${orderNumber} apmokėjimas</td>
          </tr>
          <tr>
            <td>Pirkėjas:</td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td>Tranzakcijos kodas:</td>
            <td>${paymentId}</td>
          </tr>
          <tr>
            <td>Režimas:</td>
            <td><span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size:12px; background:#e0f2fe; color:#0369a1; font-weight:600;">SEB ${settings.mode === "sandbox" ? "Testinė aplinka (Sandbox)" : "Gamybinė aplinka"}</span></td>
          </tr>
        </table>

        <div class="auth-methods">
          <div class="auth-title">Autentifikavimo priemonė</div>
          <label class="auth-option">
            <input type="radio" name="auth" checked>
            <div>
              <div style="font-weight: 600; font-size: 14px; color:#0f172a;">Smart-ID / SEB programėlė</div>
              <div style="font-size: 12px; color: #64748b;">Greitas patvirtinimas išmaniajame telefone su PIN2 kodu</div>
            </div>
          </label>
        </div>

        <div class="actions">
          <form action="/api/payment/seb-process" method="POST" style="flex: 1;">
            <input type="hidden" name="paymentId" value="${paymentId}">
            <input type="hidden" name="orderId" value="${orderId}">
            <input type="hidden" name="action" value="CONFIRM">
            <button type="submit" class="btn btn-seb" style="width: 100%;">
              Patvirtinti mokėjimą (${totalAmount} €)
            </button>
          </form>
          <form action="/api/payment/seb-process" method="POST" style="flex: 1;">
            <input type="hidden" name="paymentId" value="${paymentId}">
            <input type="hidden" name="orderId" value="${orderId}">
            <input type="hidden" name="action" value="CANCEL">
            <button type="submit" class="btn btn-cancel" style="width: 100%;">
              Nutraukti
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>

  <footer>
    AB SEB bankas • Konstitucijos pr. 24, LT-08105 Vilnius • Tel. 19222 • seb.lt<br>
    Licencijuotas Europos Centrinio Banko ir prižiūrimas Lietuvos banko.
  </footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
