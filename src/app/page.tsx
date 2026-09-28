"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/db";
import { useCart } from "@/lib/cart-context";
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Check,
  Star,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  "Visi",
  "Suknelės",
  "Paltai",
  "Švarkai",
  "Megztiniai",
  "Kelnės",
  "Marškiniai ir palaidinės",
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Visi");
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url =
        selectedCategory === "Visi"
          ? "/api/products"
          : `/api/products?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Klaida kraunant prekes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.sizes[0] || "M",
      color: product.colors[0] || "Klasikinė",
      imageUrl: product.images[0] || "",
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Banner tailored for Lithuanian Women's Fashion */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
            alt="Moteriška mada ir elegancija"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nauja 2026 m. rudens–žiemos kolekcija Lietuvai</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Laikui nepavaldi <br />
              <span className="font-semibold italic text-stone-100">elegancija ir šiluma</span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Aukščiausios kokybės itališkas kašmyras, merino vilna ir natūralus šilkas. Sukurta moteriai, kuri vertina subtilią prabangą, nepriekaištingą pasiuvimą ir komfortą.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#katalogas"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-stone-900 font-semibold text-sm rounded-lg hover:bg-stone-100 transition shadow-lg shadow-black/20"
              >
                <span>Peržiūrėti kolekciją</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-4 bg-stone-800/80 hover:bg-stone-800 text-white font-medium text-sm rounded-lg border border-stone-700 backdrop-blur-sm transition"
              >
                <span>Prekių valdymo pultas (Admin)</span>
              </Link>
            </div>

            {/* Micro value badges */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-stone-800/80 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pristatymas per 1–2 d.d.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SEB saugus atsiskaitymas</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>Natūralios kilmės audiniai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="katalogas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Kolekcijos katalogas
            </span>
            <h2 className="font-serif text-3xl font-semibold text-stone-900 mt-1">
              Moteriški drabužiai
            </h2>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-stone-400 mr-1 shrink-0" />
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-xl overflow-hidden border border-stone-200 p-4">
                <div className="bg-stone-200 aspect-[3/4] rounded-lg mb-4" />
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-4" />
                <div className="h-6 bg-stone-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-600 font-medium text-lg">Šioje kategorijoje prekių šiuo metu nėra</p>
            <p className="text-stone-400 text-sm mt-1">
              Užeikite į administratoriaus pultą ir pridėkite naujų prekių!
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition"
            >
              <span>Atidaryti Admin pultą</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product) => {
              const isAdded = addedId === product.id;
              const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:shadow-xl hover:border-stone-300 transition-all duration-300"
                >
                  {/* Image Container with Badges */}
                  <Link
                    href={`/preke/${product.slug || product.id}`}
                    className="relative aspect-[3/4] bg-stone-100 overflow-hidden block"
                  >
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {product.featured && (
                        <span className="bg-stone-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                          Populiaru
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg-amber-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                          Akcija -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                      {product.category}
                    </div>
                  </Link>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
                        <span>Dydžiai:</span>
                        <div className="flex gap-1 font-medium text-stone-700">
                          {product.sizes.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-stone-100 rounded text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link href={`/preke/${product.slug || product.id}`} className="block group-hover:text-amber-900 transition">
                        <h3 className="font-serif text-lg font-medium text-stone-900 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-stone-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-serif font-bold text-stone-900">
                            {product.price.toFixed(2)} €
                          </span>
                          {hasDiscount && (
                            <span className="text-xs line-through text-stone-400 font-medium">
                              {product.originalPrice?.toFixed(2)} €
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium block">
                          {product.inStock ? `Liko ${product.stockCount} vnt.` : "Išparduota"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={!product.inStock}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-900 hover:bg-stone-800 text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Įdėta</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Į krepšelį</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SEB Bank Integration Highlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-stone-800">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Lietuvos bankininkystės standartas
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-light leading-tight">
                Tiesioginė ir saugi <br />
                <span className="font-bold text-emerald-400">SEB banko integracija</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Pirkite patogiai ir be papildomų mokesčių! Mūsų parduotuvė palaiko tiesioginį SEB Banklink ir PSD2 Open Banking protokolą su Smart-ID / SEB programėlės patvirtinimu realiuoju laiku.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                  <span>Momentinis užsakymo patvirtinimas</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                  <span>256-bitų SSL šifravimas</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                  <span>Valdykite SEB API raktus Admin pultelyje</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                  <span>Lietuviška sąskaita faktūra</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-950/80 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="bg-[#60cd18] text-black font-extrabold text-sm px-2.5 py-1 rounded">
                    SEB
                  </span>
                  <span className="text-sm font-semibold text-white">Banklink Gateway</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  ONLINE
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs font-mono">
                <div className="flex justify-between text-stone-400">
                  <span>Protokolas:</span>
                  <span className="text-stone-200">SEB PSD2 Open Banking</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Atsiskaitymo valiuta:</span>
                  <span className="text-stone-200">EUR (€)</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Autentifikacija:</span>
                  <span className="text-emerald-300">Smart-ID / SEB App</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Prekių valdymas:</span>
                  <span className="text-stone-200">Integruotas Admin</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between items-center">
                <span className="text-xs text-stone-400">Norite išbandyti mokėjimą?</span>
                <a
                  href="#katalogas"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition"
                >
                  Rinktis prekę &rarr;
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
