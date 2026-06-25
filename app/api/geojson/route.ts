import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tahunStr = url.searchParams.get('tahun');
    const kabupaten = url.searchParams.get('kabupaten');
    const tahun = tahunStr ? parseInt(tahunStr) : 2025; // Default to 2025

    const supabase = getServiceSupabase();
    let features: string[] = [];

    if (kabupaten) {
      // 1. Ambil seluruh geometri untuk kabupaten ini dari tabel geometries.
      // Ini menjamin peta selalu muncul (berwarna abu-abu) meskipun data indikator belum diunggah/dikalkulasi.
      const { data: geomData, error: geomError } = await supabase
        .from('geometries')
        .select('kode_bps, nama_desa, nama_kecamatan, nama_kabupaten, user_id, geom')
        .eq('nama_kabupaten', kabupaten);

      if (geomError) throw geomError;

      if (geomData && geomData.length > 0) {
        // 2. Ambil data hasil kalkulasi FSVA untuk kode_bps tersebut pada tahun yang dipilih
        const codes = geomData.map(g => g.kode_bps);
        const { data: resData, error: resError } = await supabase
          .from('fsva_results')
          .select('*')
          .eq('tahun', tahun)
          .in('kode_bps', codes);

        if (resError) throw resError;

        // Petakan hasil kalkulasi berdasarkan kode_bps untuk pencarian cepat O(1)
        const resMap: Record<string, any> = {};
        if (resData) {
          for (const r of resData) {
            resMap[r.kode_bps] = r;
          }
        }

        // 3. Gabungkan geometri dengan hasil kalkulasi di sisi server (jika ada)
        features = geomData.map(row => {
          const { geom, ...geoProps } = row;
          const fsvaRes = resMap[row.kode_bps] || {};
          
          // Gabungkan seluruh properti indikator dan hasil akhir
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
        .eq('tahun', tahun);

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
