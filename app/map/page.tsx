'use client';
import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import LegendPanel from '@/components/LegendPanel';
import InfoPanel from '@/components/InfoPanel';
import { Download } from 'lucide-react';

export default function MapPage() {
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<any>(null);
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
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow border border-gray-200 pointer-events-auto">
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Peta FSVA 2024</h1>
          <p className="text-sm text-gray-500 font-medium">Kota Cilegon</p>
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
