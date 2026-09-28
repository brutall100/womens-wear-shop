async function runTests() {
  const BASE_URL = "http://localhost:3000";
  console.log("=== Pradedamas moteriškų drabužių el. parduotuvės ir SEB testavimas ===");

  // 1. Test GET /api/products
  console.log("\n1. Tikrinamas prekių sąrašas (GET /api/products)...");
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const prodData = await prodRes.json();
  if (!prodData.success || prodData.products.length === 0) {
    throw new Error("Klaida: Nerasta prekių");
  }
  console.log(`✓ Rasta ${prodData.products.length} prekių kataloge.`);
  const sampleProduct = prodData.products[0];
  console.log(`  Pavyzdinė prekė: „${sampleProduct.name}“ - ${sampleProduct.price} €`);

  // 2. Test Admin adding a new product
  console.log("\n2. Tikrinamas naujos prekės įkėlimas per Admin API (POST /api/products)...");
  const newProductPayload = {
    name: "Lininė vasaros palaidinė „Klaipėda Breeze“",
    category: "Marškiniai ir palaidinės",
    price: 69.00,
    originalPrice: 85.00,
    description: "Natūralaus 100% lietuviško lino laisvo silueto palaidinė, sukurta karštoms vasaros dienoms.",
    fabricDetails: "100% Lietuviškas minkštintas linas.",
    sizes: ["S", "M", "L"],
    colors: ["Natūrali lino", "Jūros mėlyna"],
    images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80"],
    inStock: true,
    stockCount: 15,
    featured: true
  };

  const createRes = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProductPayload)
  });
  const createData = await createRes.json();
  if (!createData.success) {
    throw new Error("Klaida kuriant prekę: " + createData.error);
  }
  console.log(`✓ Prekė sukurta sėkmingai! ID: ${createData.productId}, Slug: ${createData.slug}`);

  // 3. Test Editing product price and description
  console.log("\n3. Tikrinamas prekės kainos ir aprašymo redagavimas (PUT /api/products/[id])...");
  const updateRes = await fetch(`${BASE_URL}/api/products/${createData.productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      price: 65.00,
      description: "Atnaujintas aprašymas: dar švelnesnis 100% linas su kokoso sagutėmis."
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success) {
    throw new Error("Klaida redaguojant prekę");
  }
  console.log("✓ Prekės kaina ir aprašymas sėkmingai atnaujinti!");

  // 4. Test SEB Bank settings
  console.log("\n4. Tikrinami SEB banko integracijos nustatymai (GET /api/seb/settings)...");
  const sebRes = await fetch(`${BASE_URL}/api/seb/settings`);
  const sebData = await sebRes.json();
  if (!sebData.success) {
    throw new Error("Nepavyko gauti SEB nustatymų");
  }
  console.log(`✓ SEB nustatymai gauti: IBAN=${sebData.settings.accountIban}, Gavėjas=${sebData.settings.recipientName}, Režimas=${sebData.settings.mode}`);

  // 5. Test Customer Checkout & SEB Banklink Session creation
  console.log("\n5. Tikrinamas pirkėjo užsakymo kūrimas su SEB banklink integracija (POST /api/orders)...");
  const orderPayload = {
    customerName: "Rasa Kazlauskienė",
    customerEmail: "rasa.kazlauskiene@pavyzdys.lt",
    customerPhone: "+37061122334",
    shippingAddress: "Konstitucijos pr. 10-4",
    city: "Vilnius",
    postalCode: "LT-09308",
    deliveryMethod: "omniva_terminal",
    deliveryDetails: "Vilnius, PC Europa Omniva paštomatas",
    items: [
      {
        productId: sampleProduct.id,
        productName: sampleProduct.name,
        price: sampleProduct.price,
        size: "M",
        color: "Smėlio",
        quantity: 1,
        imageUrl: sampleProduct.images[0]
      }
    ]
  };

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload)
  });
  const orderData = await orderRes.json();
  if (!orderData.success || !orderData.sebSession) {
    throw new Error("Klaida kuriant užsakymą arba SEB sesiją");
  }
  console.log(`✓ Užsakymas sukurtas: Nr. ${orderData.orderNumber}, Suma: ${orderData.totalAmount} €`);
  console.log(`✓ Sugeneruota SEB Banklink nukreipimo nuoroda: ${orderData.sebSession.banklinkUrl}`);
  console.log(`✓ Sugeneruotas SEB mokėjimo ID: ${orderData.sebSession.paymentId}`);

  // 6. Test SEB Authorization gateway response
  console.log("\n6. Tikrinamas SEB banko autorizavimo portalas...");
  const authRes = await fetch(orderData.sebSession.banklinkUrl);
  if (authRes.status !== 200) {
    throw new Error("SEB autorizacijos puslapis neatsako");
  }
  const authHtml = await authRes.text();
  if (!authHtml.includes("SEB") || !authHtml.includes(orderData.orderNumber)) {
    throw new Error("SEB puslapyje trūksta informacijos apie užsakymą");
  }
  console.log("✓ SEB banko autorizacijos langas pateiktas teisingai su banko logotipu ir rekvizitais.");

  // 7. Test confirming payment via SEB process endpoint
  console.log("\n7. Tikrinamas mokėjimo patvirtinimas per SEB (POST /api/payment/seb-process)...");
  const formData = new URLSearchParams();
  formData.append("paymentId", orderData.sebSession.paymentId);
  formData.append("orderId", orderData.orderId);
  formData.append("action", "CONFIRM");

  const procRes = await fetch(`${BASE_URL}/api/payment/seb-process`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
    redirect: "manual"
  });

  const location = procRes.headers.get("location");
  console.log(`✓ Gautas nukreipimas po apmokėjimo: ${location}`);

  // 8. Verify order is marked as paid
  console.log("\n8. Tikrinama ar užsakymo statusas duomenų bazėje tapo 'paid'...");
  const checkOrderRes = await fetch(`${BASE_URL}/api/orders/${orderData.orderId}`);
  const checkOrderData = await checkOrderRes.json();
  if (checkOrderData.order.paymentStatus !== "paid") {
    throw new Error(`Užsakymo statusas nėra 'paid', dabartinis: ${checkOrderData.order.paymentStatus}`);
  }
  console.log(`✓ Užsakymas ${orderData.orderNumber} sėkmingai pažymėtas kaip APMOKĖTAS (paid)!`);

  console.log("\n=== VISI TESTAI SĖKMINGAI ATLIKTI! ===");
}

runTests().catch((e) => {
  console.error("Testo klaida:", e);
  process.exit(1);
});
