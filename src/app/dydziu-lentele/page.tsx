import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

export default function SizeGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Gidas
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Moteriškų drabužių dydžių lentelė
        </h1>
        <p className="text-stone-500 text-sm max-w-lg mx-auto">
          Norėdami išsirinkti idealiai tinkantį dydį, naudokitės žemiau pateiktais standartiniais išmatavimais (cm).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center gap-3">
          <Ruler className="w-5 h-5 text-stone-700" />
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Standartiniai Europos (EU) dydžiai
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px]">
                <th className="py-4 px-6">Dydis</th>
                <th className="py-4 px-6">EU Dydis</th>
                <th className="py-4 px-6">Krūtinės apimtis (cm)</th>
                <th className="py-4 px-6">Liemens apimtis (cm)</th>
                <th className="py-4 px-6">Klubų apimtis (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3.5 px-6 font-bold text-stone-900">XS</td>
                <td className="py-3.5 px-6">34</td>
                <td className="py-3.5 px-6">80 – 84</td>
                <td className="py-3.5 px-6">62 – 66</td>
                <td className="py-3.5 px-6">88 – 92</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-stone-900">S</td>
                <td className="py-3.5 px-6">36</td>
                <td className="py-3.5 px-6">84 – 88</td>
                <td className="py-3.5 px-6">66 – 70</td>
                <td className="py-3.5 px-6">92 – 96</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-stone-900">M</td>
                <td className="py-3.5 px-6">38</td>
                <td className="py-3.5 px-6">88 – 92</td>
                <td className="py-3.5 px-6">70 – 74</td>
                <td className="py-3.5 px-6">96 – 100</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-stone-900">L</td>
                <td className="py-3.5 px-6">40</td>
                <td className="py-3.5 px-6">92 – 96</td>
                <td className="py-3.5 px-6">74 – 78</td>
                <td className="py-3.5 px-6">100 – 104</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-stone-900">XL</td>
                <td className="py-3.5 px-6">42</td>
                <td className="py-3.5 px-6">96 – 102</td>
                <td className="py-3.5 px-6">78 – 84</td>
                <td className="py-3.5 px-6">104 – 110</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grįžti į apsipirkimą</span>
        </Link>
      </div>
    </div>
  );
}
