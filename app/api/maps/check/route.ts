import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';
    const tahunParam = searchParams.get('tahun');

    if (!kabupaten) {
      return NextResponse.json({ exists: false });
    }

    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();

    const supabase = getServiceSupabase();

    // Check if map exists in geometries table
    const { data: geoData, error: geoError } = await supabase
      .from('geometries')
      .select('user_id')
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level)
      .limit(1);

    if (geoError) {
      return NextResponse.json({ success: false, error: geoError.message }, { status: 500 });
    }

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ exists: false, geomExists: false, yearExists: false });
    }

    const mapOwnerId = geoData[0].user_id;
    const currentUserId = session?.user?.id || null;
    const isOwner = Boolean(currentUserId && mapOwnerId === currentUserId);

    let yearExists = true;
    if (tahunParam) {
      const targetYear = parseInt(tahunParam);
      const [{ data: resData }, { data: rawData }] = await Promise.all([
        supabase.from('fsva_results').select('tahun').eq('nama_kabupaten', kabupaten).eq('level', level).eq('tahun', targetYear).limit(1),
        supabase.from('raw_indicators').select('tahun').eq('nama_kabupaten', kabupaten).eq('level', level).eq('tahun', targetYear).limit(1)
      ]);
      yearExists = Boolean((resData && resData.length > 0) || (rawData && rawData.length > 0));
    }

    // Jika milik user sendiri dan tahun yang dipilih belum pernah ada datanya, maka tidak menimpa data tahun lain (misal 2025 tetap aman saat tambah 2026)
    const existsConflict = yearExists || (!isOwner && !!mapOwnerId);

    return NextResponse.json({
      exists: existsConflict,
      geomExists: true,
      yearExists,
      isOwner,
      ownerId: mapOwnerId,
      hasOwner: !!mapOwnerId
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
