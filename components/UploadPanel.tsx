'use client';
import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, MapPin, Loader2, ArrowRight, ArrowDown, Play, Download, PieChart, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadPanel() {
  const [loading, setLoading] = useState(false);
  const [kabupaten, setKabupaten] = useState('');
  const [geomResult, setGeomResult] = useState<any>(null);
  const [dataResult, setDataResult] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [uploadedYear, setUploadedYear] = useState<number | null>(null);

  const handleUploadGeometry = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('kabupaten', kabupaten);
    try {
      const res = await fetch('/api/upload-geometry', { method: 'POST', body: formData });
      const data = await res.json();
      setGeomResult(data);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUploadData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('tahun', '2025'); // default fallback
    formData.append('kabupaten', kabupaten);
    try {
      const res = await fetch('/api/upload-data', { method: 'POST', body: formData });
      const data = await res.json();
      setDataResult(data);
      if (data.success && data.tahun) {
        setUploadedYear(data.tahun);
      }
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tahun: uploadedYear || 2025 }) 
      });
      const data = await res.json();
      setCalcResult(data);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      
      <div className="mb-10 max-w-md mx-auto glass-card p-5 rounded-2xl relative z-20">
        <label className="block text-sm font-bold text-[#1E1B4B] mb-2">Nama Peta / Kabupaten</label>
        <input 
          type="text" 
          value={kabupaten}
          onChange={(e) => setKabupaten(e.target.value)}
          placeholder="Contoh: Kota Cilegon"
          className="w-full px-4 py-3 border border-[rgba(109,94,245,0.2)] bg-white/60 rounded-xl focus:ring-[#6D5EF5] focus:border-[#6D5EF5] font-medium transition-all"
        />
        {!kabupaten && (
           <p className="text-xs text-[#7C3AED] font-semibold mt-2 flex items-center gap-1">
             <AlertCircle className="w-3.5 h-3.5" /> Wajib diisi sebelum upload.
           </p>
        )}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${!kabupaten ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Card 1: KML/KMZ */}
        <div className="relative rounded-3xl p-5.5 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#F5F3FF]/80 border border-[#D5CFFF] shadow-[0_8px_25px_rgba(109,94,245,0.05)]">
          <div className="absolute top-0 left-0 bg-[#6D5EF5] text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[10px] shadow-sm">
            01
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-[#E8E4FF] rounded-2xl rotate-6 scale-90 transition-transform group-hover:rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-[#D5CFFF] flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <MapPin className="w-8 h-8 text-[#6D5EF5]" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow border border-[#E8E4FF] z-20 animate-bounce-slow">
              <UploadCloud className="w-4 h-4 text-[#8B5CF6]" />
            </div>
          </div>

          <h3 className="font-extrabold text-[#1E1B4B] text-base mb-2 leading-tight">Upload Batas Desa <br/><span className="text-xs font-bold text-slate-500">(ZIP/KML/KMZ)</span></h3>
          <p className="text-slate-500 text-[11px] mb-5 px-1 flex-grow leading-relaxed">
            Upload <code className="bg-[#EDE9FE] px-1 py-0.5 rounded text-[#7C3AED] text-[10px]">.zip</code> (berisi file SHP, DBF, SHX, PRJ) atau <code className="bg-[#EDE9FE] px-1 py-0.5 rounded text-[#7C3AED] text-[10px]">.kml/.kmz</code>. Pastikan terdapat atribut <code className="bg-[#EDE9FE] px-1 py-0.5 rounded text-[#7C3AED] text-[10px]">kode_bps</code> atau nama desa.
          </p>

          <div className="w-full relative">
            <input type="file" accept=".kml,.kmz,.zip" onChange={handleUploadGeometry} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih File (ZIP/KML/KMZ)" />
            <div className="w-full py-2.5 px-3 rounded-xl btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-[#6D5EF5] border-[#6D5EF5]/30 hover:border-[#6D5EF5]">
              <UploadCloud className="w-4 h-4" /> Upload File Batas
            </div>
          </div>

          {/* Feedback */}
          {geomResult && (
            <div className="absolute top-[105%] left-0 w-full p-2.5 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-1.5">
                {geomResult.success ? <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-xs font-bold ${geomResult.success ? 'text-[#14B8A6]' : 'text-red-600'}`}>
                    {geomResult.success ? `Berhasil upload ${geomResult.features} desa.` : 'Gagal Upload'}
                  </p>
                  {geomResult.errors?.length > 0 && (
                    <ul className="text-[10px] text-red-600 list-disc pl-3 mt-0.5 max-h-20 overflow-y-auto custom-scrollbar">
                      {geomResult.errors.map((e:string, i:number) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Arrow 1 -> 2 */}
        <div className="hidden lg:flex absolute top-1/2 left-[33.33%] -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center glass-card rounded-full text-[#6D5EF5]">
           <ArrowRight className="w-4 h-4" />
        </div>
        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center my-[-12px] relative z-10">
          <div className="w-8 h-8 glass-card rounded-full flex items-center justify-center text-[#6D5EF5]">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: XLSX */}
        <div className="relative rounded-3xl p-5.5 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#E0F2FE]/80 border border-[#B9E0FF] shadow-[0_8px_25px_rgba(2,132,199,0.05)]">
          <div className="absolute top-0 left-0 bg-[#0284C7] text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[10px] shadow-sm">
            02
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-[#E0F2FE] rounded-2xl -rotate-6 scale-90 transition-transform group-hover:-rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-[#B9E0FF] flex items-center justify-center rotate-3 z-10 transition-transform group-hover:rotate-0">
              <FileSpreadsheet className="w-8 h-8 text-[#0284C7]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow border border-[#E0F2FE] z-20">
              <UploadCloud className="w-4 h-4 text-[#0284C7]" />
            </div>
          </div>

          <h3 className="font-extrabold text-[#1E1B4B] text-base mb-2 leading-tight">Upload Data Indikator <br/><span className="text-xs font-bold text-slate-500">(XLSX)</span></h3>
          <p className="text-slate-500 text-[11px] mb-4 px-1 flex-grow leading-relaxed">
            Download template XLSX, isi data indikator sesuai format, lalu upload file untuk memproses hasil akhir.
          </p>

          <div className="w-full relative mb-3">
            <input type="file" accept=".xlsx" onChange={handleUploadData} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih XLSX" />
            <div className="w-full py-2.5 px-3 rounded-xl btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-[#0284C7] border-[#0284C7]/30 hover:border-[#0284C7]">
              <UploadCloud className="w-4 h-4" /> Upload XLSX
            </div>
          </div>
          <a href="/api/template" className="text-[#0284C7] text-[11px] font-bold hover:underline flex items-center gap-1 transition-colors hover:text-[#0369A1]">
            <Download className="w-3.5 h-3.5" /> Download Template XLSX
          </a>

          {/* Feedback */}
          {dataResult && (
            <div className="absolute top-[105%] left-0 w-full p-2.5 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-1.5">
                {dataResult.success ? <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-xs font-bold ${dataResult.success ? 'text-[#14B8A6]' : 'text-red-600'}`}>
                    {dataResult.success ? `Berhasil menyimpan data ${dataResult.inserted} desa (Tahun: ${dataResult.tahun || uploadedYear}).` : 'Gagal Upload'}
                  </p>
                  {dataResult.errors?.length > 0 && (
                    <ul className="text-[10px] text-red-600 list-disc pl-3 mt-0.5 max-h-20 overflow-y-auto custom-scrollbar">
                      {dataResult.errors.map((e:string, i:number) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Arrow 2 -> 3 */}
        <div className="hidden lg:flex absolute top-1/2 left-[66.66%] -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center glass-card rounded-full text-[#6D5EF5]">
           <ArrowRight className="w-4 h-4" />
        </div>
        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center my-[-12px] relative z-10">
          <div className="w-8 h-8 glass-card rounded-full flex items-center justify-center text-[#6D5EF5]">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Calculate */}
        <div className="relative rounded-3xl p-5.5 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#FFF0F5]/80 border border-[#FFCCD9] shadow-[0_8px_25px_rgba(219,39,119,0.05)]">
          <div className="absolute top-0 left-0 bg-[#DB2777] text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[10px] shadow-sm">
            03
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-[#FFF0F5] rounded-2xl rotate-3 scale-90 transition-transform group-hover:-rotate-6"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-[#FFCCD9] flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <PieChart className="w-8 h-8 text-[#DB2777]" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white p-1.5 rounded-full shadow border border-[#FFF0F5] z-20">
              <CheckCircle2 className="w-4 h-4 text-[#DB2777]" />
            </div>
          </div>

          <h3 className="font-extrabold text-[#1E1B4B] text-base mb-2 leading-tight">Kalkulasi / Analisis <br/><span className="text-xs font-bold text-slate-500">FSVA</span></h3>
          <p className="text-slate-500 text-[11px] mb-5 px-1 flex-grow leading-relaxed">
            Jalankan pipeline algoritma FSVA berdasarkan juknis Bapanas untuk data tahun {uploadedYear || 'kalkulasi'}.
          </p>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-all text-white bg-gradient-to-r from-[#DB2777] to-[#EC4899] hover:from-[#C2185B] hover:to-[#DB2777] hover:scale-[1.02] shadow-[0_4px_10px_rgba(219,39,119,0.1)] hover:shadow-[0_6px_15px_rgba(219,39,119,0.2)]"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            Hitung FSVA Sekarang
          </button>

          {/* Feedback */}
          {calcResult && (
            <div className="absolute top-[105%] left-0 w-full p-3 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              {calcResult.success ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
                      <h4 className="font-bold text-[#14B8A6] text-xs">Kalkulasi Selesai <span className="text-[10px] font-medium text-[#14B8A6]/70">({calcResult.processed} desa)</span></h4>
                    </div>
                    
                    <Link 
                      href={`/map?kabupaten=${encodeURIComponent(kabupaten)}`}
                      className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black shadow-[0_2px_5px_rgba(219,39,119,0.2)] hover:shadow-[0_4px_10px_rgba(219,39,119,0.3)] transition-all flex items-center gap-1 hover:scale-105 active:scale-95 shrink-0"
                    >
                      LIHAT PETA <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  
                  {calcResult.errors?.length > 0 && (
                    <div className="mb-2 text-red-600 text-[10px] bg-red-50 p-1.5 rounded border border-red-100">
                      Ada {calcResult.errors.length} error kalkulasi (Cek Console).
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5">
                    {[1,2,3,4,5,6].map(p => (
                      <div key={p} className="bg-white/50 border border-[rgba(109,94,245,0.1)] p-1.5 rounded-lg text-center">
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Prio {p}</div>
                        <div className="text-xs font-black text-[#1E1B4B]">{calcResult.summary?.[p] || 0}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-600">Gagal: {calcResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
