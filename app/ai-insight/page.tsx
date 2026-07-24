'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Printer, AlertTriangle, RefreshCw, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MapDetail {
  nama_kabupaten: string;
  level: 'kab_kota' | 'provinsi';
  tahun: number;
  created_at: string;
}

export default function AIInsightPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<MapDetail[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapDetail | null>(null);
  const [level, setLevel] = useState<'kab_kota' | 'provinsi'>('kab_kota');
  const [loadingMaps, setLoadingMaps] = useState(true);
  
  const [generating, setGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingPhases = [
    'Mengambil data spasial dan tabular wilayah...',
    'Menganalisis indikator di 3 pilar ketahanan pangan...',
    'Mengidentifikasi desa/kecamatan rentan (Prioritas 1-3)...',
    'Menghubungkan ke Gemini AI Engine...',
    'Menyusun narasi ringkasan eksekutif dan rekomendasi kebijakan...'
  ];

  // Fetch available maps
  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.mapDetails) {
          setMaps(data.mapDetails);
          // Set initial default map based on level
          const filtered = data.mapDetails.filter((m: MapDetail) => m.level === level);
          if (filtered.length > 0) {
            setSelectedMap(filtered[0]);
          }
        }
        setLoadingMaps(false);
      })
      .catch(err => {
        console.error('Error fetching maps:', err);
        setError('Gagal memuat daftar peta dari database.');
        setLoadingMaps(false);
      });
  }, [level]);

  // Loading phase animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingPhase(prev => {
          if (prev < loadingPhases.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!selectedMap) return;
    setGenerating(true);
    setError(null);
    setInsight(null);

    try {
      const url = `/api/ai-insight?kabupaten=${encodeURIComponent(selectedMap.nama_kabupaten)}&level=${selectedMap.level}&tahun=${selectedMap.tahun}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses laporan.');
      }

      setInsight(data.insight);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal terhubung ke AI. Pastikan GEMINI_API_KEY sudah benar.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-ai-insight');
    window.print();
    document.body.classList.remove('printing-ai-insight');
  };

  // Custom markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={i} className="h-4" />;

      // Header H1
      if (cleanLine.startsWith('# ')) {
        const heading = cleanLine.replace('# ', '').replace(/\*\*/g, '');
        return (
          <h1 key={i} className="text-xl md:text-2xl font-black text-slate-800 border-b-2 border-slate-200 pb-2 mb-6 mt-8 uppercase tracking-wide">
            {heading}
          </h1>
        );
      }

      // Header H3/H2
      if (cleanLine.startsWith('### ')) {
        const heading = cleanLine.replace('### ', '').replace(/\*\*/g, '');
        return (
          <h2 key={i} className="text-xs md:text-sm font-extrabold text-[#6D5EF5] mb-3 mt-6 uppercase tracking-wider flex items-center gap-1.5 border-l-4 border-[#6D5EF5] pl-2.5">
            {heading}
          </h2>
        );
      }

      // Bullet List
      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
        const content = cleanLine.substring(2);
        return (
          <div key={i} className="flex items-start gap-2 mb-2 text-xs md:text-sm text-slate-700 leading-relaxed pl-4">
            <span className="text-[#6D5EF5] mt-1 shrink-0">•</span>
            <span className="flex-1">{parseBoldText(content)}</span>
          </div>
        );
      }

      // Regular Paragraph
      return (
        <p key={i} className="text-xs md:text-sm text-slate-700 mb-3.5 leading-relaxed">
          {parseBoldText(cleanLine)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const filteredMaps = maps.filter(m => m.level === level);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F5F3FF]/40 custom-scrollbar h-full w-full">
      {/* no-print container for headers and configuration */}
      <div className="max-w-4xl mx-auto no-print">
        {/* Breadcrumb / Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500/20" /> AI Insight FSVA
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Analisis otomatis ketahanan pangan berbasis kecerdasan buatan Gemini AI.
            </p>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl border border-[rgba(109,94,245,0.12)] p-4 md:p-6 shadow-sm mb-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Tingkat Wilayah
              </label>
              <div className="flex bg-[#F5F3FF] p-1 rounded-xl border border-[#E8E4FF]">
                <button
                  onClick={() => setLevel('kab_kota')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    level === 'kab_kota'
                      ? 'bg-[#6D5EF5] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kabupaten/Kota
                </button>
                <button
                  onClick={() => setLevel('provinsi')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    level === 'provinsi'
                      ? 'bg-[#6D5EF5] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Provinsi
                </button>
              </div>
            </div>

            {/* Map Selector */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Pilih Peta & Tahun Data
              </label>
              {loadingMaps ? (
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ) : filteredMaps.length > 0 ? (
                <select
                  value={selectedMap ? JSON.stringify(selectedMap) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedMap(JSON.parse(e.target.value));
                    }
                  }}
                  className="w-full h-[40px] text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3 focus:ring-1 focus:ring-[#6D5EF5] focus:outline-none text-slate-800 font-extrabold cursor-pointer"
                >
                  {filteredMaps.map((m) => (
                    <option key={`${m.level}:${m.nama_kabupaten}:${m.tahun}`} value={JSON.stringify(m)}>
                      {m.nama_kabupaten.toUpperCase()} (Tahun {m.tahun})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="h-10 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center px-3 text-xs font-semibold">
                  Belum ada data geospasial yang diunggah untuk tingkat ini.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedMap}
              className="bg-[#6D5EF5] hover:bg-[#5b4ddb] text-white px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  Memproses Laporan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  Mulai Analisis AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Errors Display */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-700 shadow-xs mb-6 animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs md:text-sm">Gagal Menghasilkan Analisis</h4>
              <p className="text-xs mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State / Shimmer */}
        {generating && (
          <div className="bg-white rounded-2xl border border-[rgba(109,94,245,0.12)] p-6 shadow-sm mb-6 text-center animate-in fade-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F3FF]">
                <Sparkles className="w-8 h-8 text-[#6D5EF5] animate-pulse" />
                <div className="absolute inset-0 border-2 border-[#6D5EF5] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 mb-2">Gemini AI sedang Menganalisis...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Kami sedang memproses data tabular indikator FSVA di database dan merumuskan naskah ringkasan.
            </p>
            
            {/* Live Progress Indicators */}
            <div className="max-w-md mx-auto text-left border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
              {loadingPhases.map((phase, idx) => {
                const isCurrent = loadingPhase === idx;
                const isDone = loadingPhase > idx;
                return (
                  <div key={idx} className="flex items-center gap-2.5 transition-all duration-300">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-[#6D5EF5] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                    )}
                    <span className={`text-[11px] font-semibold leading-none ${
                      isDone ? 'text-slate-400 line-through' : isCurrent ? 'text-[#6D5EF5] font-bold' : 'text-slate-400'
                    }`}>
                      {phase}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Generated Report Display */}
      {insight && !generating && (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Action Row (no-print) */}
          <div className="flex justify-between items-center bg-white rounded-xl border border-slate-100 p-3 shadow-xs no-print">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pl-2">
              <FileText className="w-4 h-4 text-[#6D5EF5]" /> Laporan Berhasil Dibuat
            </span>
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Laporan PDF
            </button>
          </div>

          {/* Actual Printable Report Card */}
          <div className="print-report-container bg-white rounded-2xl border border-[rgba(109,94,245,0.12)] p-6 md:p-10 shadow-sm text-black">
            <div className="print-header hidden printing-show items-center gap-3 border-b-2 border-slate-950 pb-4 mb-6">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-lg">
                F
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight leading-none">FSVA INDONESIA</span>
                <span className="text-[8px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Platform Pemetaan & Analisis AI</span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              {renderMarkdown(insight)}
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State Card */}
      {!insight && !generating && !error && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[rgba(109,94,245,0.12)] p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#F5F3FF] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#6D5EF5]" />
          </div>
          <h2 className="text-lg font-black text-slate-800 mb-2">Siap untuk Memulai Analisis AI?</h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Pilih peta daerah dan klik tombol "Mulai Analisis AI" di atas. Gemini AI akan menganalisis data indikator untuk menyusun ringkasan serta rekomendasi aksi secara dinamis.
          </p>
          {selectedMap && (
            <button
              onClick={handleGenerate}
              className="bg-[#6D5EF5]/10 hover:bg-[#6D5EF5]/20 text-[#6D5EF5] px-5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              Analisis {selectedMap.nama_kabupaten.toUpperCase()} Sekarang <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
