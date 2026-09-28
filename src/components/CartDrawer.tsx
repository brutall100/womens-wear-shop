"use client";

import { useCart } from "@/lib/cart-context";
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal } = useCart();

  if (!isOpen) return null;

  const freeShippingThreshold = 60;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="text-lg font-serif font-semibold text-stone-900">
                Pirkinių krepšelis
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              aria-label="Uždaryti krepšelį"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-stone-50 p-4 border-b border-stone-200">
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>
                {remainingForFreeShipping > 0
                  ? `Iki nemokamo pristatymo trūksta ${remainingForFreeShipping.toFixed(2)} €`
                  : "Jums taikomas nemokamas pristatymas Lietuvoje!"}
              </span>
              <span className="font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4 stroke-1" />
                <p className="text-stone-600 font-medium">Jūsų krepšelis tuščias</p>
                <p className="text-stone-400 text-xs mt-1">
                  Atraskite naujausias elegantiškas moteriškų drabužių kolekcijas.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition"
                >
                  Pradėti apsipirkimą
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-stone-100 last:border-b-0"
                >
                  <div className="relative w-20 h-24 rounded-md overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-stone-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-red-500 transition p-1"
                          title="Pašalinti prekę"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-stone-500 mt-1 space-x-2">
                        <span>Dydis: <strong className="text-stone-800">{item.size}</strong></span>
                        <span>•</span>
                        <span>Spalva: <strong className="text-stone-800">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-stone-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer checkout bar */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tarpinė suma</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Pristatymas Lietuvoje</span>
                  <span>{remainingForFreeShipping === 0 ? "Nemokamai" : "3.50 €"}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Mokėtina suma</span>
                  <span>
                    {(subtotal + (remainingForFreeShipping === 0 ? 0 : 3.5)).toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* SEB payment trust callout */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                <div className="bg-emerald-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                  SEB
                </div>
                <span>Atsiskaitykite tiesiogiai per SEB internetinę bankininkystę</span>
              </div>

              <Link
                href="/atsiskaitymas"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-stone-900 text-white font-medium text-sm rounded-lg hover:bg-stone-800 transition shadow-sm"
              >
                <span>Pereiti į apmokėjimą</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
