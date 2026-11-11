import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  const supabase = getServiceSupabase();
  // Fetch distinct kabupaten/provinsi names, user_id, level, and created_at from geometries
  const { data, error } = await supabase
    .from('geometries')
    .select('nama_kabupaten, user_id, level, created_at')
    .not('nama_kabupaten', 'is', null);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Deduplicate based on name and level, keeping the latest created_at
  const uniqueMaps: Record<string, any> = {};
  if (data) {
    for (const item of data) {
      if (item.nama_kabupaten) {
        const lvl = item.level || 'kab_kota';
        const key = `${lvl}:${item.nama_kabupaten}`;
        const itemDate = item.created_at ? new Date(item.created_at).getTime() : 0;
        const existingDate = uniqueMaps[key]?.created_time || 0;
        
        if (!uniqueMaps[key] || itemDate > existingDate) {
          uniqueMaps[key] = {
            nama_kabupaten: item.nama_kabupaten,
            user_id: item.user_id || null,
            level: lvl,
            created_at: item.created_at,
            created_time: itemDate
          };
        }
      }
    }
  }

  // Fetch distinct maps and all their years from fsva_results & raw_indicators
  const [{ data: yearData }, { data: rawYearData }] = await Promise.all([
    supabase.from('fsva_results').select('nama_kabupaten, level, tahun'),
    supabase.from('raw_indicators').select('nama_kabupaten, level, tahun')
  ]);

  const mapYearsSet: Record<string, Set<number>> = {};
  if (yearData) {
    for (const item of yearData) {
      if (item.nama_kabupaten && item.tahun) {
        const lvl = item.level || 'kab_kota';
        const key = `${lvl}:${item.nama_kabupaten}`;
        if (!mapYearsSet[key]) mapYearsSet[key] = new Set();
        mapYearsSet[key].add(Number(item.tahun));
      }
    }
  }
  if (rawYearData) {
    for (const item of rawYearData) {
      if (item.nama_kabupaten && item.tahun) {
        const lvl = item.level || 'kab_kota';
        const key = `${lvl}:${item.nama_kabupaten}`;
        if (!mapYearsSet[key]) mapYearsSet[key] = new Set();
        mapYearsSet[key].add(Number(item.tahun));
      }
    }
  }

  const mapDetails: any[] = [];
  for (const m of Object.values(uniqueMaps) as any[]) {
    const key = `${m.level}:${m.nama_kabupaten}`;
    const years = mapYearsSet[key] ? Array.from(mapYearsSet[key]).sort((a, b) => b - a) : [2025];
    for (const yr of years) {
      const hasYearInName = m.nama_kabupaten.includes(String(yr));
      mapDetails.push({
        nama_kabupaten: m.nama_kabupaten,
        display_name: hasYearInName ? m.nama_kabupaten : `${m.nama_kabupaten} ${yr}`,
        level: m.level,
        tahun: yr,
        user_id: m.user_id,
        created_at: m.created_at
      });
    }
  }

  // Sort mapDetails so that the latest created map (and latest year) is first
  mapDetails.sort((a: any, b: any) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.tahun || 0) - (a.tahun || 0);
  });

  const mapNames = Array.from(new Set(mapDetails.map(m => m.nama_kabupaten)));

  return NextResponse.json({ success: true, maps: mapNames, mapDetails });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';
    const tahunParam = searchParams.get('tahun');

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

    if (tahunParam) {
      const targetYear = parseInt(tahunParam);
      await supabase.from('fsva_results').delete().eq('nama_kabupaten', kabupaten).eq('level', level).eq('tahun', targetYear);
      await supabase.from('raw_indicators').delete().eq('nama_kabupaten', kabupaten).eq('level', level).eq('tahun', targetYear);

      const [{ data: remRes }, { data: remRaw }] = await Promise.all([
        supabase.from('fsva_results').select('tahun').eq('nama_kabupaten', kabupaten).eq('level', level).limit(1),
        supabase.from('raw_indicators').select('tahun').eq('nama_kabupaten', kabupaten).eq('level', level).limit(1)
      ]);

      const stillHasOtherYears = (remRes && remRes.length > 0) || (remRaw && remRaw.length > 0);
      if (!stillHasOtherYears) {
        const { error } = await supabase.from('geometries').delete().eq('nama_kabupaten', kabupaten).eq('level', level);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: `Peta "${kabupaten} ${targetYear}" (${level}) berhasil dihapus.` });
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
