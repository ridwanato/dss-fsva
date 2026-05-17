import UploadPanel from '@/components/UploadPanel';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EntryPage() {
  return (
    <div className="flex-1 bg-[#fbfdfc] py-12 pt-28 h-full overflow-y-auto relative">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#16a34a 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50/80 text-green-700 font-extrabold text-[11px] tracking-widest uppercase mb-6 border border-green-200/50">
            Data Entry & Kalkulasi FSVA <span className="text-green-500 font-bold ml-1">&gt;</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-black text-slate-800 mb-6 leading-[1.15] tracking-tight">
            Langkah Mudah Hitung FSVA Akurat, Cepat, Terintegrasi
          </h1>
          <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Upload data wilayah dan indikator, lalu jalankan perhitungan FSVA berdasarkan juknis Bapanas.
          </p>
        </div>

        {/* The 3 Cards Panel */}
        <UploadPanel />

        {/* Footer Banner */}
        <div className="mt-12 md:mt-20 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="bg-emerald-100/50 p-3 rounded-xl shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1 text-base md:text-lg">Keamanan & Privasi Data Terjamin</h4>
              <p className="text-sm text-slate-500 font-medium leading-snug">Data Anda aman, hanya digunakan untuk keperluan analisis FSVA.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-5 py-3 rounded-xl text-emerald-700 font-bold border border-emerald-100 whitespace-nowrap shadow-sm text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Sesuai Juknis Bapanas
          </div>
        </div>

      </div>
    </div>
  );
}
