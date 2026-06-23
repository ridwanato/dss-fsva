import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateAllIndicators } from '@/lib/fsva/form1-calculator';
import { calculateFSVAResult } from '@/lib/fsva/composite-score';

export async function POST(req: NextRequest) {
  try {
    const { tahun, kab_kota } = await req.json();

    if (!tahun) {
      return NextResponse.json({ success: false, error: 'tahun is required' }, { status: 400 });
    }

    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    const userId = session.user.id;
    
    // Fetch raw_indicators + geometries info for current user
    let query = authClient.from('raw_indicators').select(`
      *,
      geometries ( nama_kabupaten, nama_provinsi )
    `).eq('tahun', tahun).eq('user_id', userId);

    if (kab_kota) {
      // Supabase nested filtering is a bit tricky, alternative is to filter after fetch
      // or use inner join if supported
    }

    const { data: rawData, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    let processed = 0;
    const errors: string[] = [];
    const summary: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    
    for (const row of rawData || []) {
      if (kab_kota && row.geometries?.nama_kabupaten !== kab_kota) continue;

      const provinsi = row.provinsi_kode || row.geometries?.nama_provinsi || 'Indonesia';
      
      const input = {
        produksi_padi: row.produksi_padi,
        produksi_jagung: row.produksi_jagung,
        produksi_ubi_kayu: row.produksi_ubi_kayu,
        produksi_ubi_jalar: row.produksi_ubi_jalar,
        produksi_sagu: row.produksi_sagu,
        produksi_pisang: row.produksi_pisang,
        jumlah_penduduk: row.jumlah_penduduk,
        provinsi,
        konsumsi_energi: row.konsumsi_energi,
        konsumsi_protein: row.konsumsi_protein,
        cadangan_cbpd: row.cadangan_cbpd,
        cadangan_lpm: row.cadangan_lpm,
        pct_miskin: row.pct_miskin,
        cv_harga_beras: row.cv_harga_beras,
        cv_harga_ayam: row.cv_harga_ayam,
        cv_harga_telur: row.cv_harga_telur,
        cv_harga_minyak: row.cv_harga_minyak,
        pou: row.pou,
        lama_sekolah_perempuan: row.lama_sekolah_perempuan,
        pct_no_water: row.pct_no_water,
        skor_pph: row.skor_pph,
        pct_stunting: row.pct_stunting,
      };

      const indicators = calculateAllIndicators(input);
      const result = calculateFSVAResult(indicators);

      const upsertData = {
        kode_bps: row.kode_bps,
        nama_kabupaten: row.nama_kabupaten || row.geometries?.nama_kabupaten || 'DAERAH',
        tahun: row.tahun,
        user_id: userId,
        ...indicators,
        ...result,
      };

      const { error: upsertError } = await authClient.from('fsva_results').upsert(upsertData, {
        onConflict: 'nama_kabupaten,kode_bps,tahun'
      });

      if (!upsertError) {
        processed++;
        summary[result.prioritas] = (summary[result.prioritas] || 0) + 1;
      } else {
        errors.push(`Desa ${row.kode_bps}: ${upsertError.message}`);
      }
    }

    return NextResponse.json({ success: true, processed, summary, errors });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
