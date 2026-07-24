import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  const supabase = getServiceSupabase();
  // Fetch distinct kabupaten/provinsi names, user_id, and level from geometries
  const { data, error } = await supabase
    .from('geometries')
    .select('nama_kabupaten, user_id, level')
    .not('nama_kabupaten', 'is', null);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Deduplicate based on name and level
  const uniqueMaps: Record<string, any> = {};
  if (data) {
    for (const item of data) {
      if (item.nama_kabupaten) {
        const lvl = item.level || 'kab_kota';
        const key = `${lvl}:${item.nama_kabupaten}`;
        uniqueMaps[key] = {
          nama_kabupaten: item.nama_kabupaten,
          user_id: item.user_id || null,
          level: lvl
        };
      }
    }
  }

  // Fetch distinct maps and their latest year from fsva_results
  const { data: yearData } = await supabase
    .from('fsva_results')
    .select('nama_kabupaten, level, tahun');

  const mapYears: Record<string, number> = {};
  if (yearData) {
    for (const item of yearData) {
      if (item.nama_kabupaten && item.tahun) {
        const lvl = item.level || 'kab_kota';
        const key = `${lvl}:${item.nama_kabupaten}`;
        mapYears[key] = Math.max(mapYears[key] || 0, item.tahun);
      }
    }
  }

  const mapDetails = Object.values(uniqueMaps).map((m: any) => {
    const key = `${m.level}:${m.nama_kabupaten}`;
    return {
      nama_kabupaten: m.nama_kabupaten,
      level: m.level,
      tahun: mapYears[key] || 2025, // Default fallback to 2025
      user_id: m.user_id
    };
  });

  const mapNames = mapDetails.map(m => m.nama_kabupaten);

  return NextResponse.json({ success: true, maps: mapNames, mapDetails });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Nama kabupaten/provinsi peta wajib diisi.' }, { status: 400 });
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
      .eq('level', level)
      .limit(1);

    if (ownerError) {
      return NextResponse.json({ success: false, error: ownerError.message }, { status: 500 });
    }

    if (!geoOwner || geoOwner.length === 0) {
      return NextResponse.json({ success: false, error: 'Peta tidak ditemukan.' }, { status: 404 });
    }

    const mapOwnerId = geoOwner[0].user_id;

    // Jika peta diunggah oleh user lain (user_id tidak cocok) dan bukan admin
    const adminEmails = process.env.ADMIN_EMAILS 
      ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
      : ['admin@email.com', 'admin@fsva.go.id', 'ketapangcilegon@gmail.com'];
    const isAdmin = adminEmails.includes(session.user.email?.toLowerCase() || '') || session.user.user_metadata?.role === 'admin';

    if (mapOwnerId && mapOwnerId !== session.user.id && !isAdmin) {
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
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Peta "${kabupaten}" (${level}) berhasil dihapus.` });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
