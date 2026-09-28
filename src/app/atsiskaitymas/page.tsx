"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states in Lithuanian
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "+370",
    shippingAddress: "",
    city: "Vilnius",
    postalCode: "",
    deliveryMethod: "omniva_terminal" as "omniva_terminal" | "dpd_courier" | "lpexpress_terminal",
    deliveryDetails: "Vilnius, PC Panorama paštomatas (Saltoniškių g. 9)",
    paymentMethod: "seb_banklink",
  });

  const freeShippingThreshold = 60;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 3.50;
  const totalAmount = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Jūsų krepšelis yra tuščias");
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.shippingAddress) {
      setError("Prašome užpildyti visus privalomus laukus");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            price: i.price,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Nepavyko sukurti užsakymo");
      }

      // Order created! If SEB banklink session was created, redirect directly to SEB portal
      if (data.sebSession && data.sebSession.banklinkUrl) {
        // Clear cart now so when returning, user does not have duplicate order
        clearCart();
        window.location.href = data.sebSession.banklinkUrl;
      } else {
        clearCart();
        router.push(`/uzsakymas/patvirtinimas?orderId=${data.orderId}`);
      }
    } catch (err: unknown) {
      console.error("Užsakymo klaida:", err);
      const message = err instanceof Error ? err.message : "Įvyko nenumatyta klaida";
      setError(message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4 stroke-1" />
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Jūsų krepšelis tuščias
        </h1>
        <p className="text-stone-600 mb-8 text-sm">
          Norėdami atsiskaityti, pirmiausia įsidėkite patikusių moteriškų drabužių į krepšelį.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition"
        >
          <span>Eiti į parduotuvę</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Užsakymo apmokėjimas
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Greitas ir saugus atsiskaitymas Lietuvos pirkėjams per SEB internetinę bankininkystę
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Customer details & Delivery */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Customer Contact Info */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <h2 className="text-lg font-serif font-semibold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              Kontaktiniai pirkėjo duomenys
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Vardas ir Pavardė *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pvz., Kristina Petrauskienė"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  El. pašto adresas * (sąskaitai ir siuntos sekimui)
                </label>
                <input
                  type="email"
                  required
                  placeholder="vardas@pavyzdys.lt"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Telefono numeris * (SMS kodui)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+370 600 00000"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery in Lithuania */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <h2 className="text-lg font-serif font-semibold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              Pristatymo būdas Lietuvoje
            </h2>

            <div className="space-y-3">
              {/* Omniva */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                formData.deliveryMethod === "omniva_terminal"
                  ? "border-stone-900 bg-stone-50/70"
                  : "border-stone-200 hover:border-stone-300"
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  checked={formData.deliveryMethod === "omniva_terminal"}
                  onChange={() => setFormData({
                    ...formData,
                    deliveryMethod: "omniva_terminal",
                    deliveryDetails: "Omniva paštomatas: Vilnius, PC Panorama (Saltoniškių g. 9)"
                  })}
                  className="mt-1 accent-stone-900"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-stone-900">Omniva paštomatai Lietuvoje</span>
                    <span className="text-xs font-bold text-stone-700">
                      {shippingFee === 0 ? "Nemokamai" : "3.50 €"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Atsiėmimas 24/7, pristatoma per 1 d.d. po išsiuntimo</p>
                </div>
              </label>

              {/* DPD courier */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                formData.deliveryMethod === "dpd_courier"
                  ? "border-stone-900 bg-stone-50/70"
                  : "border-stone-200 hover:border-stone-300"
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  checked={formData.deliveryMethod === "dpd_courier"}
                  onChange={() => setFormData({
                    ...formData,
                    deliveryMethod: "dpd_courier",
                    deliveryDetails: "DPD kurjeriu tiesiai į rankas nurodytu adresu"
                  })}
                  className="mt-1 accent-stone-900"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-stone-900">DPD kurjeris į namus ar biurą</span>
                    <span className="text-xs font-bold text-stone-700">
                      {shippingFee === 0 ? "Nemokamai" : "4.90 €"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Kurjeris susisieks prieš atvykdamas</p>
                </div>
              </label>

              {/* LP Express */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                formData.deliveryMethod === "lpexpress_terminal"
                  ? "border-stone-900 bg-stone-50/70"
                  : "border-stone-200 hover:border-stone-300"
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  checked={formData.deliveryMethod === "lpexpress_terminal"}
                  onChange={() => setFormData({
                    ...formData,
                    deliveryMethod: "lpexpress_terminal",
                    deliveryDetails: "LP EXPRESS paštomatas: Gedimino pr. 9, Vilnius"
                  })}
                  className="mt-1 accent-stone-900"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-stone-900">LP EXPRESS (Lietuvos paštas)</span>
                    <span className="text-xs font-bold text-stone-700">
                      {shippingFee === 0 ? "Nemokamai" : "3.20 €"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Platus paštomatų tinklas visoje Lietuvoje</p>
                </div>
              </label>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Gatvė, namo/buto nr. arba paštomato pavadinimas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pvz., Gedimino pr. 24-5 arba PC Akropolis paštomatas"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Miestas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: SEB Bank Integration Payment Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-xs space-y-6">
            <h2 className="text-lg font-serif font-semibold text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Apmokėjimas per SEB banką
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Oficiali SEB integracija
              </span>
            </h2>

            {/* SEB Bank card option */}
            <div className="p-4 bg-emerald-50/60 border-2 border-[#60cd18] rounded-xl flex items-start gap-4">
              <div className="bg-[#60cd18] text-black font-extrabold text-lg px-3 py-1.5 rounded shadow-xs mt-0.5">
                SEB
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-stone-900">
                    AB SEB bankas (Banklink / Open Banking)
                  </span>
                  <span className="text-xs bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded">
                    AKTYVUOTA
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Paspaudę „Apmokėti per SEB banką“, būsite saugiai nukreipti į SEB internetinę bankininkystę, kur patvirtinsite mokėjimą Smart-ID arba mobiliuoju parašu.
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                  <span>Protokolas: PSD2 Open Banking</span>
                  <span>•</span>
                  <span>Momentinis įskaitymas</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 italic">
              Parduotuvė naudoja saugų SEB Banklink ryšį. Jūsų banko prisijungimo duomenys niekada nėra saugomi parduotuvės sistemoje.
            </p>
          </div>

        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm sticky top-28 space-y-6">
            <h3 className="font-serif text-lg font-semibold text-stone-900 pb-4 border-b border-stone-200">
              Užsakymo suvestinė ({items.length} prek.)
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-12 h-16 rounded object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-stone-900 line-clamp-1">{item.name}</p>
                    <p className="text-stone-500 mt-0.5">
                      Dydis: {item.size} • Spalva: {item.color}
                    </p>
                    <p className="text-stone-500">{item.quantity} vnt. × {item.price.toFixed(2)} €</p>
                  </div>
                  <span className="font-semibold text-stone-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-stone-200 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Tarpinė suma</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pristatymas Lietuvoje</span>
                <span>{shippingFee === 0 ? "Nemokamai" : `${shippingFee.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>Mokėti iš viso</span>
                <span className="text-xl font-serif">{totalAmount.toFixed(2)} €</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-black/10 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Nukreipiama į SEB banką...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Apmokėti per SEB banką ({totalAmount.toFixed(2)} €)</span>
                </>
              )}
            </button>

            {/* Trust highlights */}
            <div className="pt-2 text-center text-xs text-stone-400 space-y-1">
              <p>✓ 14 dienų grąžinimo garantija</p>
              <p>✓ Saugu, greita ir patikima</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
