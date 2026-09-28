"use client";

import { useState, useEffect } from "react";
import { Product, Order, SebBankSettings } from "@/lib/db";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Save,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Suknelės",
  "Paltai",
  "Švarkai",
  "Megztiniai",
  "Kelnės",
  "Marškiniai ir palaidinės",
  "Aksesuarai",
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "seb">("products");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sebSettings, setSebSettings] = useState<SebBankSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Product modal & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Suknelės",
    price: "",
    originalPrice: "",
    description: "",
    fabricDetails: "",
    sizes: "XS, S, M, L",
    colors: "Juoda, Kreminė",
    images: "",
    inStock: true,
    stockCount: "10",
    featured: false,
  });

  // SEB settings form state
  const [sebForm, setSebForm] = useState({
    merchantId: "",
    clientId: "",
    clientSecret: "",
    banklinkServiceUrl: "",
    mode: "sandbox" as "sandbox" | "production",
    accountIban: "",
    recipientName: "",
    privateKeyPem: "",
  });
  const [sebSaveSuccess, setSebSaveSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, sebRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/seb/settings"),
      ]);

      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const sebData = await sebRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (ordData.success) setOrders(ordData.orders);
      if (sebData.success) {
        setSebSettings(sebData.settings);
        setSebForm({
          merchantId: sebData.settings.merchantId || "",
          clientId: sebData.settings.clientId || "",
          clientSecret: sebData.settings.clientSecret || "",
          banklinkServiceUrl: sebData.settings.banklinkServiceUrl || "",
          mode: sebData.settings.mode || "sandbox",
          accountIban: sebData.settings.accountIban || "",
          recipientName: sebData.settings.recipientName || "",
          privateKeyPem: sebData.settings.privateKeyPem || "",
        });
      }
    } catch (err) {
      console.error("Admin krovimo klaida:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Open modal for new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Suknelės",
      price: "",
      originalPrice: "",
      description: "",
      fabricDetails: "70% Vilna, 30% Šilkas. Rekomenduojamas švelnus skalbimas.",
      sizes: "XS, S, M, L",
      colors: "Juoda, Smėlio",
      images: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      inStock: true,
      stockCount: "12",
      featured: false,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : "",
      description: p.description,
      fabricDetails: p.fabricDetails,
      sizes: p.sizes.join(", "),
      colors: p.colors.join(", "),
      images: p.images.join("\n"),
      inStock: p.inStock,
      stockCount: p.stockCount.toString(),
      featured: p.featured,
    });
    setIsModalOpen(true);
  };

  // Handle Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        description: productForm.description,
        fabricDetails: productForm.fabricDetails,
        sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: productForm.colors.split(",").map((c) => c.trim()).filter(Boolean),
        images: productForm.images
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        inStock: productForm.inStock,
        stockCount: parseInt(productForm.stockCount) || 0,
        featured: productForm.featured,
      };

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Prekė „${productForm.name}“ sėkmingai atnaujinta`);
          setIsModalOpen(false);
          loadAllData();
        } else {
          alert(data.error);
        }
      } else {
        // POST create
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Nauja prekė „${productForm.name}“ sėkmingai įkelta į parduotuvę!`);
          setIsModalOpen(false);
          loadAllData();
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error("Išsaugojimo klaida:", err);
      alert("Klaida išsaugant prekės duomenis");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Ar tikrai norite pašalinti prekę „${name}“ iš parduotuvės?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Prekė „${name}“ pašalinta`);
        loadAllData();
      }
    } catch (err) {
      console.error("Klaida trinant:", err);
    }
  };

  // Save SEB settings
  const handleSaveSebSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/seb/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sebForm),
      });
      const data = await res.json();
      if (data.success) {
        setSebSaveSuccess(true);
        setTimeout(() => setSebSaveSuccess(false), 3000);
        showNotification("SEB banko nustatymai sėkmingai išsaugoti");
      }
    } catch (err) {
      console.error("Klaida saugant SEB:", err);
    }
  };

  // Toggle order payment status (e.g. from pending to paid)
  const handleToggleOrderStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Užsakymo statusas pakeistas į: ${nextStatus === "paid" ? "Apmokėta" : "Laukiama"}`);
        loadAllData();
      }
    } catch (err) {
      console.error("Statuso klaida:", err);
    }
  };

  // Analytics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Parduotuvės Valdymas • Lietuvos rinka
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            Administratoriaus pultas
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Prekių įkėlimas, kainų ir aprašymų redagavimas, SEB banko sąsaja bei gauti užsakymai
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Žiūrėti parduotuvę</span>
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Įkelti naują prekę</span>
          </button>
        </div>
      </div>

      {/* Action Notification popup */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Viso prekių</span>
            <Package className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {products.length}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Aktyvios kataloge</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Užsakymai</span>
            <ShoppingBag className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {orders.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {orders.filter((o) => o.paymentStatus === "paid").length} apmokėti per SEB
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Gautos pajamos</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {totalRevenue.toFixed(2)} €
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Lietuvos bankininkystė</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>SEB integracija</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-emerald-700 mt-3 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>SEB Banklink Aktyvus</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Režimas: {sebSettings?.mode || "sandbox"}</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-stone-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "products"
              ? "border-stone-900 text-stone-900 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Prekių valdymas ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "orders"
              ? "border-stone-900 text-stone-900 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Klientų užsakymai ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("seb")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "seb"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SEB banko nustatymai & API</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Parduotuvės asortimentas
            </h2>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Pridėti naują drabužį</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Nuotrauka</th>
                    <th className="py-3 px-4">Pavadinimas</th>
                    <th className="py-3 px-4">Kategorija</th>
                    <th className="py-3 px-4">Kaina</th>
                    <th className="py-3 px-4">Dydžiai</th>
                    <th className="py-3 px-4">Likutis</th>
                    <th className="py-3 px-4 text-right">Veiksmai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4">
                        <img
                          src={p.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"}
                          alt=""
                          className="w-12 h-14 object-cover rounded-md bg-stone-100"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900 max-w-xs">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                          {p.description}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-100 font-medium text-stone-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {p.price.toFixed(2)} €
                        {p.originalPrice && (
                          <span className="block text-[10px] text-stone-400 line-through">
                            {p.originalPrice.toFixed(2)} €
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {p.sizes.join(", ")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          p.stockCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {p.stockCount} vnt.
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition"
                          title="Redaguoti prekę, kainą ar aprašymą"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Ištrinti prekę"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Gauti klientų užsakymai
            </h2>
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atnaujinti</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-1" />
              <p className="font-medium">Užsakymų dar nėra</p>
              <p className="text-xs text-stone-400 mt-1">
                Atlikite bandomąjį pirkimą parduotuvėje su SEB apmokėjimu!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nr.</th>
                      <th className="py-3 px-4">Pirkėjas</th>
                      <th className="py-3 px-4">Pristatymo adresas</th>
                      <th className="py-3 px-4">Prekės</th>
                      <th className="py-3 px-4">Suma</th>
                      <th className="py-3 px-4">SEB Mokėjimo statusas</th>
                      <th className="py-3 px-4 text-right">Keisti statusą</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-stone-900">
                          {o.orderNumber}
                          <div className="text-[10px] text-stone-400 font-normal">
                            {new Date(o.createdAt).toLocaleDateString("lt-LT")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900">{o.customerName}</div>
                          <div className="text-stone-400 text-[11px]">{o.customerEmail}</div>
                          <div className="text-stone-400 text-[11px]">{o.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{o.shippingAddress}, {o.city}</div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {o.deliveryMethod === "omniva_terminal" ? "Omniva paštomatas" : "Kurjeris"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {o.items.map((i, idx) => (
                            <div key={idx} className="text-[11px] text-stone-600">
                              {i.quantity}x {i.productName} ({i.size})
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          {o.totalAmount.toFixed(2)} €
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            o.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.paymentStatus === "cancelled"
                              ? "bg-stone-100 text-stone-500"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              o.paymentStatus === "paid" ? "bg-emerald-600" : "bg-amber-600"
                            }`} />
                            {o.paymentStatus === "paid" ? "Apmokėta per SEB" : o.paymentStatus === "cancelled" ? "Atšaukta" : "Laukiama apmokėjimo"}
                          </span>
                          {o.sebTransactionId && (
                            <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                              {o.sebTransactionId}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleOrderStatus(o.id, o.paymentStatus)}
                            className="px-2.5 py-1 text-[11px] font-medium border border-stone-200 rounded hover:bg-stone-100 text-stone-700 transition"
                          >
                            Pakeisti į {o.paymentStatus === "paid" ? "Laukiama" : "Apmokėta"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEB BANK INTEGRATION SETTINGS */}
      {activeTab === "seb" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#60cd18] text-black font-extrabold text-xs px-2 py-0.5 rounded">
                  SEB
                </span>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  SEB banko integracijos nustatymai
                </h2>
              </div>
              <p className="text-stone-500 text-xs mt-1">
                Lietuvos SEB Open Banking / PSD2 Banklink ryšio konfigūracija
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Būsena:</span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                Prijungta ir paruošta
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveSebSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  SEB Prekybininko ID (Merchant ID)
                </label>
                <input
                  type="text"
                  required
                  value={sebForm.merchantId}
                  onChange={(e) => setSebForm({ ...sebForm, merchantId: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Aplinka (Režimas)
                </label>
                <select
                  value={sebForm.mode}
                  onChange={(e) => setSebForm({ ...sebForm, mode: e.target.value as "sandbox" | "production" })}
                  className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                >
                  <option value="sandbox">Testinė aplinka (SEB Sandbox)</option>
                  <option value="production">Gamybinė aplinka (Live Production)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Įmonės banko sąskaita (IBAN) SEB banke
                </label>
                <input
                  type="text"
                  required
                  value={sebForm.accountIban}
                  onChange={(e) => setSebForm({ ...sebForm, accountIban: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Lėšų gavėjo pavadinimas (UAB / MB)
                </label>
                <input
                  type="text"
                  required
                  value={sebForm.recipientName}
                  onChange={(e) => setSebForm({ ...sebForm, recipientName: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">
                  SEB Banklink / PSD2 API Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={sebForm.banklinkServiceUrl}
                  onChange={(e) => setSebForm({ ...sebForm, banklinkServiceUrl: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">
                  RSA Privatusis raktas (skirtas mokėjimo užklausų pasirašymui)
                </label>
                <textarea
                  rows={3}
                  value={sebForm.privateKeyPem}
                  onChange={(e) => setSebForm({ ...sebForm, privateKeyPem: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-stone-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Išsaugoti SEB nustatymus</span>
              </button>

              {sebSaveSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Nustatymai sėkmingai atnaujinti!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {editingProduct ? "Redaguoti prekę" : "Įkelti naują moterišką drabužį"}
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                Užpildykite drabužio pavadinimą, kainą, aprašymą ir nuotraukų nuorodas.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Prekės pavadinimas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="pvz., Kašmyro ir vilnos paltas „Vilnius Elegance“"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Kategorija *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Kaina (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Sena kaina (€) (akcijai)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="129.00"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Prekės aprašymas *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Išsamus drabužio aprašymas, modelio savybės..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Audinio sudėtis ir priežiūra
                </label>
                <input
                  type="text"
                  placeholder="pvz., 100% Merino vilna, rekomenduojamas rankinis skalbimas"
                  value={productForm.fabricDetails}
                  onChange={(e) => setProductForm({ ...productForm, fabricDetails: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Dydžiai (atskirti kableliais)
                  </label>
                  <input
                    type="text"
                    placeholder="XS, S, M, L, XL"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Spalvos (atskirti kableliais)
                  </label>
                  <input
                    type="text"
                    placeholder="Juoda, Smėlio, Šokoladinė"
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Nuotraukų internetinės nuorodos (URL kiekviena atskiroje eilutėje)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full px-4 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded"
                  />
                  <span>Prekė yra sandėlyje</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 rounded"
                  />
                  <span>Rodyti kaip populiarią (Hero/Badge)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                >
                  {editingProduct ? "Išsaugoti pakeitimus" : "Įkelti prekę į parduotuvę"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
