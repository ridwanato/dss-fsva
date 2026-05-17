import Link from 'next/link';
import { Map, BarChart3, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 text-center overflow-y-auto h-full">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Decision Support System <br/>
          <span className="text-green-600 bg-green-50 px-2 rounded">FSVA</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Platform pemetaan Ketahanan dan Kerentanan Pangan tingkat Desa/Kelurahan 
          berdasarkan Petunjuk Teknis Badan Pangan Nasional 2025.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/map" className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all text-left">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Map className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Peta Interaktif</h3>
            <p className="text-sm text-gray-500">Eksplorasi visual kerentanan pangan di setiap desa dengan choropleth interaktif.</p>
          </Link>
          
          <Link href="/dashboard" className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all text-left">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Dashboard</h3>
            <p className="text-sm text-gray-500">Ringkasan statistik dan analisis faktor dominan kerentanan pangan.</p>
          </Link>

          <Link href="/entry" className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all text-left">
            <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database className="text-amber-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Data Entry</h3>
            <p className="text-sm text-gray-500">Upload dan kalkulasi data 11 indikator FSVA sesuai rumusan juknis Bapanas.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
