import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

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

    const { data, error } = await query;
    if (error) throw error;

    // Formatting for XLSX
    const wsData = (data || []).map((row, idx) => ({
      'No': idx + 1,
      'Nama Kecamatan': row.nama_kecamatan,
      'Kode Desa BPS': row.kode_bps,
      'Nama Desa/Kelurahan': row.nama_desa,
      'Tahun': row.tahun,
      'Prioritas': row.prioritas,
      'Indeks Komposit': row.indeks_komposit,
      'NCPR': row.ncpr,
      '% AKE': row.pct_ake,
      '% Prohe': row.pct_prohe,
      'Rasio Cadangan': row.rasio_cadangan,
      'CV Harga': row.cv_harga,
      'PoU': row.pou,
      '% Miskin': row.pct_miskin_ref,
      'Lama Sekolah': row.lama_sekolah,
      '% Tanpa Akses Air': row.pct_no_water,
      'Skor PPH': row.skor_pph,
      '% Stunting': row.pct_stunting,
      'Indeks Ketersediaan': row.indeks_ketersediaan,
      'Indeks Keterjangkauan': row.indeks_keterjangkauan,
      'Indeks Pemanfaatan': row.indeks_pemanfaatan,
    }));

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
