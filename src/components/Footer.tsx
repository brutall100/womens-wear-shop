import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Service value propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-800 text-stone-400">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-medium text-base mb-1">Greitas pristatymas Lietuvoje</h4>
              <p className="text-xs leading-relaxed">
                Siunčiame per Omniva, DPD paštomatus ir kurjerius per 1–2 d.d. Nemokamas pristatymas nuo 60 €.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-medium text-base mb-1">SEB banko integracija</h4>
              <p className="text-xs leading-relaxed">
                Saugi internetinė bankininkystė, PSD2 Open Banking standartas ir tiesioginis momentinis atsiskaitymas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-emerald-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-medium text-base mb-1">14 dienų grąžinimo garantija</h4>
              <p className="text-xs leading-relaxed">
                Jeigu dydis ar modelis netiko – paprastas ir skaidrus grąžinimas be jokių papildomų rūpesčių.
              </p>
            </div>
          </div>
        </div>

        {/* Links section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold tracking-wider text-white">
              AURELIA
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Lietuviškas moteriškų drabužių prekės ženklas, vertinantis natūralius audinius, kruopštų pasiuvimą ir nepriekaištingą stilių.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500" />
                <span>Gedimino pr. 28, Vilnius, Lietuva</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>pagalba@aureliamada.lt</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-500" />
                <span>+370 600 12345 (I-V 9:00 - 18:00)</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Kategorijos
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/?category=Suknel%C4%97s#katalogas" className="hover:text-white transition">Suknelės ir sarafanai</Link></li>
              <li><Link href="/?category=Paltai#katalogas" className="hover:text-white transition">Paltai ir vilnoniai apsiaustai</Link></li>
              <li><Link href="/?category=%C5%A0varkai#katalogas" className="hover:text-white transition">Kostiuminiai švarkai</Link></li>
              <li><Link href="/?category=Megztiniai#katalogas" className="hover:text-white transition">Kašmyro ir merino megztiniai</Link></li>
              <li><Link href="/?category=Keln%C4%97s#katalogas" className="hover:text-white transition">Klasikinės kelnės</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Klientų aptarnavimas
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/pristatymas" className="hover:text-white transition">Pristatymo sąlygos Lietuvoje</Link></li>
              <li><Link href="/grazinimas" className="hover:text-white transition">Prekių grąžinimas ir keitimas</Link></li>
              <li><Link href="/dydziu-lentele" className="hover:text-white transition">Dydžių lentelė</Link></li>
              <li><Link href="/privatumo-politika" className="hover:text-white transition">Privatumo politika</Link></li>
              <li><Link href="/taisykles" className="hover:text-white transition">Pirkimo-pardavimo taisyklės</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Atsiskaitymo partneriai
            </h5>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Mokėjimai apdorojami tiesiogiai per patikimus Lietuvos bankus:
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-bold text-xs text-emerald-400">
                SEB Banklink
              </span>
              <span className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-semibold text-xs text-stone-300">
                Swedbank
              </span>
              <span className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-semibold text-xs text-stone-300">
                Luminor
              </span>
              <span className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-semibold text-xs text-stone-300">
                Šiaulių bankas
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-800">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 transition font-medium"
              >
                <span>Parduotuvės administratoriaus panelė &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AURELIA. Visos teisės saugomos. Lietuvos rinka.</p>
          <p className="text-stone-400">Pritaikyta sklandžiai prekybai Lietuvoje su integruotu SEB mokėjimu</p>
        </div>
      </div>
    </footer>
  );
}
