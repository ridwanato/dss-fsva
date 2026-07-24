import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tahunStr = url.searchParams.get('tahun');
    const kabupaten = url.searchParams.get('kabupaten');
    const level = url.searchParams.get('level') || 'kab_kota';
    const tahun = tahunStr ? parseInt(tahunStr) : 2025; // Default to 2025

    const supabase = getServiceSupabase();
    let features: string[] = [];

    if (kabupaten) {
      // 1. Ambil seluruh geometri untuk kabupaten/provinsi ini dari tabel geometries.
      const { data: geomData, error: geomError } = await supabase
        .from('geometries')
        .select('kode_bps, nama_desa, nama_kecamatan, nama_kabupaten, user_id, level, geom')
        .eq('nama_kabupaten', kabupaten)
        .eq('level', level);

      if (geomError) throw geomError;

      if (geomData && geomData.length > 0) {
        // 2. Ambil data hasil kalkulasi FSVA dan data indikator mentah secara paralel
        const codes = geomData.map(g => g.kode_bps);
        
        const [resPromise, rawPromise] = await Promise.all([
          supabase.from('fsva_results').select('*').eq('tahun', tahun).eq('level', level).in('kode_bps', codes),
          supabase.from('raw_indicators').select('*').eq('tahun', tahun).eq('level', level).in('kode_bps', codes)
        ]);

        if (resPromise.error) throw resPromise.error;
        if (rawPromise.error) throw rawPromise.error;

        const resData = resPromise.data;
        const rawData = rawPromise.data;

        // Petakan hasil kalkulasi
        const resMap: Record<string, any> = {};
        if (resData) {
          for (const r of resData) {
            resMap[r.kode_bps] = r;
          }
        }

        // Petakan indikator mentah
        const rawMap: Record<string, any> = {};
        if (rawData) {
          for (const r of rawData) {
            rawMap[r.kode_bps] = r;
          }
        }

        // 3. Gabungkan geometri dengan hasil kalkulasi & indikator mentah di sisi server
        features = geomData.map(row => {
          const { geom, ...geoProps } = row;
          const fsvaRes = resMap[row.kode_bps] || {};
          const rawInd = rawMap[row.kode_bps] || {};
          
          const properties = {
            ...geoProps,
            tahun: fsvaRes.tahun || tahun,
            prioritas: fsvaRes.prioritas || null,
            indeks_komposit: fsvaRes.indeks_komposit || null,
            ncpr: fsvaRes.ncpr || null,
            pct_ake: fsvaRes.pct_ake || null,
            pct_prohe: fsvaRes.pct_prohe || null,
            rasio_cadangan: fsvaRes.rasio_cadangan || null,
            cv_harga: fsvaRes.cv_harga || null,
            pou: fsvaRes.pou || null,
            pct_miskin_ref: fsvaRes.pct_miskin || null,
            
            // Raw values
            lama_sekolah: rawInd.lama_sekolah_perempuan !== undefined ? rawInd.lama_sekolah_perempuan : null,
            pct_no_water: rawInd.pct_no_water !== undefined ? rawInd.pct_no_water : null,
            skor_pph: rawInd.skor_pph !== undefined ? rawInd.skor_pph : null,
            pct_stunting: rawInd.pct_stunting !== undefined ? rawInd.pct_stunting : null,
            food_safety: fsvaRes.food_safety !== undefined ? fsvaRes.food_safety : null,

            indeks_ketersediaan: fsvaRes.indeks_ketersediaan || null,
            indeks_keterjangkauan: fsvaRes.indeks_keterjangkauan || null,
            indeks_pemanfaatan: fsvaRes.indeks_pemanfaatan || null,
            p_ncpr: fsvaRes.p_ncpr || null,
            p_energy: fsvaRes.p_energy || null,
            p_protein: fsvaRes.p_protein || null,
            p_cadangan: fsvaRes.p_cadangan || null,
            p_poverty: fsvaRes.p_poverty || null,
            p_cv_harga: fsvaRes.p_cv_harga || null,
            p_pou: fsvaRes.p_pou || null,
            p_sekolah: fsvaRes.p_sekolah || null,
            p_air: fsvaRes.p_air || null,
            p_food_safety: fsvaRes.p_food_safety || null,
            p_pph: fsvaRes.p_pph || null,
            p_stunting: fsvaRes.p_stunting || null
          };

          let geomStr = typeof geom === 'string' ? geom : JSON.stringify(geom);
          if (!geomStr || geomStr.trim() === '') geomStr = 'null';

          return `{"type":"Feature","geometry":${geomStr},"properties":${JSON.stringify(properties)}}`;
        });
      }
    } else {
      // Jika tidak ada kabupaten spesifik (Semua Peta), gunakan filter tahun berbasis view seperti biasa
      const { data, error } = await supabase
        .from('fsva_map_view')
        .select('*')
        .eq('tahun', tahun)
        .eq('level', level);

      if (error) throw error;

      features = (data || []).map(row => {
        const { geometry, ...properties } = row;
        
        let geomStr = typeof geometry === 'string' ? geometry : JSON.stringify(geometry);
        if (!geomStr || geomStr.trim() === '') geomStr = 'null';
        
        return `{"type":"Feature","geometry":${geomStr},"properties":${JSON.stringify(properties)}}`;
      });
    }

    const finalJsonString = `{"type":"FeatureCollection","features":[${features.join(',')}]}`;

    return new NextResponse(finalJsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error("GeoJSON API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
