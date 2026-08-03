'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, FileSpreadsheet, MapPin, Loader2, 
  ArrowRight, ArrowDown, Play, Download, PieChart, 
  CheckCircle2, AlertCircle, ChevronDown, Search
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPanel() {
  const [loading, setLoading] = useState(false);
  const [geomResult, setGeomResult] = useState<any>(null);
  const [dataResult, setDataResult] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [uploadedYear, setUploadedYear] = useState<number | null>(null);

  const [checkResult, setCheckResult] = useState<{ exists: boolean; isOwner?: boolean; hasOwner?: boolean } | null>(null);
  const [overwriteMode, setOverwriteMode] = useState<'overwrite' | 'version_v2' | null>(null);

  // Administrative Area selection states
  const [wilayahData, setWilayahData] = useState<any[]>([]);
  const [level, setLevel] = useState<'kab_kota' | 'provinsi'>('kab_kota');
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('');
  const [provQuery, setProvQuery] = useState('');
  const [kabQuery, setKabQuery] = useState('');
  const [showProvDropdown, setShowProvDropdown] = useState(false);
  const [showKabDropdown, setShowKabDropdown] = useState(false);

  const provRef = useRef<HTMLDivElement>(null);
  const kabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch wilayah data
    fetch('/api/wilayah')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setWilayahData(data.data);
          // Preselect first region so page is active immediately from frame 1
          if (!selectedKabupaten && !selectedProvinsi) {
            const firstProv = data.data[0];
            const firstKab = firstProv?.kabupaten?.[0] || 'KAB PEGUNUNGAN BINTANG';
            setSelectedKabupaten(firstKab);
            setKabQuery(firstKab);
            setSelectedProvinsi(firstProv.provinsi);
            setProvQuery(firstProv.provinsi);
          }
        }
      })
      .catch(console.error);

    // Click outside listener to close dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      if (provRef.current && !provRef.current.contains(e.target as Node)) {
        setShowProvDropdown(false);
      }
      if (kabRef.current && !kabRef.current.contains(e.target as Node)) {
        setShowKabDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeKabupaten = level === 'provinsi' ? selectedProvinsi : selectedKabupaten;

  useEffect(() => {
    if (!activeKabupaten) {
      setCheckResult(null);
      setOverwriteMode(null);
      return;
    }

    fetch(`/api/maps/check?kabupaten=${encodeURIComponent(activeKabupaten)}&level=${level}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setCheckResult(data);
          setOverwriteMode(data.isOwner ? 'overwrite' : 'version_v2');
        } else {
          setCheckResult(null);
          setOverwriteMode(null);
        }
      })
      .catch(err => {
        console.error(err);
        setCheckResult(null);
        setOverwriteMode(null);
      });
  }, [activeKabupaten, level]);

  const allKabupaten = wilayahData.reduce((acc: string[], p: any) => {
    return [...acc, ...(p.kabupaten || [])];
  }, []).sort();

  const filteredProvinsi = (provQuery === selectedProvinsi || !provQuery)
    ? wilayahData
    : wilayahData.filter(p => p.provinsi.toLowerCase().includes(provQuery.toLowerCase()));

  const filteredKabupaten = (kabQuery === selectedKabupaten || !kabQuery)
    ? allKabupaten
    : allKabupaten.filter((k: string) => k.toLowerCase().includes(kabQuery.toLowerCase()));

  const targetMapName = checkResult?.exists && overwriteMode === 'version_v2'
    ? `${activeKabupaten} ${uploadedYear || 2025} v.2`
    : activeKabupaten;

  const handleUploadGeometry = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!targetMapName) {
      alert('Silakan pilih Kabupaten/Kota atau Provinsi terlebih dahulu.');
      return;
    }
    setLoading(true);
    setGeomResult(null);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('kabupaten', targetMapName);
    formData.append('level', level);

    try {
      const res = await fetch('/api/upload-geometry', { method: 'POST', body: formData });
      const data = await res.json();
      setGeomResult(data);
    } catch(err: any) {
      console.error(err);
      setGeomResult({ success: false, error: err.message || 'Terjadi kesalahan koneksi saat mengunggah file.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFromPublic = async (fileName: string) => {
    if (!targetMapName) {
      alert('Silakan pilih Kabupaten/Kota atau Provinsi terlebih dahulu.');
      return;
    }
    setLoading(true);
    setGeomResult(null);
    try {
      const response = await fetch(`/${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error(`File ${fileName} tidak ditemukan di folder public.`);
      }
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'application/zip' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kabupaten', targetMapName);
      formData.append('level', level);

      const res = await fetch('/api/upload-geometry', { method: 'POST', body: formData });
      const data = await res.json();
      setGeomResult(data);
    } catch (err: any) {
      console.error(err);
      setGeomResult({ success: false, error: err.message || 'Gagal memproses file dari folder public.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!targetMapName) {
      alert('Silakan pilih Kabupaten/Kota atau Provinsi terlebih dahulu.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('tahun', '2025'); // default fallback
    formData.append('kabupaten', targetMapName);
    formData.append('level', level);

    try {
      const res = await fetch('/api/upload-data', { method: 'POST', body: formData });
      const data = await res.json();
      setDataResult(data);
      if (data.success && data.tahun) {
        setUploadedYear(data.tahun);
      }
    } catch(err: any) {
      console.error(err);
      setDataResult({ success: false, error: err.message || 'Terjadi kesalahan koneksi saat mengunggah file data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!targetMapName) {
      alert('Silakan pilih Kabupaten/Kota atau Provinsi terlebih dahulu.');
      return;
    }
    setLoading(true);
    setCalcResult(null);
    try {
      const res = await fetch('/api/calculate', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tahun: uploadedYear || 2025,
          kab_kota: targetMapName,
          level
        }) 
      });
      const data = await res.json();
      setCalcResult(data);
    } catch(err: any) {
      console.error(err);
      setCalcResult({ success: false, error: err.message || 'Terjadi kesalahan koneksi saat melakukan kalkulasi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      
      {/* Selection Control Panel */}
      <div className="mb-10 max-w-xl mx-auto glass-card bg-white/90 backdrop-blur-md p-6 rounded-3xl relative z-40 border border-emerald-100 shadow-md">
        <h2 className="text-center font-black text-slate-800 text-base md:text-lg mb-4">Pengaturan Level &amp; Wilayah Analisis</h2>
        
        {/* Toggle Level Peta */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setLevel('kab_kota');
              if (!selectedKabupaten && wilayahData.length > 0) {
                const firstKab = wilayahData[0]?.kabupaten?.[0] || 'KAB PEGUNUNGAN BINTANG';
                setSelectedKabupaten(firstKab);
                setKabQuery(firstKab);
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2 ${
              level === 'kab_kota'
                ? 'bg-[#046a38] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>KABUPATEN / KOTA</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLevel('provinsi');
              if (!selectedProvinsi && wilayahData.length > 0) {
                setSelectedProvinsi(wilayahData[0].provinsi);
                setProvQuery(wilayahData[0].provinsi);
              }
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2 ${
              level === 'provinsi'
                ? 'bg-[#046a38] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>PROVINSI</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Dropdown 1: Provinsi se-Indonesia (Autocomplete) - Only if level === 'provinsi' */}
          {level === 'provinsi' && (
            <div className="relative" ref={provRef}>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Provinsi</label>
              <div className="relative">
                <input
                  type="text"
                  value={provQuery}
                  onFocus={() => {
                    setShowProvDropdown(true);
                    setProvQuery('');
                  }}
                  onChange={(e) => {
                    setProvQuery(e.target.value);
                    setSelectedProvinsi('');
                    setShowProvDropdown(true);
                  }}
                  placeholder="Cari & Pilih Provinsi..."
                  className="w-full pl-10 pr-4 py-3 border border-[rgba(109,94,245,0.2)] bg-white/60 rounded-xl focus:ring-[#6D5EF5] focus:border-[#6D5EF5] font-extrabold text-sm text-[#1E1B4B] transition-all"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {showProvDropdown && filteredProvinsi.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-[100] custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  {filteredProvinsi.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedProvinsi(p.provinsi);
                        setProvQuery(p.provinsi);
                        setShowProvDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6D5EF5] border-b border-slate-50/50 transition-colors cursor-pointer"
                    >
                      {p.provinsi}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dropdown 2: Nama Kabupaten/Kota di dalam provinsi tersebut (Autocomplete) - Only if level === 'kab_kota' */}
          {level === 'kab_kota' && (
            <div className="relative" ref={kabRef}>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Kabupaten / Kota</label>
              <div className="relative">
                <input
                  type="text"
                  value={kabQuery}
                  onFocus={() => {
                    setShowKabDropdown(true);
                    setKabQuery('');
                  }}
                  onChange={(e) => {
                    setKabQuery(e.target.value);
                    setSelectedKabupaten('');
                    setShowKabDropdown(true);
                  }}
                  placeholder="Cari & Pilih Kabupaten/Kota..."
                  className="w-full pl-10 pr-4 py-3 border border-[rgba(109,94,245,0.2)] bg-white/60 rounded-xl focus:ring-[#6D5EF5] focus:border-[#6D5EF5] font-extrabold text-sm text-[#1E1B4B] transition-all"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {showKabDropdown && filteredKabupaten.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-[100] custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  {filteredKabupaten.map((k: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedKabupaten(k);
                        setKabQuery(k);
                        setShowKabDropdown(false);
                        
                        // Find parent province and set it automatically
                        const parent = wilayahData.find(p => p.kabupaten.includes(k));
                        if (parent) {
                          setSelectedProvinsi(parent.provinsi);
                          setProvQuery(parent.provinsi);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6D5EF5] border-b border-slate-50/50 transition-colors cursor-pointer"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {checkResult && checkResult.exists && activeKabupaten && (
          <div className="mt-6 p-5 rounded-2xl border bg-amber-50/50 border-amber-200/60 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
                  Peringatan Peta Sudah Ada
                </p>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Peta {level === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota'} <strong className="text-amber-900 font-extrabold">"{activeKabupaten}"</strong> sudah ada dan tersimpan sebelumnya {checkResult.isOwner ? 'oleh Anda' : 'oleh akun lain'}.
                </p>
                
                <div className="mt-4 space-y-2">
                  {/* Option 1: Overwrite (Disabled if not owner) */}
                  <label className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                    overwriteMode === 'overwrite'
                      ? 'bg-amber-100/50 border-amber-300 text-amber-900 shadow-xs'
                      : 'border-transparent text-amber-600 hover:bg-amber-100/20'
                  } ${!checkResult.isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="overwriteOption"
                      value="overwrite"
                      disabled={!checkResult.isOwner}
                      checked={overwriteMode === 'overwrite'}
                      onChange={() => setOverwriteMode('overwrite')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <span className="block font-extrabold">Timpa Peta & Data Lama</span>
                      <span className="block text-[10px] text-amber-600 font-medium">Gantikan geometri dan hasil analisis yang ada dengan unggahan baru ini.</span>
                    </div>
                  </label>

                  {/* Option 2: Version v.2 */}
                  <label className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                    overwriteMode === 'version_v2'
                      ? 'bg-amber-100/50 border-amber-300 text-amber-900 shadow-xs'
                      : 'border-transparent text-amber-600 hover:bg-amber-100/20'
                  }`}>
                    <input
                      type="radio"
                      name="overwriteOption"
                      value="version_v2"
                      checked={overwriteMode === 'version_v2'}
                      onChange={() => setOverwriteMode('version_v2')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <span className="block font-extrabold">Buat Peta Baru Versi 2</span>
                      <span className="block text-[10px] text-amber-600 font-medium">Simpan sebagai peta baru dengan nama <strong className="font-extrabold text-amber-800">"{activeKabupaten} {uploadedYear || 2025} v.2"</strong>.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Action Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100">
        
        {/* Card 1: KML/KMZ / Shapefile */}
        <div className="relative rounded-3xl p-6 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#f4faf6]/90 border border-emerald-200/80 shadow-xs">
          <div className="absolute top-0 left-0 bg-[#046a38] text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[11px] shadow-xs">
            01
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-emerald-100/80 rounded-2xl rotate-6 scale-90 transition-transform group-hover:rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-emerald-200 flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <MapPin className="w-8 h-8 text-[#046a38]" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow border border-emerald-100 z-20">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-base mb-2 leading-tight">
            {level === 'provinsi' ? 'Upload Batas Kecamatan' : 'Upload Batas Desa'} <br/>
            <span className="text-xs font-bold text-slate-500">(ZIP/KML/KMZ)</span>
          </h3>
          <p className="text-slate-600 text-[11px] mb-5 px-1 flex-grow leading-relaxed font-medium">
            Upload file <code className="bg-emerald-100/60 px-1 py-0.5 rounded text-[#046a38] font-mono text-[10px]">.zip</code> (SHP, DBF, SHX, PRJ) atau <code className="bg-emerald-100/60 px-1 py-0.5 rounded text-[#046a38] font-mono text-[10px]">.kml/.kmz</code>. Pastikan terdapat atribut <code className="bg-emerald-100/60 px-1 py-0.5 rounded text-[#046a38] font-mono text-[10px]">kode_bps</code>.
          </p>

          <div className="w-full relative">
            <input type="file" accept=".kml,.kmz,.zip" onChange={handleUploadGeometry} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih File (ZIP/KML/KMZ)" />
            <div className="w-full py-2.5 px-3 rounded-xl bg-white text-emerald-700 border border-emerald-500/30 hover:border-emerald-600 hover:bg-emerald-50 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs">
              <UploadCloud className="w-4 h-4" /> Upload File Batas
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleUploadFromPublic('BATAS KECAMATAN KOMPOSITCOBA.zip')}
            className="w-full mt-2 py-1.5 px-3 rounded-xl bg-emerald-100/70 hover:bg-emerald-200/90 text-emerald-900 text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all border border-emerald-300/60 cursor-pointer shadow-2xs"
            title="Proses langsung file BATAS KECAMATAN KOMPOSITCOBA.zip di folder public"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Proses File di Folder public (BATAS KECAMATAN KOMPOSITCOBA.zip)</span>
          </button>

          {/* Feedback */}
          {geomResult && (
            <div className="absolute top-[105%] left-0 w-full p-2.5 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-1.5">
                {geomResult.success ? <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-xs font-bold ${geomResult.success ? 'text-[#14B8A6]' : 'text-red-600'}`}>
                    {geomResult.success 
                      ? (geomResult.desaCount !== undefined || geomResult.kecCount !== undefined)
                        ? level === 'kab_kota'
                          ? `Berhasil mengunggah ${geomResult.desaCount || 0} wilayah desa/kelurahan (melewati ${geomResult.skippedKecCount || 0} wilayah kecamatan).`
                          : `Berhasil mengunggah ${geomResult.kecCount || 0} wilayah kecamatan (melewati ${geomResult.skippedDesaCount || 0} wilayah desa/kelurahan).`
                        : `Berhasil upload ${geomResult.features} wilayah.`
                      : `Gagal Upload: ${geomResult.error || 'Terjadi kesalahan'}`}
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
        <div className="relative rounded-3xl p-6 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#f0fdfa]/90 border border-teal-200/80 shadow-xs">
          <div className="absolute top-0 left-0 bg-teal-700 text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[11px] shadow-xs">
            02
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-teal-100/80 rounded-2xl -rotate-6 scale-90 transition-transform group-hover:-rotate-12"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-teal-200 flex items-center justify-center rotate-3 z-10 transition-transform group-hover:rotate-0">
              <FileSpreadsheet className="w-8 h-8 text-teal-700" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow border border-teal-100 z-20">
              <UploadCloud className="w-4 h-4 text-teal-600" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-base mb-2 leading-tight">Upload Data Indikator <br/><span className="text-xs font-bold text-slate-500">(XLSX)</span></h3>
          <p className="text-slate-600 text-[11px] mb-4 px-1 flex-grow leading-relaxed font-medium">
            {level === 'provinsi' 
              ? 'Download Form Validasi Data Provinsi, isi sheet 0.1 s.d. 0.6, lalu upload.' 
              : 'Download template XLSX kabupaten, isi data indikator desa, lalu upload.'}
          </p>

          <div className="w-full relative mb-3">
            <input type="file" accept=".xlsx" onChange={handleUploadData} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Pilih XLSX" />
            <div className="w-full py-2.5 px-3 rounded-xl bg-white text-teal-700 border border-teal-500/30 hover:border-teal-600 hover:bg-teal-50 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs">
              <UploadCloud className="w-4 h-4" /> Upload XLSX
            </div>
          </div>
          <a 
            href={`/api/template?level=${level}`} 
            className="text-teal-700 text-[11px] font-extrabold hover:underline flex items-center gap-1 transition-colors hover:text-teal-900"
          >
            <Download className="w-3.5 h-3.5" /> Download Template XLSX
          </a>

          {/* Feedback */}
          {dataResult && (
            <div className="absolute top-[105%] left-0 w-full p-2.5 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-1.5">
                {dataResult.success ? <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-xs font-bold ${dataResult.success ? 'text-[#14B8A6]' : 'text-red-600'}`}>
                    {dataResult.success ? `Berhasil menyimpan data ${dataResult.inserted} wilayah (Tahun: ${dataResult.tahun || uploadedYear}).` : `Gagal Upload: ${dataResult.error || 'Terjadi kesalahan'}`}
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
        <div className="relative rounded-3xl p-6 pt-8 flex flex-col items-center text-center group glass-card-hover bg-[#fefce8]/90 border border-amber-200/80 shadow-xs">
          <div className="absolute top-0 left-0 bg-[#046a38] text-white font-black px-4 py-1.5 rounded-tl-2xl rounded-br-xl text-[11px] shadow-xs">
            03
          </div>
          
          <div className="w-20 h-20 mb-5 relative">
            <div className="absolute inset-0 bg-amber-100/80 rounded-2xl rotate-3 scale-90 transition-transform group-hover:-rotate-6"></div>
            <div className="absolute inset-0 bg-white shadow-md rounded-xl border border-amber-200 flex items-center justify-center -rotate-3 z-10 transition-transform group-hover:rotate-0">
              <PieChart className="w-8 h-8 text-[#046a38]" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white p-1.5 rounded-full shadow border border-amber-100 z-20">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-base mb-2 leading-tight">Kalkulasi / Analisis <br/><span className="text-xs font-bold text-slate-500">FSVA</span></h3>
          <p className="text-slate-600 text-[11px] mb-5 px-1 flex-grow leading-relaxed font-medium">
            Jalankan pipeline algoritma FSVA berdasarkan juknis Bapanas tingkat {level === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota'} untuk data tahun {uploadedYear || 'kalkulasi'}.
          </p>

          <button 
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-all text-white bg-[#046a38] hover:bg-[#034423] hover:scale-[1.01] shadow-md cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Hitung FSVA Sekarang</span>
          </button>

          {/* Feedback */}
          {calcResult && (
            <div className="absolute top-[105%] left-0 w-full p-3 glass-card rounded-xl text-left z-30 animate-in fade-in slide-in-from-top-4">
              {calcResult.success ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
                      <h4 className="font-bold text-[#14B8A6] text-xs">Kalkulasi Selesai <span className="text-[10px] font-medium text-[#14B8A6]/70">({calcResult.processed} wilayah)</span></h4>
                    </div>
                    
                    <Link 
                      href={`/map?kabupaten=${encodeURIComponent(activeKabupaten)}&level=${level}`}
                      className="text-[#6D5EF5] text-[10px] font-black uppercase hover:underline flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      Lihat Peta <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-6 gap-1 bg-slate-50/50 p-2 rounded-xl border border-slate-105/50 text-center font-bold">
                    {[1, 2, 3, 4, 5, 6].map((prio) => (
                      <div key={prio} className="flex flex-col">
                        <span className={`text-[8px] uppercase font-semibold leading-none mb-1 text-slate-400`}>P{prio}</span>
                        <span className={`text-xs font-black text-slate-800`}>{calcResult.summary?.[prio] || 0}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-600">Gagal Kalkulasi</p>
                    <p className="text-[10px] text-red-500 mt-0.5 leading-relaxed">{calcResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Absolute Loading Backdrop */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 border border-emerald-100 p-6 rounded-3xl shadow-2xl text-slate-800 flex flex-col items-center max-w-sm text-center font-extrabold text-sm gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#046a38] w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Sedang Memproses Data &amp; Geometri Wilayah...</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed">
                Estimasi waktu: <strong className="text-[#046a38] font-bold">~5 s.d. 15 detik</strong> (untuk hingga 1.000 batas desa/kelurahan). Mohon tunggu sejenak...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
