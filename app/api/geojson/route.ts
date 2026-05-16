import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

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

    const { data, error } = await query;
    if (error) throw error;

    const features = (data || []).map(row => {
      // ensure geometry is an object
      let geom = row.geometry;
      if (typeof geom === 'string') {
        try { geom = JSON.parse(geom); } catch(e) {}
      }
      
      const { geometry, ...properties } = row;
      return {
        type: 'Feature',
        geometry: geom,
        properties
      };
    });

    const featureCollection = {
      type: 'FeatureCollection',
      features
    };

    return new NextResponse(JSON.stringify(featureCollection), {
      status: 200,
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'max-age=300'
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
