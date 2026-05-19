'use client';
import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, MapPin, Loader2, ArrowRight, ArrowDown, Play, Download, PieChart, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadPanel() {
  const [loading, setLoading] = useState(false);
  const [kabupaten, setKabupaten] = useState('');
  const [geomResult, setGeomResult] = useState<any>(null);
  const [dataResult, setDataResult] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);

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
    formData.append('tahun', '2024');
    try {
      const res = await fetch('/api/upload-data', { method: 'POST', body: formData });
      const data = await res.json();
      setDataResult(data);
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
        body: JSON.stringify({ tahun: 2024 }) 
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
      
      <div className="mb-10 max-w-md mx-auto bg-white p-5 rounded-2xl shadow-md border border-gray-100 relative z-20">
        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Peta / Kabupaten</label>
        <input 
          type="text" 
          value={kabupaten}
          onChange={(e) => setKabupaten(e.target.value)}
          placeholder="Contoh: Kota Cilegon"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 font-medium"
        />
        {!kabupaten && (
           <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
             <AlertCircle className="w-3.5 h-3.5" /> Wajib diisi sebelum upload.
           </p>
        )}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 transition-opacity duration-300 ${!kabupaten ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Card 1: KML/KMZ */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-50 p-8 pt-12 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 bg-green-600 text-white font-black px-5 py-2.5 rounded-tl-3xl rounded-br-2xl text-sm shadow-md">
            01
          </div>
          
          <div className="w-28 h-28 mb-8 relative">
            <div className="absolute inset-0 bg-green-100 rounded-2xl rotate-6 scale-90 transition-transform group-hover:rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-lg rounded-2xl border border-green-100 flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <MapPin className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border border-green-50 z-20 animate-bounce-slow">
              <UploadCloud className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-xl mb-3 leading-tight">Upload Batas Desa <br/><span className="text-base font-bold text-slate-500">(ZIP/KML/KMZ)</span></h3>
          <p className="text-slate-500 text-sm mb-8 px-2 flex-grow leading-relaxed">
            Upload <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.zip</code> (berisi file SHP, DBF, SHX, PRJ) atau <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.kml/.kmz</code>. Pastikan terdapat atribut <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">kode_bps</code> atau nama desa.
          </p>

          <div className="w-full relative">
            <input type="file" accept=".kml,.kmz,.zip" onChange={handleUploadGeometry} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih File (ZIP/KML/KMZ)" />
            <div className="w-full py-3.5 px-4 rounded-xl border-2 border-green-600 text-green-700 font-bold flex items-center justify-center gap-2 group-hover:bg-green-50 transition-colors">
              <UploadCloud className="w-5 h-5" /> Upload File Batas
            </div>
          </div>

          {/* Feedback */}
          {geomResult && (
            <div className="absolute top-[105%] left-0 w-full p-3 bg-white rounded-xl shadow-lg border border-slate-100 text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-2">
                {geomResult.success ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${geomResult.success ? 'text-green-700' : 'text-red-600'}`}>
                    {geomResult.success ? `Berhasil upload ${geomResult.features} desa.` : 'Gagal Upload'}
                  </p>
                  {geomResult.errors?.length > 0 && (
                    <ul className="text-xs text-red-600 list-disc pl-4 mt-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {geomResult.errors.map((e:string, i:number) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Arrow 1 -> 2 */}
        <div className="hidden lg:flex absolute top-1/2 left-[33.33%] -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg border border-slate-100 text-slate-400">
           <ArrowRight className="w-6 h-6" />
        </div>
        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center my-[-16px] relative z-10">
          <div className="w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: XLSX */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-50 p-8 pt-12 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 bg-amber-400 text-white font-black px-5 py-2.5 rounded-tl-3xl rounded-br-2xl text-sm shadow-md">
            02
          </div>
          
          <div className="w-28 h-28 mb-8 relative">
            <div className="absolute inset-0 bg-amber-100 rounded-2xl -rotate-6 scale-90 transition-transform group-hover:-rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-lg rounded-2xl border border-amber-100 flex items-center justify-center rotate-3 z-10 transition-transform group-hover:rotate-0">
              <FileSpreadsheet className="w-12 h-12 text-amber-500" />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border border-amber-50 z-20">
              <UploadCloud className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-xl mb-3 leading-tight">Upload Data Indikator <br/><span className="text-base font-bold text-slate-500">(XLSX)</span></h3>
          <p className="text-slate-500 text-sm mb-6 px-2 flex-grow leading-relaxed">
            Download template XLSX, isi data indikator sesuai format, lalu upload file untuk memproses hasil akhir.
          </p>

          <div className="w-full relative mb-4">
            <input type="file" accept=".xlsx" onChange={handleUploadData} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih XLSX" />
            <div className="w-full py-3.5 px-4 rounded-xl border-2 border-amber-400 text-amber-600 font-bold flex items-center justify-center gap-2 group-hover:bg-amber-50 transition-colors">
              <UploadCloud className="w-5 h-5" /> Upload XLSX
            </div>
          </div>
          <a href="/api/template" className="text-blue-600 text-[13px] font-bold hover:underline flex items-center gap-1.5 transition-colors hover:text-blue-700">
            <Download className="w-4 h-4" /> Download Template XLSX
          </a>

          {/* Feedback */}
          {dataResult && (
            <div className="absolute top-[105%] left-0 w-full p-3 bg-white rounded-xl shadow-lg border border-slate-100 text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-2">
                {dataResult.success ? <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${dataResult.success ? 'text-amber-600' : 'text-red-600'}`}>
                    {dataResult.success ? `Berhasil menyimpan data ${dataResult.inserted} desa.` : 'Gagal Upload'}
                  </p>
                  {dataResult.errors?.length > 0 && (
                    <ul className="text-xs text-red-600 list-disc pl-4 mt-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {dataResult.errors.map((e:string, i:number) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Arrow 2 -> 3 */}
        <div className="hidden lg:flex absolute top-1/2 left-[66.66%] -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg border border-slate-100 text-slate-400">
           <ArrowRight className="w-6 h-6" />
        </div>
        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center my-[-16px] relative z-10">
          <div className="w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Calculate */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-teal-50 p-8 pt-12 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 bg-teal-600 text-white font-black px-5 py-2.5 rounded-tl-3xl rounded-br-2xl text-sm shadow-md">
            03
          </div>
          
          <div className="w-28 h-28 mb-8 relative">
            <div className="absolute inset-0 bg-teal-100 rounded-2xl rotate-3 scale-90 transition-transform group-hover:-rotate-6"></div>
            <div className="absolute inset-0 bg-white shadow-lg rounded-2xl border border-teal-100 flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <PieChart className="w-12 h-12 text-teal-600" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-full shadow-lg border border-teal-50 z-20">
              <CheckCircle2 className="w-6 h-6 text-teal-500" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-xl mb-3 leading-tight">Kalkulasi / Analisis <br/><span className="text-base font-bold text-slate-500">FSVA</span></h3>
          <p className="text-slate-500 text-sm mb-8 px-2 flex-grow leading-relaxed">
            Jalankan pipeline algoritma FSVA berdasarkan juknis Bapanas untuk data yang sudah diupload.
          </p>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-4 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-md disabled:cursor-not-allowed group-hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            Hitung FSVA Sekarang
          </button>

          {/* Feedback */}
          {calcResult && (
            <div className="absolute top-[105%] left-0 w-full p-4 bg-white rounded-xl shadow-lg border border-slate-100 text-left z-30 animate-in fade-in slide-in-from-top-4">
              {calcResult.success ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-teal-700">Kalkulasi Selesai <span className="text-sm font-medium text-teal-600/70">({calcResult.processed} desa)</span></h4>
                  </div>
                  
                  {calcResult.errors?.length > 0 && (
                    <div className="mb-3 text-red-600 text-xs bg-red-50 p-2 rounded border border-red-100">
                      Ada {calcResult.errors.length} error kalkulasi (Cek Console).
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(p => (
                      <div key={p} className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Prio {p}</div>
                        <div className="text-sm font-black text-slate-800">{calcResult.summary?.[p] || 0}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-600">Gagal: {calcResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
