'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FileSpreadsheet, Archive, Download, CheckCircle2, 
  Loader2, Layers, AlertCircle, Building2, MapPin
} from 'lucide-react';

function DownloadFormV2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const levelParam = searchParams.get('level') === 'provinsi' ? 'provinsi' : 'kab_kota';
  
  const [level, setLevel] = useState<'kab_kota' | 'provinsi'>(levelParam);
  const [tahun, setTahun] = useState<string>('2026');
  const [kabupaten, setKabupaten] = useState<string>('');
  const [mapsList, setMapsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingForm, setDownloadingForm] = useState<string | null>(null);

  useEffect(() => {
    setLevel(levelParam);
  }, [levelParam]);

  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.mapDetails) {
          setMapsList(data.mapDetails);
          const filtered = data.mapDetails.filter((m: any) => m.level === level);
          if (filtered.length > 0) {
            setKabupaten(filtered[0].nama_kabupaten);
            setTahun(filtered[0].tahun || '2026');
          }
        }
      })
      .catch(console.error);
  }, [level]);

  const handleLevelChange = (newLevel: 'kab_kota' | 'provinsi') => {
    setLevel(newLevel);
    router.push(`/download-form-v2?level=${newLevel}`);
  };

  const handleDownload = async (formIndex: string) => {
    try {
      setDownloadingForm(formIndex);
      const query = new URLSearchParams({
        level,
        tahun,
        kabupaten,
        form: formIndex,
      });

      const res = await fetch(`/api/export-v2?${query.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunduh file form FSVA V2');
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let fileName = `Form_FSVA_V2_${level}_${formIndex}.xlsx`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setDownloadingForm(null);
    }
  };

  const filteredMaps = mapsList.filter((m: any) => m.level === level);

  const formsList = [
    {
      key: '0',
      title: level === 'provinsi' ? '0. Form Validasi Data FSVA Prov 2026 ver.2' : '0. Form Validasi Data FSVA Kabupaten Kota 2026 ver.2',
      badge: 'Form 0',
      description: 'Master validasi data ketersediaan, keterjangkauan, dan pemanfaatan pangan yang terisi otomatis.',
      icon: FileSpreadsheet,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      key: '1',
      title: level === 'provinsi' ? '1. Form Hitung NCPR FSVA Prov 2026 ver.2' : '1. Form Hitung NCPR FSVA Kabupaten Kota 2026 ver.2',
      badge: 'Form 1',
      description: 'Perhitungan Net Food Availability Ratio (NCPR) & produksi bersih 6 komoditas pangan pokok.',
      icon: FileSpreadsheet,
      color: 'from-blue-600 to-cyan-700',
    },
    {
      key: '2',
      title: level === 'provinsi' ? '2. Form Cut Off & Komposit Baseline FSVA Prov ver.2' : '2. Form Cut Off & Komposit Baseline FSVA KabKota ver.2',
      badge: 'Form 2',
      description: 'Penentuan Min-Max scaling, Z-score, pembobotan aspek, dan analisis komposit baseline.',
      icon: FileSpreadsheet,
      color: 'from-purple-600 to-indigo-700',
    },
    {
      key: '3',
      title: level === 'provinsi' ? '3. Form Layout Hasil Baru FSVA Prov 2026 Vers.2' : '3. Form Layout Hasil Baru FSVA KabKota 2026 Vers.2',
      badge: 'Form 3',
      description: 'Layout hasil akhir penyusunan FSVA, rangkuman prioritas individu, dan indikator komposit.',
      icon: FileSpreadsheet,
      color: 'from-amber-600 to-orange-700',
    },
    {
      key: 'template',
      title: level === 'provinsi' ? 'Template Hasil UPDATE FSVA Prov 2026 ke Peta' : 'Template Hasil UPDATE FSVA KabKota 2026 ke Peta',
      badge: 'Template Peta',
      description: 'Format standar spasial data hasil analisis FSVA untuk integrasi langsung ke GIS / SIM Pangan.',
      icon: FileSpreadsheet,
      color: 'from-rose-600 to-pink-700',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#072419] text-emerald-50 font-sans p-4 md:p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d4734] via-[#0f5c43] to-[#072d20] border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  Generator & Download Form FSVA V2
                </h1>
                <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-red-950/60 animate-pulse">
                  BETA
                </span>
              </div>
              <p className="text-sm md:text-base text-emerald-200/90 max-w-3xl leading-relaxed">
                Unduh 5 file master Excel Form Analisis 2026 Versi 2 yang <span className="text-white font-bold underline decoration-emerald-400">otomatis terisi lengkap</span> oleh sistem sesuai data peta pengguna. Formula, keamanan, dan struktur bawaan Excel tetap terjamin 100% utuh tanpa diubah.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <FileSpreadsheet className="w-80 h-80 text-emerald-300" />
            </div>
          </div>

          {/* Level Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-[#0a3829]/80 backdrop-blur-md rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLevelChange('kab_kota')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wider transition-all ${
                  level === 'kab_kota'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Form FSVA Kab / Kota V2</span>
              </button>
              
              <button
                onClick={() => handleLevelChange('provinsi')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wider transition-all ${
                  level === 'provinsi'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Form FSVA Prov V2</span>
              </button>
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#072419] px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-semibold uppercase">Tahun:</span>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="2026" className="bg-[#072419]">2026</option>
                  <option value="2025" className="bg-[#072419]">2025</option>
                  <option value="2024" className="bg-[#072419]">2024</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#072419] px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold uppercase">Peta:</span>
                <select
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                  className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="" className="bg-[#072419]">Semua Data Peta</option>
                  {filteredMaps.map((m: any, idx: number) => (
                    <option key={idx} value={m.nama_kabupaten} className="bg-[#072419]">
                      {m.nama_kabupaten} ({m.tahun})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Callout Card for Paket ZIP Download */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-900/60 via-emerald-800/40 to-teal-900/60 border-2 border-emerald-400/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-md">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black text-white">
                Download Paket Lengkap 5 Form FSVA V2 (File ZIP)
              </h2>
              <p className="text-xs md:text-sm text-emerald-200/80 max-w-2xl">
                Sistem akan secara otomatis menyuntikkan data ke Form 0, Form 1, Form 2, Form 3, dan Template Peta, lalu mengemas kelimanya ke dalam 1 file kompresi ZIP siap pakai.
              </p>
            </div>

            <button
              onClick={() => handleDownload('zip')}
              disabled={downloadingForm === 'zip'}
              className="w-full md:w-auto shrink-0 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 shadow-xl shadow-emerald-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-emerald-300/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingForm === 'zip' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mengisi Data & Memproses ZIP...</span>
                </>
              ) : (
                <>
                  <Archive className="w-5 h-5 text-amber-300" />
                  <span>DOWNLOAD PAKET 5 FORM (ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* Individual Forms Grid (5 Cards) */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download File Per Form Versi 2 ({level === 'provinsi' ? 'Tingkat Provinsi' : 'Tingkat Kab/Kota'})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {formsList.map((form) => {
                const IconComponent = form.icon;
                const isDownloading = downloadingForm === form.key;

                return (
                  <div
                    key={form.key}
                    className="flex flex-col justify-between rounded-xl bg-[#0a3829]/70 hover:bg-[#0a3829] border border-emerald-500/30 hover:border-emerald-400/60 p-5 transition-all duration-200 shadow-lg group hover:shadow-emerald-950/50"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${form.color}`}>
                          {form.badge}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Format: .XLSX</span>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {form.title}
                      </h4>

                      <p className="text-xs text-emerald-200/70 leading-relaxed">
                        {form.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-emerald-500/20">
                      <button
                        onClick={() => handleDownload(form.key)}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-emerald-100 bg-emerald-800/40 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            <span>Membuat File...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                            <span>Download {form.badge}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Assurance Footer Box */}
          <div className="rounded-xl bg-[#072419]/90 border border-emerald-500/20 p-5 flex items-start gap-4 text-xs text-emerald-300/80">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-relaxed">
                Seluruh file hasil generate diproses dengan mempertahankan struktur formula native Excel (`=IF`, `=SUM`, `=RANK`, Z-score min-max, dan VLOOKUP). Saat file dibuka di Microsoft Excel, kalkulasi otomatis akan berjalan secara penuh dan presisi sesuai standar Keputusan Sekretaris Utama BPN Nomor 20 & 21 Tahun 2026.
              </p>
            </div>
          </div>

        </div>
      </div>
  );
}

export default function DownloadFormV2Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#072419] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <DownloadFormV2Content />
    </Suspense>
  );
}
