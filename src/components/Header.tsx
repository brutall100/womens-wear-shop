"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Menu, X, ShieldCheck, Heart, User, Sparkles } from "lucide-react";

export function Header() {
  const { cartCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top utility bar in Lithuanian */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Nemokamas pristatymas Lietuvoje perkant nuo 60 € • Greitas siuntimas per Omniva, DPD ir LP Express</span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Saugus atsiskaitymas per <strong>SEB banką</strong>
            </span>
            <Link href="/admin" className="hover:text-white underline underline-offset-2 flex items-center gap-1 font-medium text-amber-300">
              <Sparkles className="w-3 h-3" />
              Valdymo pultas (Admin)
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                aria-label="Atidaryti meniu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-block group">
                <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-stone-900 group-hover:text-stone-700 transition">
                  AURELIA
                </span>
                <span className="block text-[10px] tracking-[0.25em] text-stone-500 uppercase -mt-1 font-medium">
                  Vilnius • Moteriški drabužiai
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide text-stone-700">
              <Link href="/#katalogas" className="hover:text-stone-950 transition">
                Visi drabužiai
              </Link>
              <Link href="/?category=Suknel%C4%97s#katalogas" className="hover:text-stone-950 transition">
                Suknelės
              </Link>
              <Link href="/?category=Paltai#katalogas" className="hover:text-stone-950 transition">
                Paltai & Striukės
              </Link>
              <Link href="/?category=%C5%A0varkai#katalogas" className="hover:text-stone-950 transition">
                Švarkai
              </Link>
              <Link href="/?category=Megztiniai#katalogas" className="hover:text-stone-950 transition">
                Megztiniai
              </Link>
              <Link href="/?category=Keln%C4%97s#katalogas" className="hover:text-stone-950 transition">
                Kelnės
              </Link>
              <Link href="/apie-mus" className="text-stone-500 hover:text-stone-900 transition">
                Apie mus
              </Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                title="Prekių ir užsakymų valdymo panelė"
              >
                <User className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 text-stone-800 hover:text-stone-950 hover:bg-stone-100 rounded-full transition flex items-center"
                aria-label={`Krepšelis (${cartCount} prekės)`}
              >
                <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              href="/#katalogas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-800 border-b border-stone-100"
            >
              Visi drabužiai
            </Link>
            <Link
              href="/?category=Suknel%C4%97s#katalogas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-800 border-b border-stone-100"
            >
              Suknelės
            </Link>
            <Link
              href="/?category=Paltai#katalogas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-800 border-b border-stone-100"
            >
              Paltai & Striukės
            </Link>
            <Link
              href="/?category=%C5%A0varkai#katalogas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-800 border-b border-stone-100"
            >
              Švarkai
            </Link>
            <Link
              href="/?category=Megztiniai#katalogas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-800 border-b border-stone-100"
            >
              Megztiniai
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-emerald-800 bg-emerald-50 px-3 rounded-lg mt-2"
            >
              Prekių ir SEB valdymo pultas (Admin)
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
