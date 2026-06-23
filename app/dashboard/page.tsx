import DashboardCharts from '@/components/DashboardCharts';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function DashboardPage({ searchParams }: { searchParams: { kabupaten?: string } }) {
  const sp = await searchParams;
  const kabupaten = sp.kabupaten;
  
  const supabase = getServiceSupabase();
  let query = supabase
    .from('fsva_map_view')
    .select('prioritas, p_ncpr, p_energy, p_protein, p_cadangan, p_poverty, p_cv_harga, p_pou, p_sekolah, p_air, p_pph, p_stunting')
    .eq('tahun', 2024);
    
  if (kabupaten) {
    query = query.eq('nama_kabupaten', kabupaten);
  }

  const { data: fsvaData, error } = await query;

  if (error) {
    console.error("Dashboard query error:", error);
  }

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-black text-[#1E1B4B] mb-2">Dashboard Analisis</h1>
        <p className="text-slate-500">Ringkasan status ketahanan dan kerentanan pangan.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-sm">
            <strong className="font-bold">Error Database:</strong> {error.message} (Code: {error.code})
            <p className="text-xs text-red-500 mt-1">Pastikan skrip migrasi database (`migration.sql`) sudah dijalankan di Supabase SQL Editor.</p>
          </div>
        )}
        {(!fsvaData || fsvaData.length === 0) && !error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-650 p-4 rounded-xl text-sm">
            <strong className="font-bold">Informasi:</strong> Data kalkulasi untuk tahun 2024 tidak ditemukan di database.
            <p className="text-xs text-blue-500 mt-1">Langkah Penyelesaian: Silakan masuk ke menu <strong>Data Entry</strong>, pilih/masukkan nama kabupaten, unggah batas wilayah (KML/KMZ) beserta indikator (XLSX), lalu tekan tombol <strong>"Hitung FSVA Sekarang"</strong> untuk menghasilkan data analisis.</p>
          </div>
        )}
      </div>
      
      {fsvaData && fsvaData.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <DashboardCharts data={fsvaData} />
        </div>
      )}
    </div>
  );
}
