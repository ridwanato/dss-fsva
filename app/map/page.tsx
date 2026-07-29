'use client';
import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import LegendPanel from '@/components/LegendPanel';
import InfoPanel from '@/components/InfoPanel';
import PrintLayout from '@/components/PrintLayout';
import { Download, Printer, Settings, X } from 'lucide-react';

import LayerPanel, { getLayersForLevel } from '@/components/LayerPanel';

  import { useSearchParams, useRouter } from 'next/navigation';
  import { Suspense } from 'react';
  
interface FontStyle {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
}

function FontToolbar({ 
  value, 
  onChange 
}: { 
  value: FontStyle; 
  onChange: (val: FontStyle) => void 
}) {
  const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS'];
  const fontSizes = [6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24];

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 border-b-0 p-2 rounded-t-xl text-xs z-10 relative">
      {/* Font Family Dropdown */}
      <select
        value={value.fontFamily}
        onChange={(e) => onChange({ ...value, fontFamily: e.target.value })}
        className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
      >
        {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* Font Size Dropdown */}
      <select
        value={value.fontSize}
        onChange={(e) => onChange({ ...value, fontSize: Number(e.target.value) })}
        className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
      >
        {fontSizes.map(s => <option key={s} value={s}>{s} pt</option>)}
      </select>

      <span className="w-px h-4 bg-slate-200 mx-1"></span>

      {/* Bold (B) Button */}
      <button
        type="button"
        onClick={() => onChange({ ...value, bold: !value.bold })}
        className={`w-6 h-6 rounded flex items-center justify-center font-black transition-colors ${
          value.bold ? 'bg-slate-200 text-slate-900 border border-slate-350' : 'text-slate-500 hover:bg-slate-100'
        }`}
        title="Tebal (Bold)"
      >
        B
      </button>

      {/* Italic (I) Button */}
      <button
        type="button"
        onClick={() => onChange({ ...value, italic: !value.italic })}
        className={`w-6 h-6 rounded flex items-center justify-center font-serif italic transition-colors ${
          value.italic ? 'bg-slate-200 text-slate-900 border border-slate-350' : 'text-slate-500 hover:bg-slate-100'
        }`}
        title="Miring (Italic)"
      >
        I
      </button>

      {/* Underline (U) Button */}
      <button
        type="button"
        onClick={() => onChange({ ...value, underline: !value.underline })}
        className={`w-6 h-6 rounded flex items-center justify-center underline transition-colors ${
          value.underline ? 'bg-slate-200 text-slate-900 border border-slate-350' : 'text-slate-500 hover:bg-slate-100'
        }`}
        title="Garis Bawah (Underline)"
      >
        U
      </button>

      <span className="w-px h-4 bg-slate-200 mx-1"></span>

      {/* Alignment Buttons */}
      {(['left', 'center', 'right', 'justify'] as const).map(align => (
        <button
          key={align}
          type="button"
          onClick={() => onChange({ ...value, align })}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold text-[10px] ${
            value.align === align ? 'bg-slate-200 text-slate-900 border border-slate-350' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title={`Rata ${align === 'left' ? 'Kiri' : align === 'center' ? 'Tengah' : align === 'right' ? 'Kanan' : 'Kiri Kanan'}`}
        >
          {align === 'left' ? 'L' : align === 'center' ? 'C' : align === 'right' ? 'R' : 'J'}
        </button>
      ))}
    </div>
  );
}

  const formatMapTitle = (name: string) => {
    if (!name) return 'PETA FSVA DAERAH';
    const upper = name.toUpperCase().trim();
    if (upper.startsWith('KOTA') || upper.startsWith('KABUPATEN')) {
      return `PETA FSVA ${upper}`;
    }
    if (upper.startsWith('KAB.')) {
      return `PETA FSVA KAB ${upper.replace('KAB.', '').trim()}`;
    }
    if (upper.startsWith('KAB ')) {
      return `PETA FSVA KAB ${upper.replace('KAB ', '').trim()}`;
    }
    return `PETA FSVA KAB/KOTA ${upper}`;
  };

  function MapPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const kabupaten = searchParams.get('kabupaten') || '';
    const level = searchParams.get('level') || 'kab_kota';
    
    const [geoData, setGeoData] = useState<any>(null);
    const [selectedPolygon, setSelectedPolygon] = useState<any>(null);
    const [activeLayer, setActiveLayer] = useState('prioritas');
    const [opacity, setOpacity] = useState(0);
    const [showLabels, setShowLabels] = useState(true);
    const [loading, setLoading] = useState(true);
    const [maps, setMaps] = useState<string[]>([]);
    const [mapDetails, setMapDetails] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState(2025);
    
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [mapImage, setMapImage] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showPrintGuide, setShowPrintGuide] = useState(true);
    const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [printConfig, setPrintConfig] = useState({
      logoPemda: '/logo-cilegon.png',
      logoBapanas: '/bapanas logo.png',
      govName: 'PEMERINTAH\n' + (kabupaten ? kabupaten.toUpperCase() : 'DAERAH'),
      title: `FSVA ${kabupaten ? kabupaten.toUpperCase() : 'DAERAH'}\nTAHUN 2025`,
      sources: '1. Data Penduduk (DKB), DISDUKCAPIL, 2024.\n2. Data PPH Konsumsi, BAPANAS, 2024.\n3. Data CPPD, DKPP, 2024.\n4. Data DTSEN, Dinas Sosial, 2024.\n5. Data PoU, BAPANAS, 2024.\n6. Susenas BPS, Podes, SKI, 2024.\n7. Harga Komoditas, Disperindag, 2024.\n8. Batas Administrasi BPS & BIG.',
      footer: `Disusun oleh:\nTIM PENYUSUN PETA KETAHANAN DAN KERENTANAN PANGAN TAHUN 2025\nBIDANG KETAHANAN PANGAN\nDINAS KETAHANAN PANGAN DAN PERTANIAN ${kabupaten ? kabupaten.toUpperCase() : ''}`
    });

    const [fontStyles, setFontStyles] = useState<Record<string, FontStyle>>({
      govName: {
        fontFamily: 'Arial',
        fontSize: 10,
        bold: true,
        italic: false,
        underline: false,
        align: 'left'
      },
      title: {
        fontFamily: 'Arial',
        fontSize: 12,
        bold: true,
        italic: false,
        underline: false,
        align: 'center'
      },
      sources: {
        fontFamily: 'Arial',
        fontSize: 11,
        bold: false,
        italic: false,
        underline: false,
        align: 'left'
      },
      footer: {
        fontFamily: 'Arial',
        fontSize: 9,
        bold: false,
        italic: false,
        underline: false,
        align: 'left'
      }
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pemda' | 'bapanas') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            setPrintConfig(prev => ({
              ...prev,
              [type === 'pemda' ? 'logoPemda' : 'logoBapanas']: result
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    };

    // Fetch maps on mount & handle auto-selection of last active or first available map
    useEffect(() => {
      fetch('/api/maps')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const fetchedDetails = data.mapDetails || [];
            setMapDetails(fetchedDetails);
            
            // Filter maps based on level
            const filteredMaps = fetchedDetails.filter((d: any) => d.level === level).map((d: any) => d.nama_kabupaten);
            setMaps(filteredMaps);

            // Auto-select map if none is selected
            if (!kabupaten && filteredMaps.length > 0) {
              const lastActive = localStorage.getItem(`last_active_map_${level}`);
              if (lastActive && filteredMaps.includes(lastActive)) {
                router.replace(`/map?kabupaten=${encodeURIComponent(lastActive)}&level=${level}`);
              } else {
                router.replace(`/map?kabupaten=${encodeURIComponent(filteredMaps[0])}&level=${level}`);
              }
            }
          }
        })
        .catch(console.error);
    }, [kabupaten, level, router]);

    // Save active map to localStorage
    useEffect(() => {
      if (kabupaten) {
        localStorage.setItem(`last_active_map_${level}`, kabupaten);
      }
    }, [kabupaten, level]);

    // Fetch GeoJSON with dynamic year based on the selected map
    useEffect(() => {
      let year = 2025;
      if (kabupaten && mapDetails.length > 0) {
        const detail = mapDetails.find(d => d.nama_kabupaten === kabupaten && d.level === level);
        if (detail) {
          year = detail.tahun;
        }
      }
      setSelectedYear(year);

      let url = `/api/geojson?tahun=${year}&level=${level}`;
      if (kabupaten) url += `&kabupaten=${encodeURIComponent(kabupaten)}`;
      
      setLoading(true);
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setGeoData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, [kabupaten, level, mapDetails]);

    // Re-synchronize printConfig dynamically when map or year changes
    useEffect(() => {
      const formattedTitle = formatMapTitle(kabupaten);
      setPrintConfig(prev => ({
        ...prev,
        govName: 'PEMERINTAH\n' + (kabupaten ? kabupaten.toUpperCase() : 'DAERAH'),
        title: `${formattedTitle}\nTAHUN ${selectedYear}`,
        footer: `Disusun oleh:\nTIM PENYUSUN PETA KETAHANAN DAN KERENTANAN PANGAN TAHUN ${selectedYear}\nBIDANG KETAHANAN PANGAN\nDINAS KETAHANAN PANGAN DAN PERTANIAN ${kabupaten ? kabupaten.toUpperCase() : ''}`
      }));
    }, [kabupaten, selectedYear]);

    // Listen to print and download triggers from Sidebar
    useEffect(() => {
      const handlePrint = () => {
        setShowPrintModal(true);
      };
      
      const handleDownload = () => {
        if (kabupaten) {
          const detail = mapDetails.find(d => d.nama_kabupaten === kabupaten && d.level === level);
          const year = detail ? detail.tahun : selectedYear;
          window.location.href = `/api/export?tahun=${year}&kabupaten=${encodeURIComponent(kabupaten)}&level=${level}`;
        }
      };

      window.addEventListener('trigger-print-pdf', handlePrint);
      window.addEventListener('trigger-download-xlsx', handleDownload);

      // Check URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('triggerPrint') === 'true') {
        setShowPrintModal(true);
        // Clear param
        const params = new URLSearchParams(window.location.search);
        params.delete('triggerPrint');
        router.replace(`/map?${params.toString()}`);
      }
      if (urlParams.get('triggerDownload') === 'true') {
        handleDownload();
        // Clear param
        const params = new URLSearchParams(window.location.search);
        params.delete('triggerDownload');
        router.replace(`/map?${params.toString()}`);
      }

      return () => {
        window.removeEventListener('trigger-print-pdf', handlePrint);
        window.removeEventListener('trigger-download-xlsx', handleDownload);
      };
    }, [kabupaten, level, mapDetails, selectedYear, router]);

    // Validate active layer on level change
    useEffect(() => {
      const validLayers = getLayersForLevel(level as any).map(l => l.id);
      if (!validLayers.includes(activeLayer)) {
        setActiveLayer('prioritas');
      }
    }, [level, activeLayer]);

  const executePrint = () => {
    setShowPrintModal(false);
    if (!mapInstance) return;
    setIsPrinting(true);
    
    // Inject dynamic @page style for current print orientation
    const styleId = 'dynamic-print-page-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@page { size: A4 ${printOrientation}; margin: 0; }`;
    
    let hasRendered = false;

    const doCapture = () => {
      if (hasRendered) return;
      hasRendered = true;
      try {
        const mapCanvas = mapInstance.getCanvas();
        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = mapCanvas.width;
        hiddenCanvas.height = mapCanvas.height;
        const ctx = hiddenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(mapCanvas, 0, 0);
        }
        
        const dataUrl = hiddenCanvas.toDataURL('image/png');
        setMapImage(dataUrl);
        
        const originalTitle = document.title;
        const indicatorName = getLayersForLevel(level as any).find(l => l.id === activeLayer)?.label || '';
        const regionName = kabupaten || 'Wilayah';
        
        // Default filename format requested: FSVA - [Nama Kab/Kota/Prov] - [Tahun] - [Indikator]
        const formattedFileName = `FSVA - ${regionName} - ${selectedYear} - ${indicatorName}`.trim();
        document.title = formattedFileName;
        
        document.body.classList.add('printing-map-pdf');
        document.body.classList.add(printOrientation === 'landscape' ? 'print-landscape' : 'print-portrait');

        // Allow 1000ms for mobile browser image decoding before triggering print window
        setTimeout(() => {
          try {
            window.print();
          } finally {
            document.body.classList.remove('printing-map-pdf', 'print-landscape', 'print-portrait');
            setIsPrinting(false);
            document.title = originalTitle;
            setTimeout(() => setMapImage(null), 1500);
          }
        }, 1000);
      } catch(e) {
        console.error(e);
        document.body.classList.remove('printing-map-pdf');
        setIsPrinting(false);
        alert("Gagal memproses gambar peta untuk PDF.");
      }
    };

    mapInstance.once('render', doCapture);
    mapInstance.triggerRepaint();

    // Fallback for mobile browsers where render event might be suspended/throttled
    setTimeout(() => {
      if (!hasRendered) {
        console.log("Fallback print capture triggered");
        doCapture();
      }
    }, 400);
  };

  return (
    <>
    <PrintLayout 
      mapImage={mapImage} 
      activeLayerName={getLayersForLevel(level as any).find(l => l.id === activeLayer)?.label || ''} 
      activeLayer={activeLayer}
      config={printConfig}
      fontStyles={fontStyles}
      level={level}
      orientation={printOrientation}
    />
    <div className="flex-1 relative flex flex-col no-print h-full">
      <LayerPanel 
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        opacity={opacity}
        setOpacity={setOpacity}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        level={level as any}
        onLevelChange={(lvl) => {
          router.push(`/map?level=${lvl}`);
        }}
      >
        {/* Dropdown Peta (di atas tombol) */}
        <div className="pointer-events-auto flex flex-col gap-1 w-full mb-1 border-b border-slate-100 pb-1.5">
          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            Pilih Peta:
          </label>
          <select
            value={kabupaten || 'semua'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'semua' || val === '') {
                router.push(`/map?level=${level}`);
              } else {
                router.push(`/map?kabupaten=${encodeURIComponent(val)}&level=${level}`);
              }
            }}
            className="w-full text-[10px] bg-white border border-slate-200 rounded-lg py-1 px-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800 font-extrabold cursor-pointer"
          >
            <option value="semua">Semua Peta</option>
            {maps.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Buttons (Top Right of LayerPanel) - Only visible if a specific map is selected */}
        {kabupaten && kabupaten !== 'semua' ? (
          <div className="flex flex-col gap-1 w-full">
            <button 
              onClick={() => setShowPrintModal(true)}
              disabled={isPrinting}
              className="pointer-events-auto bg-[#6b4c9a] hover:bg-[#5b3c8a] text-white px-2 py-1.5 rounded shadow border border-[#4b2c7a] text-[9px] md:text-[10px] font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {isPrinting ? (
                 <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 <Printer className="w-3 h-3" />
              )}
              Cetak PDF
            </button>
            <a 
              href={`/api/export?tahun=${selectedYear}&kabupaten=${encodeURIComponent(kabupaten)}&level=${level}`} 
              className="pointer-events-auto bg-[#6b4c9a] hover:bg-[#5b3c8a] text-white px-2 py-1.5 rounded shadow border border-[#4b2c7a] text-[9px] md:text-[10px] font-bold flex items-center justify-center gap-1.5 transition text-center"
            >
              <Download className="w-3 h-3" />
              XLSX Hasil
            </a>
          </div>
        ) : (
          <div className="text-[8px] text-slate-400 font-semibold italic text-center p-1 bg-slate-50 rounded border border-slate-100 mt-1 leading-tight">
            Pilih peta untuk mencetak PDF atau ekspor XLSX.
          </div>
        )}
      </LayerPanel>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg border font-medium text-gray-600 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            Memuat Peta...
          </div>
        </div>
      )}

      {!loading && geoData && geoData.features && geoData.features.length === 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg border border-red-200 font-medium max-w-md text-center pointer-events-auto">
            <p className="font-bold text-lg mb-1">Data Peta Kosong</p>
            <p className="text-sm">Sistem tidak menemukan poligon dengan tahun kalkulasi {selectedYear}. Pastikan Anda sudah menekan tombol "Hitung FSVA Sekarang" di Data Entry.</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-100">
        <MapView 
          geoJsonData={geoData} 
          activeLayer={activeLayer}
          opacity={opacity}
          showLabels={showLabels}
          onPolygonClick={(props) => setSelectedPolygon(props)} 
          onMapReady={(m) => setMapInstance(m)}
        />

        {/* North Arrow Overlay (Pojok Kanan Atas, Tanpa Latar Belakang Kotak Putih) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-center select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          <svg width="28" height="42" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-10">
            <path d="M16 2 L26 24 L16 18 L6 24 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="miter" />
            <path d="M16 2 L16 18 L6 24 Z" fill="#ffffff" />
            <text x="16" y="42" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900" fill="#0f172a" textAnchor="middle" stroke="#ffffff" strokeWidth="0.8">U</text>
          </svg>
        </div>

        {/* Print Preview Guide Overlay */}
        {showPrintGuide && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div 
              className={`relative border-4 border-solid border-[#ec4899] rounded shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-transparent flex flex-col items-center justify-start pointer-events-none transition-all duration-300 ${
                printOrientation === 'landscape'
                  ? 'aspect-[258/133] w-[85%] max-h-[85%]'
                  : 'aspect-[133/258] h-[80%] max-w-[90%]'
              }`}
            >
              {/* Text info in 2 lines inside the top margin of the box */}
              <div className="absolute top-3 left-0 right-0 flex justify-center items-center pointer-events-auto">
                <span 
                  className="text-[10px] font-black text-center leading-snug px-6 tracking-wide select-none"
                  style={{ 
                    color: '#ffffff',
                    textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  Geser dan zoom out untuk menyesuaikan peta<br />yang akan dicetak ({printOrientation === 'landscape' ? 'Landscape/A4 Tidur' : 'Portrait/A4 Tegak'}) ke dalam kotak panduan ini.
                </span>
              </div>
              {/* Close Button */}
              <button 
                onClick={() => setShowPrintGuide(false)}
                className="absolute -right-3 -top-3 text-black font-black text-xs md:text-sm hover:text-red-600 transition-colors bg-white hover:bg-slate-100 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg shadow-md border border-slate-200 pointer-events-auto"
                title="Tutup Panduan"
              >
                X
              </button>
            </div>
          </div>
        )}

        {/* Floating guidance button to reopen - Minimal round icon at the top center */}
        {!showPrintGuide && (
          <button
            onClick={() => setShowPrintGuide(true)}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 hover:bg-white text-pink-600 p-3.5 rounded-full shadow-lg border-2 border-pink-400 hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto flex items-center justify-center animate-in fade-in zoom-in duration-250"
            title="Tampilkan Panduan Cetak Peta"
          >
            <Printer className="w-4.5 h-4.5 text-pink-500" />
          </button>
        )}

        <LegendPanel activeLayer={activeLayer} />
        <InfoPanel 
          data={selectedPolygon} 
          onClose={() => setSelectedPolygon(null)} 
        />
      </div>

      {/* Print Config Modal */}
      {showPrintModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[70%] md:max-h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" /> Pengaturan Cetak Peta
              </h2>
              <p className="text-xs text-gray-500 mt-1">Pilih orientasi halaman & ubah teks dinamis untuk PDF.</p>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Orientation Selection Option */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Orientasi Halaman Cetak (Layout PDF)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintOrientation('portrait')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 transition-all text-xs font-bold ${
                      printOrientation === 'portrait'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-3.5 h-5 border-2 border-current rounded-xs" />
                    <span>Portrait (A4 Tegak)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintOrientation('landscape')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2.5 transition-all text-xs font-bold ${
                      printOrientation === 'landscape'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-3.5 border-2 border-current rounded-xs" />
                    <span>Landscape (A4 Tidur)</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Logo Pemda (Kiri)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'pemda')} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Logo Bapanas (Kanan)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'bapanas')} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Instansi / Pemerintah (Pojok Kanan Atas)</label>
                <FontToolbar value={fontStyles.govName} onChange={(val) => setFontStyles({ ...fontStyles, govName: val })} />
                <textarea 
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={printConfig.govName}
                  onChange={(e) => setPrintConfig({...printConfig, govName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Peta (Tengah Kanan)</label>
                <FontToolbar value={fontStyles.title} onChange={(val) => setFontStyles({ ...fontStyles, title: val })} />
                <textarea 
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={printConfig.title}
                  onChange={(e) => setPrintConfig({...printConfig, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Daftar Sumber Data</label>
                <FontToolbar value={fontStyles.sources} onChange={(val) => setFontStyles({ ...fontStyles, sources: val })} />
                <textarea 
                  rows={4}
                  className="w-full text-xs border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  value={printConfig.sources}
                  onChange={(e) => setPrintConfig({...printConfig, sources: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Kaki / Tanda Tangan (Bawah)</label>
                <FontToolbar value={fontStyles.footer} onChange={(val) => setFontStyles({ ...fontStyles, footer: val })} />
                <textarea 
                  rows={4}
                  className="w-full text-xs border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  value={printConfig.footer}
                  onChange={(e) => setPrintConfig({...printConfig, footer: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button 
                onClick={executePrint}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md flex items-center gap-2"
              >
                Lanjut Cetak PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
