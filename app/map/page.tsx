'use client';
import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import LegendPanel from '@/components/LegendPanel';
import InfoPanel from '@/components/InfoPanel';
import { Download } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex-1 relative flex flex-col">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-4 flex justify-between items-start">
        <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-xl shadow border border-gray-200 pointer-events-auto max-w-sm">
          <h1 className="text-xl font-black text-gray-800 tracking-tight mb-2">Peta FSVA 2024</h1>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pilih Layer Peta:</label>
            <select 
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value)}
              className="text-sm border border-gray-300 rounded p-1.5 bg-gray-50 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LAYERS.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
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

      {/* Map Container */}
      <div className="flex-1 relative bg-blue-50">
        <MapView 
          geoJsonData={geoData} 
          activeLayer={activeLayer}
          onPolygonClick={(props) => setSelectedPolygon(props)} 
        />
        <LegendPanel />
        <InfoPanel 
          data={selectedPolygon} 
          onClose={() => setSelectedPolygon(null)} 
        />
      </div>
    </div>
  );
}
