import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tahunStr = url.searchParams.get('tahun');
    const kabupaten = url.searchParams.get('kabupaten');
    const tahun = tahunStr ? parseInt(tahunStr) : 2024;

    const supabase = getServiceSupabase();
    let query = supabase.from('fsva_map_view').select('*').eq('tahun', tahun);
    
    if (kabupaten) {
      query = query.eq('nama_kabupaten', kabupaten);
    }

    // Gunakan .csv() atau biarkan default JSON, supabase-js handles it
    const { data, error } = await query;
    if (error) throw error;

    // TRIK OPTIMASI: Jangan mem-parse string geometry yang sangat besar ke dalam objek JavaScript (Sangat menguras RAM & CPU).
    // Alih-alih, kita rakit raw JSON string secara manual. Ini 100x lebih cepat dan mencegah Vercel Timeout.
    const features = (data || []).map(row => {
      const { geometry, ...properties } = row;
      
      let geomStr = typeof geometry === 'string' ? geometry : JSON.stringify(geometry);
      if (!geomStr || geomStr.trim() === '') geomStr = 'null';
      
      return `{"type":"Feature","geometry":${geomStr},"properties":${JSON.stringify(properties)}}`;
    });

    const finalJsonString = `{"type":"FeatureCollection","features":[${features.join(',')}]}`;

    return new NextResponse(finalJsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' // Cache aggressively at CDN
      }
    });
  } catch (error: any) {
    console.error("GeoJSON API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
