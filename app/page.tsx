import Link from 'next/link';
import { MapPin, PlusCircle, ArrowRight, BarChart3, Sparkles, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import SeoContent from '@/components/SeoContent';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pt-12 sm:pt-16 pb-12 text-center overflow-y-auto h-full relative">
      <SeoContent />

      {/* Subtle radial dot pattern matching app design language */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#6D5EF5 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="max-w-4xl w-full space-y-6 sm:space-y-10 relative z-10 mx-auto">
        
        {/* Header Title Banner */}
        <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Standar Baku BAPANAS - Juknis 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700">
              System Otomasi Peta FSVA
            </span> <br className="hidden sm:inline" />
            <span className="text-slate-800">
              Provinsi dan Kabupaten/Kota
            </span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Platform pemetaan Ketahanan dan Kerentanan Pangan tingkat Provinsi (Kecamatan) 
            dan Kabupaten/Kota (Desa/Kelurahan) berdasarkan Petunjuk Teknis Badan Pangan Nasional.
          </p>
        </div>
        
        {/* 2 Utama Callout Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-3xl mx-auto w-full text-left">
          
          {/* Action 1: Lihat Peta FSVA Tersimpan */}
          <Link 
            href="/map" 
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white border-2 border-emerald-500/40 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Peta Interaktif
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Lihat Peta FSVA Tersimpan
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Eksplorasi visual kerentanan pangan interaktif. Secara otomatis menampilkan peta terakhir yang tersimpan di sistem.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-700 group-hover:text-emerald-800">
              <span>Buka Peta Interaktif</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Action 2: Mulai Buat Peta */}
          <Link 
            href="/entry" 
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white border-2 border-indigo-500/40 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Data Entry & Upload
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Mulai Buat Peta
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Upload file batas wilayah (.zip/.kml) dan data indikator (.xlsx) untuk membuat dan menghitung analisis peta FSVA baru.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-200/60 flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-700 group-hover:text-indigo-800">
              <span>Ke Halaman Data Entry</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

        </div>

        {/* Secondary Navigation Quick Links */}
        <div className="pt-4 max-w-3xl mx-auto w-full">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-around gap-3 text-xs font-bold text-slate-700">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Faktor Berpengaruh</span>
            </Link>

            <span className="hidden sm:inline text-slate-300">•</span>

            <Link 
              href="/ai-insight" 
              className="flex items-center gap-2 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Insight FSVA</span>
            </Link>

            <span className="hidden sm:inline text-slate-300">•</span>

            <Link 
              href="/download-form-v2" 
              className="flex items-center gap-2 hover:text-teal-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>Download Form V2</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white uppercase animate-pulse">BETA</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
