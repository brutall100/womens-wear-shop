const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

async function capture() {
  const artifactsDir = "/opt/cursor/artifacts";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // 1. Home page
  console.log("Capturing homepage...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, "01_parduotuve_pagrindinis.png"), fullPage: false });

  // 2. Product detail page
  console.log("Capturing product detail...");
  await page.goto("http://localhost:3000/preke/kasmyro-ir-vilnos-paltas-vilnius-elegance", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, "02_prekes_aprasymas_ir_kaina.png"), fullPage: false });

  // 3. Checkout with SEB
  console.log("Capturing checkout...");
  await page.evaluate(() => {
    localStorage.setItem("moda_cart", JSON.stringify([{
      id: "prod-1-M-Smelio",
      productId: "prod-1",
      name: "Kašmyro ir vilnos paltas „Vilnius Elegance“",
      price: 249.00,
      size: "M",
      color: "Smėlio",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
      quantity: 1
    }]));
  });
  await page.goto("http://localhost:3000/atsiskaitymas", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, "03_atsiskaitymas_seb_banklink.png"), fullPage: false });

  // 4. SEB authorization portal
  console.log("Capturing SEB bank gateway...");
  await page.goto("http://localhost:3000/api/payment/seb-auth?paymentId=SEB-DEMO-991&orderId=ord-1790614758563", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, "04_seb_banko_autorizacija.png"), fullPage: false });

  // 5. Admin Panel Products
  console.log("Capturing admin products...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, "05_admin_prekiu_ir_kainu_valdymas.png"), fullPage: false });

  // 6. Admin Panel SEB Settings
  console.log("Capturing admin SEB settings...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const sebBtn = buttons.find(b => b.textContent && b.textContent.includes("SEB banko"));
    if (sebBtn) sebBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactsDir, "06_admin_seb_api_nustatymai.png"), fullPage: false });

  await browser.close();
  console.log("Visual artifacts captured successfully!");
}

capture().catch(err => {
  console.error("Capture error:", err);
  process.exit(1);
});
