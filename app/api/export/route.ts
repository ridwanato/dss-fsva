import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tahunStr = url.searchParams.get('tahun');
    const kabupaten = url.searchParams.get('kabupaten');
    const tahun = tahunStr ? parseInt(tahunStr) : 2025; // Default to 2025

    const supabase = getServiceSupabase();

    // 1. Fetch geometries for this kabupaten (or all geometries if not specified)
    let geomQuery = supabase
      .from('geometries')
      .select('kode_bps, nama_desa, nama_kecamatan, nama_kabupaten, user_id');

    if (kabupaten) {
      geomQuery = geomQuery.eq('nama_kabupaten', kabupaten);
    }

    const { data: geomData, error: geomError } = await geomQuery;
    if (geomError) throw geomError;

    if (!geomData || geomData.length === 0) {
      return NextResponse.json({ success: false, error: 'Data wilayah tidak ditemukan.' }, { status: 404 });
    }

    const codes = geomData.map(g => g.kode_bps);

    // 2. Fetch calculations and raw indicators in parallel
    const [resPromise, rawPromise] = await Promise.all([
      supabase.from('fsva_results').select('*').eq('tahun', tahun).in('kode_bps', codes),
      supabase.from('raw_indicators').select('*').eq('tahun', tahun).in('kode_bps', codes)
    ]);

    if (resPromise.error) throw resPromise.error;
    if (rawPromise.error) throw rawPromise.error;

    const resData = resPromise.data || [];
    const rawData = rawPromise.data || [];

    // Map by kode_bps for O(1) lookup
    const resMap: Record<string, any> = {};
    for (const r of resData) {
      resMap[r.kode_bps] = r;
    }

    const rawMap: Record<string, any> = {};
    for (const r of rawData) {
      rawMap[r.kode_bps] = r;
    }

    // 3. Merge them and format for XLSX
    // Filter only those villages that have calculation results to match original export behavior
    const exportRows = geomData
      .map(geom => {
        const fsvaRes = resMap[geom.kode_bps];
        const rawInd = rawMap[geom.kode_bps];

        if (!fsvaRes) return null;

        return {
          geom,
          fsvaRes,
          rawInd
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const wsData = exportRows.map((row, idx) => {
      const { geom, fsvaRes, rawInd } = row;
      return {
        'No': idx + 1,
        'Nama Kecamatan': geom.nama_kecamatan || '',
        'Kode Desa BPS': geom.kode_bps || '',
        'Nama Desa/Kelurahan': geom.nama_desa || '',
        'Tahun': fsvaRes.tahun || tahun,
        'Prioritas': fsvaRes.prioritas || '',
        'Indeks Komposit': fsvaRes.indeks_komposit !== undefined ? fsvaRes.indeks_komposit : '',
        'NCPR': fsvaRes.ncpr !== undefined ? fsvaRes.ncpr : '',
        '% AKE': fsvaRes.pct_ake !== undefined ? fsvaRes.pct_ake : '',
        '% Prohe': fsvaRes.pct_prohe !== undefined ? fsvaRes.pct_prohe : '',
        'Rasio Cadangan': fsvaRes.rasio_cadangan !== undefined ? fsvaRes.rasio_cadangan : '',
        'CV Harga': fsvaRes.cv_harga !== undefined ? fsvaRes.cv_harga : '',
        'PoU': rawInd?.pou !== undefined ? rawInd.pou : '',
        '% Miskin': rawInd?.pct_miskin !== undefined ? rawInd.pct_miskin : '',
        'Lama Sekolah': rawInd?.lama_sekolah_perempuan !== undefined ? rawInd.lama_sekolah_perempuan : '',
        '% Tanpa Akses Air': rawInd?.pct_no_water !== undefined ? rawInd.pct_no_water : '',
        'Skor PPH': rawInd?.skor_pph !== undefined ? rawInd.skor_pph : '',
        '% Stunting': rawInd?.pct_stunting !== undefined ? rawInd.pct_stunting : '',
        'Indeks Ketersediaan': fsvaRes.indeks_ketersediaan !== undefined ? fsvaRes.indeks_ketersediaan : '',
        'Indeks Keterjangkauan': fsvaRes.indeks_keterjangkauan !== undefined ? fsvaRes.indeks_keterjangkauan : '',
        'Indeks Pemanfaatan': fsvaRes.indeks_pemanfaatan !== undefined ? fsvaRes.indeks_pemanfaatan : '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil FSVA');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="fsva_hasil_${tahun}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
