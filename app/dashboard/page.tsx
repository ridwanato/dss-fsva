import DashboardCharts from '@/components/DashboardCharts';
import DashboardMapSelector from '@/components/DashboardMapSelector';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function DashboardPage({ searchParams }: { searchParams: { kabupaten?: string } }) {
  const sp = await searchParams;
  const kabupaten = sp.kabupaten;
  
  const supabase = getServiceSupabase();

  // Fetch all available saved maps for the dropdown selector
  const { data: geomData } = await supabase
    .from('geometries')
    .select('nama_kabupaten')
    .not('nama_kabupaten', 'is', null);
  
  const maps = Array.from(
    new Set((geomData || []).map((d) => d.nama_kabupaten))
  ).filter(Boolean).sort() as string[];

  let fsvaData: any[] = [];
  let latestYear: number | null = null;
  let queryError: any = null;

  // Only query indicator data if a specific map is selected
  if (kabupaten) {
    const { data: rawData, error } = await supabase
      .from('fsva_map_view')
      .select('prioritas, p_ncpr, p_energy, p_protein, p_cadangan, p_poverty, p_cv_harga, p_pou, p_sekolah, p_air, p_pph, p_stunting, tahun')
      .eq('nama_kabupaten', kabupaten);
      
    if (error) {
      queryError = error;
      console.error("Dashboard query error:", error);
    } else if (rawData && rawData.length > 0) {
      // Dynamically find the latest year uploaded for this specific kabupaten
      latestYear = Math.max(...rawData.map(d => d.tahun || 0));
      fsvaData = rawData.filter(d => d.tahun === latestYear);
    }
  }

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1E1B4B] mb-2">
            {kabupaten ? `Dashboard Analisis — ${kabupaten}` : 'Dashboard Analisis'}
          </h1>
          <p className="text-slate-550 text-sm">
            {kabupaten && latestYear 
              ? `Tahun ${latestYear} — Ringkasan status ketahanan dan kerentanan pangan.` 
              : 'Ringkasan status ketahanan dan kerentanan pangan.'}
          </p>
        </div>
        
        {/* Inline selector at the top when a map is already selected */}
        {kabupaten && (
          <div className="flex-shrink-0">
            <DashboardMapSelector maps={maps} currentKabupaten={kabupaten} variant="inline" />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-4">
        {queryError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            <strong className="font-bold">Error Database:</strong> {queryError.message} (Code: {queryError.code})
            <p className="text-xs text-red-500 mt-1">Pastikan skrip migrasi database (`migration.sql`) sudah dijalankan di Supabase SQL Editor.</p>
          </div>
        )}

        {/* Informative alert if the selected map has no calculation data */}
        {kabupaten && fsvaData.length === 0 && !queryError && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-5 rounded-2xl text-sm shadow-sm">
            <strong className="font-bold">Informasi:</strong> Data kalkulasi untuk peta <strong>"{kabupaten}"</strong> tidak ditemukan di database.
            <p className="text-xs text-blue-600 mt-2 leading-relaxed">
              Langkah Penyelesaian: Silakan masuk ke menu <strong>Data Entry</strong>, pilih peta <strong>"{kabupaten}"</strong>, unggah data indikator (XLSX), lalu tekan tombol <strong>"Hitung FSVA Sekarang"</strong> untuk menghasilkan data analisis.
            </p>
          </div>
        )}
      </div>

      {/* 1. If NO map is selected, show the beautiful selection notification card */}
      {!kabupaten ? (
        <DashboardMapSelector maps={maps} variant="full" />
      ) : (
        /* 2. If a map is selected and data exists, render the charts */
        fsvaData.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <DashboardCharts data={fsvaData} />
          </div>
        )
      )}
    </div>
  );
}

