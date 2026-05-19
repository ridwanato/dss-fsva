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

  return (
    <div className="flex-1 bg-gray-50 py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Analisis</h1>
        <p className="text-gray-500">Ringkasan status ketahanan dan kerentanan pangan.</p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <DashboardCharts data={fsvaData || []} />
      </div>
    </div>
  );
}
