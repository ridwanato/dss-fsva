'use client';
import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import LegendPanel from '@/components/LegendPanel';
import InfoPanel from '@/components/InfoPanel';
import PrintLayout from '@/components/PrintLayout';
import { Download, Printer, Settings } from 'lucide-react';

import LayerPanel, { LAYERS } from '@/components/LayerPanel';

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

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    logoPemda: '/logo-cilegon.png',
    logoBapanas: '/logo-bapanas.png',
    govName: 'PEMERINTAH\nKOTA CILEGON',
    title: 'FSVA KOTA CILEGON\nTAHUN 2025',
    sources: '1. Data Penduduk (DKB), DISDUKCAPIL, 2024.\n2. Data PPH Konsumsi, BAPANAS, 2024.\n3. Data CPPD, DKPP, 2024.\n4. Data DTSEN, Dinas Sosial, 2024.\n5. Data PoU, BAPANAS, 2024.\n6. Susenas BPS, Podes, SKI, 2024.\n7. Harga Komoditas, Disperindag, 2024.\n8. Batas Administrasi BPS & BIG.',
    footer: 'Disusun oleh:\nTIM PENYUSUN PETA KETAHANAN DAN KERENTANAN PANGAN TAHUN 2025\nBIDANG KETAHANAN PANGAN\nDINAS KETAHANAN PANGAN DAN PERTANIAN KOTA CILEGON\nJl. Kubang Laban No. 56 Kel. Sukmajaya, Kec. Jombang, Kota Cilegon\nTelp: (0254) 390582'
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

  const executePrint = () => {
    setShowPrintModal(false);
    if (!mapInstance) return;
    setIsPrinting(true);
    
    mapInstance.once('render', () => {
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
        
        setTimeout(() => {
          window.print();
          setIsPrinting(false);
          setTimeout(() => setMapImage(null), 1000);
        }, 800);
      } catch(e) {
        console.error(e);
        setIsPrinting(false);
        alert("Gagal memproses gambar peta untuk PDF.");
      }
    });

    mapInstance.triggerRepaint();
  };

  return (
    <>
    <PrintLayout 
      mapImage={mapImage} 
      activeLayerName={LAYERS.find(l => l.id === activeLayer)?.label || ''} 
      config={printConfig}
    />
    <div className="flex-1 relative flex flex-col no-print h-full">
      <LayerPanel 
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        opacity={opacity}
        setOpacity={setOpacity}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />
      
      {/* Floating Action Buttons (Top Right) */}
      <div className="absolute top-16 right-4 z-20 flex flex-col md:flex-row items-end md:items-start gap-2 pointer-events-none">
        <button 
          onClick={() => setShowPrintModal(true)}
          disabled={isPrinting}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-xl border border-blue-800 text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {isPrinting ? (
             <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             <Printer className="w-3 h-3" />
          )}
          Cetak PDF
        </button>
        <a href="/api/export?tahun=2024" className="pointer-events-auto bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-xl border border-gray-200 text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition">
          <Download className="w-3 h-3" />
          XLSX Hasil
        </a>
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

      {/* Print Config Modal */}
      {showPrintModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" /> Pengaturan Cetak Peta
              </h2>
              <p className="text-xs text-gray-500 mt-1">Ubah teks dinamis yang akan tampil di PDF.</p>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
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
                <textarea 
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={printConfig.govName}
                  onChange={(e) => setPrintConfig({...printConfig, govName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Peta (Tengah Kanan)</label>
                <textarea 
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={printConfig.title}
                  onChange={(e) => setPrintConfig({...printConfig, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Daftar Sumber Data</label>
                <textarea 
                  rows={4}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  value={printConfig.sources}
                  onChange={(e) => setPrintConfig({...printConfig, sources: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Kaki / Tanda Tangan (Bawah)</label>
                <textarea 
                  rows={4}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
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
