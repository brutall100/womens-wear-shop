"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/db";
import { useCart } from "@/lib/cart-context";
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Check,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    if (idOrSlug) {
      fetchProduct();
    }
  }, [idOrSlug]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${idOrSlug}`);
      const data = await res.json();
      if (data.success && data.product) {
        const p: Product = data.product;
        setProduct(p);
        setSelectedSize(p.sizes[0] || "");
        setSelectedColor(p.colors[0] || "");
        setSelectedImage(p.images[0] || "");
      }
    } catch (err) {
      console.error("Klaida:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize || "M",
      color: selectedColor || "Klasikinė",
      imageUrl: selectedImage || product.images[0] || "",
      quantity,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-stone-900" />
        <p className="mt-4 text-stone-600 font-medium">Kraunama informacija...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Prekė nerasta</h1>
        <p className="text-stone-600 mb-6">Atsiprašome, ši prekė buvo ištrinta arba neegzistuoja.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grįžti į pagrindinį puslapį</span>
        </Link>
      </div>
    );
  }

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
        <Link href="/" className="hover:text-stone-900">
          Pagrindinis
        </Link>
        <span>/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}#katalogas`} className="hover:text-stone-900">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
                Akcija -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === img ? "border-stone-900 ring-2 ring-stone-900/20" : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl font-bold text-stone-900 mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pb-6 border-b border-stone-200">
              <span className="text-3xl font-serif font-bold text-stone-900">
                {product.price.toFixed(2)} €
              </span>
              {hasDiscount && (
                <span className="text-base line-through text-stone-400 font-medium">
                  {product.originalPrice?.toFixed(2)} €
                </span>
              )}
              <span className="text-xs text-stone-500 font-normal">
                (su PVM)
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Aprašymas
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Fabric & composition */}
            {product.fabricDetails && (
              <div className="p-4 bg-stone-100/70 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block">Audinio sudėtis ir priežiūra:</span>
                <p>{product.fabricDetails}</p>
              </div>
            )}

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Pasirinkite spalvą: <span className="text-stone-900 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-xs font-medium rounded-lg border transition ${
                        selectedColor === c
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-stone-700">
                    Dydis: <span className="text-stone-900 font-semibold">{selectedSize}</span>
                  </span>
                  <Link href="/dydziu-lentele" className="text-stone-500 hover:text-stone-900 underline">
                    Dydžių lentelė
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-10 flex items-center justify-center text-xs font-semibold rounded-lg border transition ${
                        selectedSize === s
                          ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                          : "border-stone-200 bg-white text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex gap-4">
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition shadow-md cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-900 hover:bg-stone-800 text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Įdėta į krepšelį!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Į krepšelį ({product.price * quantity} €)</span>
                    </>
                  )}
                </button>
              </div>

              {/* SEB direct checkout note */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
                <span className="bg-[#60cd18] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                  SEB
                </span>
                <span>Palaikomas momentinis atsiskaitymas per <strong>SEB banką</strong> arba Smart-ID</span>
              </div>
            </div>

            {/* Service guarantees */}
            <div className="pt-6 space-y-3 text-xs text-stone-600 border-t border-stone-200">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-stone-800 shrink-0" />
                <span>Pristatymas Lietuvoje per 1–2 d.d. (Omniva, DPD, LP Express)</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-stone-800 shrink-0" />
                <span>Nemokamas ir paprastas keitimas bei grąžinimas per 14 dienų</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0" />
                <span>100% saugus mokėjimas, patvirtintas Lietuvos banko licencijuotais kanalais</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
