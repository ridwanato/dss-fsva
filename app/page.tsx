import Link from 'next/link';
import { Map, BarChart3, Database } from 'lucide-react';
import SeoContent from '@/components/SeoContent';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pt-16 sm:pt-24 text-center overflow-y-auto h-full">
      <SeoContent />
      <div className="max-w-3xl space-y-4 sm:space-y-8">
        <div className="space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
              System Otomasi Peta
            </span> <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-emerald-50 px-2.5 py-0.5 md:px-3 rounded-xl border border-emerald-100/50 inline-block mt-1 sm:mt-2">
              FSVA Kabupaten/Kota
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-2xl font-semibold text-gray-500">
            Metode Baru Tahun 2025 (11 Indikator)
          </p>
        </div>
        <p className="text-xs sm:text-sm md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Platform pemetaan Ketahanan dan Kerentanan Pangan tingkat Desa/Kelurahan 
          berdasarkan Petunjuk Teknis Badan Pangan Nasional 2025.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-12">
          <Link href="/map" className="group bg-[#F5F3FF]/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#D5CFFF] hover:shadow-xl hover:border-[#B1A3FF] transition-all flex flex-col items-center text-center justify-center">
            <div className="bg-[#E8E4FF] w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform">
              <Map className="text-[#6D5EF5] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1 sm:mb-2">Peta Interaktif</h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Eksplorasi visual kerentanan pangan di setiap desa dengan choropleth interaktif.</p>
          </Link>
          
          <Link href="/dashboard" className="group bg-[#E0F2FE]/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#B9E0FF] hover:shadow-xl hover:border-[#99CCFF] transition-all flex flex-col items-center text-center justify-center">
            <div className="bg-[#CBE5FF] w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-[#0284C7] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1 sm:mb-2">Dashboard</h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Ringkasan statistik dan analisis faktor dominan kerentanan pangan.</p>
          </Link>

          <Link href="/entry" className="group bg-[#FFF0F5]/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#FFCCD9] hover:shadow-xl hover:border-[#FFA4C0] transition-all flex flex-col items-center text-center justify-center">
            <div className="bg-[#FFD1E1] w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform">
              <Database className="text-[#DB2777] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1 sm:mb-2">Data Entry</h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Upload dan kalkulasi data 11 indikator FSVA sesuai rumusan juknis Bapanas.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
