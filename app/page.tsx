'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Map, BarChart3, FileText, Users, ArrowRight, 
  MapPin, ShieldCheck, PlusCircle, Leaf, Sparkles, Layers
} from 'lucide-react';
import SeoContent from '@/components/SeoContent';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto h-full relative font-sans text-slate-900 bg-[#eef7f3]">
      <SeoContent />

      {/* Hero Background Image (Directly using /beranda2.png from public folder) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image 
          src="/beranda2.png" 
          alt="FSVA Indonesia Beranda Background" 
          fill 
          priority
          className="object-cover object-center scale-100"
        />
        {/* Soft daylight gradient overlay for optimal readability of interactive text */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#034423]/90"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6">


        {/* Hero Body Grid: Left Text & 4 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center -mt-6 sm:-mt-10 py-1">
          
          {/* Left Column (7 Cols) - Shifted UP vertically by 155px */}
          <div className="lg:col-span-7 space-y-4 text-left mt-[80px]">
            
            {/* Main Headline */}
            <div className="space-y-1.5 px-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.15] text-slate-900">
                Menganalisis Ketahanan Pangan <br />
                <span className="text-[#046a38]">
                  secara Terukur dan Tepat Sasaran
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl font-medium mt-3 drop-shadow-sm">
                FSVA.my.id adalah sistem pemetaan interaktif untuk analisis Ketahanan dan Kerentanan Pangan tingkat Provinsi, Kabupaten/Kota, hingga Desa/Kelurahan sesuai Petunjuk Teknis Badan Pangan Nasional.
              </p>
            </div>

            {/* Lower Section (4 Features Panel & Callout Banner) - Shifted DOWN vertically by 140px as requested */}
            <div className="space-y-4 mt-8">
              
              {/* 4 Feature Highlights Glass Panel (65% Transparency bg-white/65, No Backdrop Blur) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/65 border border-white/80 shadow-lg shadow-emerald-950/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="space-y-1.5 p-2 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#046a38] shadow-2xs">
                    <Map className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Peta Interaktif</h3>
                  <p className="text-[10px] sm:text-xs text-slate-800 leading-normal font-semibold">Visualisasi kerentanan pangan secara detail dan real-time</p>
                </div>

                <div className="space-y-1.5 p-2 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shadow-2xs">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Analisis Otomatis</h3>
                  <p className="text-[10px] sm:text-xs text-slate-800 leading-normal font-semibold">Hitung indikator FSVA secara otomatis dan akurat</p>
                </div>

                <div className="space-y-1.5 p-2 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Laporan Cepat</h3>
                  <p className="text-[10px] sm:text-xs text-slate-800 leading-normal font-semibold">Unduh hasil analisis dalam berbagai format dengan mudah</p>
                </div>

                <div className="space-y-1.5 p-2 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Kolaboratif</h3>
                  <p className="text-[10px] sm:text-xs text-slate-800 leading-normal font-semibold">Berbagi dan kelola data analisis FSVA antar wilayah</p>
                </div>

              </div>

              {/* Primary Action Callout Banner */}
              <div className="rounded-2xl bg-[#046a38] p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white text-[#046a38] flex items-center justify-center shrink-0 shadow-md">
                  <MapPin className="w-6 h-6 text-[#046a38]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Mulai Pemetaan Sekarang</h3>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Link
                  href="/map"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs text-[#046a38] bg-white hover:bg-emerald-50 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Buka Peta Interaktif</span>
                  <ArrowRight className="w-4 h-4 text-[#046a38]" />
                </Link>

                <Link
                  href="/entry"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-extrabold text-xs text-white bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400/40 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-200" />
                  <span>Buat Peta</span>
                </Link>
              </div>
            </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Footer Margin Bar (Dark Green #034423) */}
      <div className="relative z-10 w-full bg-[#034423] border-t border-emerald-600/40 py-3.5 px-4 sm:px-8 text-emerald-200 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* App Branding */}
          <div className="flex items-center gap-2.5 text-white font-extrabold">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
          </div>

          {/* Center Exact Retained Text */}
          <div className="text-center font-extrabold text-emerald-100 tracking-wider text-[11px] sm:text-xs">
            DIKEMBANGKAN UNTUK KETAHANAN PANGAN INDONESIA
          </div>

          {/* Right side: System Version Badge (No BSSN lock badge as instructed) */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Otomasi FSVA V2 (2026)</span>
          </div>

        </div>
      </div>

    </div>
  );
}
