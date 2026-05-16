'use client';
import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Map, Loader2 } from 'lucide-react';

export default function UploadPanel() {
  const [loading, setLoading] = useState(false);
  const [geomResult, setGeomResult] = useState<any>(null);
  const [dataResult, setDataResult] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);

  const handleUploadGeometry = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
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
    formData.append('tahun', '2024'); // default for now
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Section 1: KML/KMZ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Map className="text-blue-500" />
          1. Upload Batas Desa (KML/KMZ)
        </h2>
        <p className="text-sm text-gray-500 mb-4">Upload file .kml atau .kmz yang berisi polygon desa/kelurahan. Pastikan terdapat properti kode_bps.</p>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-50 transition flex flex-col items-center justify-center text-center cursor-pointer">
          <input type="file" accept=".kml,.kmz" onChange={handleUploadGeometry} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">Klik atau Drag & Drop KML/KMZ kesini</span>
        </div>
        {geomResult && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
            {geomResult.success ? `Berhasil upload ${geomResult.features} polygon desa.` : `Gagal: ${geomResult.error}`}
            {geomResult.errors && geomResult.errors.length > 0 && (
              <div className="mt-2 text-red-600 font-semibold text-xs border-t border-green-200 pt-2">
                Pesan Error Map ({geomResult.errors.length}):
                <ul className="list-disc pl-4 mt-1 font-normal max-h-32 overflow-y-auto custom-scrollbar">
                  {geomResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Data XLSX */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <FileSpreadsheet className="text-emerald-500" />
          2. Upload Data Indikator (XLSX)
        </h2>
        <div className="mb-4">
          <a href="/api/template" className="text-sm text-blue-600 hover:underline">Download Template XLSX</a>
        </div>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-50 transition flex flex-col items-center justify-center text-center cursor-pointer">
          <input type="file" accept=".xlsx" onChange={handleUploadData} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">Klik atau Drag & Drop XLSX kesini</span>
        </div>
        {dataResult && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
            {dataResult.success ? `Berhasil menyimpan data untuk ${dataResult.inserted} desa.` : `Gagal: ${dataResult.error}`}
            {dataResult.errors && dataResult.errors.length > 0 && (
              <div className="mt-2 text-red-600 font-semibold text-xs border-t border-green-200 pt-2">
                Pesan Error ({dataResult.errors.length}):
                <ul className="list-disc pl-4 mt-1 font-normal max-h-32 overflow-y-auto custom-scrollbar">
                  {dataResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 3: Hitung FSVA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
        <h2 className="text-xl font-bold mb-2">3. Kalkulasi FSVA</h2>
        <p className="text-sm text-gray-500 mb-6">Jalankan pipeline algoritma FSVA berdasarkan juknis Bapanas untuk data yang sudah diupload.</p>
        <button 
          onClick={handleCalculate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          Hitung FSVA Sekarang
        </button>
        
        {calcResult && (
          <div className="mt-6 w-full text-left p-4 bg-gray-50 rounded border">
            {calcResult.success ? (
              <>
                <h3 className="font-bold text-green-700 mb-2">Kalkulasi Selesai ({calcResult.processed} desa)</h3>
                
                {calcResult.errors && calcResult.errors.length > 0 && (
                  <div className="mb-4 text-red-600 font-semibold text-xs border border-red-200 bg-red-50 p-2 rounded">
                    Pesan Error ({calcResult.errors.length}):
                    <ul className="list-disc pl-4 mt-1 font-normal max-h-32 overflow-y-auto custom-scrollbar">
                      {calcResult.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-2 text-center mt-4">
                  {[1,2,3,4,5,6].map(p => (
                    <div key={p} className="bg-white p-2 rounded shadow-sm">
                      <div className="text-xs text-gray-500">Prio {p}</div>
                      <div className="text-lg font-bold">{calcResult.summary?.[p] || 0}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-red-600">Error: {calcResult.error}</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
