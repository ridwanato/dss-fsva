import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  const supabase = getServiceSupabase();
  // Fetch distinct kabupaten names and their user_id from geometries
  const { data, error } = await supabase
    .from('geometries')
    .select('nama_kabupaten, user_id')
    .not('nama_kabupaten', 'is', null);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Deduplicate and sort
  const mapNames = Array.from(new Set(data.map(d => d.nama_kabupaten))).filter(Boolean).sort() as string[];

  // Map each kabupaten to its owner user_id
  const mapUserIds: Record<string, string | null> = {};
  if (data) {
    for (const item of data) {
      if (item.nama_kabupaten) {
        mapUserIds[item.nama_kabupaten] = item.user_id || null;
      }
    }
  }

  // Fetch distinct maps and their latest year from fsva_results
  const { data: yearData } = await supabase
    .from('fsva_results')
    .select('nama_kabupaten, tahun');

  const mapYears: Record<string, number> = {};
  if (yearData) {
    for (const item of yearData) {
      if (item.nama_kabupaten && item.tahun) {
        mapYears[item.nama_kabupaten] = Math.max(mapYears[item.nama_kabupaten] || 0, item.tahun);
      }
    }
  }

  const mapDetails = mapNames.map(name => ({
    nama_kabupaten: name,
    tahun: mapYears[name] || 2025, // Default fallback to 2025
    user_id: mapUserIds[name] || null
  }));

  return NextResponse.json({ success: true, maps: mapNames, mapDetails });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Nama kabupaten/peta wajib diisi.' }, { status: 400 });
    }

    // Pastikan user terautentikasi (login) sebelum mengizinkan penghapusan
    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Verifikasi kepemilikan peta sebelum dihapus
    const { data: geoOwner, error: ownerError } = await supabase
      .from('geometries')
      .select('user_id')
      .eq('nama_kabupaten', kabupaten)
      .limit(1);

    if (ownerError) {
      return NextResponse.json({ success: false, error: ownerError.message }, { status: 500 });
    }

    if (!geoOwner || geoOwner.length === 0) {
      return NextResponse.json({ success: false, error: 'Peta tidak ditemukan.' }, { status: 404 });
    }

    const mapOwnerId = geoOwner[0].user_id;

    // Jika peta diunggah oleh user lain (user_id tidak cocok)
    if (mapOwnerId && mapOwnerId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: 'Anda hanya dapat menghapus peta yang Anda unggah sendiri.'
      }, { status: 403 });
    }

    // Jika user_id kosong, kita anggap itu peta publik/sistem, normal user tidak boleh menghapusnya
    if (!mapOwnerId) {
      return NextResponse.json({
        success: false,
        error: 'Peta sistem/publik tidak dapat dihapus.'
      }, { status: 403 });
    }
    
    // Hapus dari geometries (cascade akan otomatis menghapus di raw_indicators dan fsva_results)
    const { error } = await supabase
      .from('geometries')
      .delete()
      .eq('nama_kabupaten', kabupaten);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Peta kabupaten "${kabupaten}" berhasil dihapus.` });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
