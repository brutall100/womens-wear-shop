import Link from "next/link";
import { ArrowLeft, CheckCircle, Sparkles, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Mūsų istorija
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">
          Apie AURELIA mados namus
        </h1>
        <p className="text-stone-500 text-base max-w-xl mx-auto">
          Lietuviška kokybė, natūralūs audiniai ir nesenstanti klasika šiuolaikinei moteriai.
        </p>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border border-stone-200">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
          alt="AURELIA ateljė"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed">
        <p className="text-lg leading-relaxed">
          <strong>AURELIA</strong> gimė iš siekio pasiūlyti Lietuvos moterims drabužius, kurie sujungia prabangos pojūtį, natūralumą ir kasdienį patogumą. Mes tikime, kad drabužis turi tarnauti ilgus metus, neprarasdamas savo pirminės formos ir grožio.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Itališki natūralūs audiniai
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kiekvienas paltas, suknelė ar megztinis kuriamas tik iš sertifikuotų merino vilnos, kašmyro, natūralaus šilko ir lino audinių.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Skaidrus ir patikimas aptarnavimas
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bendradarbiaujame su AB SEB banku, užtikrindami aukščiausio lygio kibernetinį saugumą ir greitą atsiskaitymą.
            </p>
          </div>
        </div>

        <p>
          Mūsų gaminiai siuvami nedidelėmis partijomis, kreipiant ypatingą dėmesį į kiekvieną siūlę, pamušalą ir sagutę. Kviečiame atrasti mūsų kolekciją ir pajusti tikrąją eleganciją.
        </p>
      </div>

      <div className="text-center pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grįžti į drabužių katalogą</span>
        </Link>
      </div>
    </div>
  );
}
