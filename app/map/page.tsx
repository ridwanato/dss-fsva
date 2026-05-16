'use client';
import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import LegendPanel from '@/components/LegendPanel';
import InfoPanel from '@/components/InfoPanel';
import PrintLayout from '@/components/PrintLayout';
import { Download, Printer } from 'lucide-react';

const LAYERS = [
  { id: 'prioritas', label: 'Komposit (Semua Indikator)' },
  { id: 'p_ncpr', label: '1. Rasio Ketersediaan (NCPR)' },
  { id: 'p_energy', label: '2. % Ketersediaan Energi' },
  { id: 'p_protein', label: '3. % Ketersediaan Protein Hewani' },
  { id: 'p_cadangan', label: '4. Rasio Cadangan Pangan' },
  { id: 'p_poverty', label: '5. % Penduduk Miskin' },
  { id: 'p_cv_harga', label: '6. CV Harga Pangan' },
  { id: 'p_pou', label: '7. Prevalensi Undernourishment (PoU)' },
  { id: 'p_sekolah', label: '8. Lama Sekolah Perempuan' },
  { id: 'p_air', label: '9. Akses Air Bersih' },
  { id: 'p_pph', label: '10. Skor Pola Pangan Harapan' },
  { id: 'p_stunting', label: '11. Prevalensi Stunting' },
];

export default function MapPage() {
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState('prioritas');
  const [opacity, setOpacity] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    fetch('/api/geojson?tahun=2024')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    if (!mapInstance) return;
    setIsPrinting(true);
    setTimeout(() => {
      try {
        const dataUrl = mapInstance.getCanvas().toDataURL('image/png');
        setMapImage(dataUrl);
        // Give React and browser time to decode and render the large base64 image into the DOM
        setTimeout(() => {
          window.print();
          setIsPrinting(false);
        }, 1200);
      } catch(e) {
        console.error(e);
        setIsPrinting(false);
        alert("Gagal memproses gambar peta untuk PDF.");
      }
    }, 100);
  };

  return (
    <>
    <PrintLayout 
      mapImage={mapImage} 
      activeLayerName={LAYERS.find(l => l.id === activeLayer)?.label || ''} 
    />
    <div className="flex-1 relative flex flex-col no-print h-full">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-4 flex justify-between items-start">
        <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-xl shadow border border-gray-200 pointer-events-auto max-w-sm mt-16 ml-2">
          <h1 className="text-xl font-black text-gray-800 tracking-tight mb-0">Peta FSVA 2025 <span className="text-sm font-semibold text-gray-500">(basis data 2024)</span></h1>
          <p className="text-[11px] font-extrabold text-green-700 mb-4 uppercase tracking-wider">11 Indikator Kab/Kota</p>
          
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Transparansi Peta</span>
                <span className="text-gray-400 font-semibold">{opacity}%</span>
              </label>
              <div className="relative flex items-center h-2 bg-gray-200 rounded-full">
                <div className="absolute h-full bg-green-500 rounded-full" style={{ width: `${opacity}%` }}></div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute h-4 w-4 bg-white border-2 border-green-500 rounded-full shadow-sm pointer-events-none transition-transform"
                  style={{ left: `calc(${opacity}% - 8px)` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 border-l pl-4 border-gray-100 h-8">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right leading-tight">
                Nama<br/>Kelurahan
              </label>
              <button 
                onClick={() => setShowLabels(!showLabels)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors shadow-inner overflow-hidden flex-shrink-0 ${showLabels ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute left-2 text-[9px] font-black text-white transition-opacity ${showLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                <span className={`absolute right-1 text-[9px] font-black text-gray-500 transition-opacity ${!showLabels ? 'opacity-100' : 'opacity-0'}`}>OFF</span>
                <span className={`absolute z-10 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showLabels ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pilih Layer Peta:</label>
            <select 
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg p-2 bg-gray-50 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm hover:border-green-400 transition-colors"
            >
              {LAYERS.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
          <button 
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm border border-blue-800 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            {isPrinting ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
               <Printer className="w-4 h-4" />
            )}
            Cetak PDF
          </button>
          <a href="/api/export?tahun=2024" className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-semibold flex items-center gap-2 transition">
            <Download className="w-4 h-4" />
            XLSX Hasil
          </a>
        </div>
      </div>

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
            <p className="text-sm">Sistem tidak menemukan poligon dengan tahun kalkulasi 2024. Pastikan Anda sudah menekan tombol "Hitung FSVA Sekarang" di Data Entry.</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative bg-blue-50">
        <MapView 
          geoJsonData={geoData} 
          activeLayer={activeLayer}
          opacity={opacity}
          showLabels={showLabels}
          onPolygonClick={(props) => setSelectedPolygon(props)} 
          onMapReady={(m) => setMapInstance(m)}
        />
        <LegendPanel />
        <InfoPanel 
          data={selectedPolygon} 
          onClose={() => setSelectedPolygon(null)} 
        />
      </div>
    </div>
    </>
  );
}
