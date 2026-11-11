import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { GKG_CONVERSION, PROVINCE_CODE_TO_NAME } from '@/lib/fsva/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    // Coba ambil dari tabel database Supabase jika tabel sudah dibuat
    const { data: dbData, error } = await supabase
      .from('konversi_gkg')
      .select('*')
      .order('nilai_desimal', { ascending: false });

    if (!error && dbData && dbData.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'supabase_table',
        data: dbData
      });
    }

    // Fallback: gunakan konstanta bawaan dari lib/fsva/constants.ts
    const fallbackData = Object.entries(GKG_CONVERSION).map(([nama_provinsi, nilai_desimal], idx) => {
      // Cari kode provinsi jika ada di mapping
      const kode_provinsi = Object.entries(PROVINCE_CODE_TO_NAME).find(([k, v]) => v === nama_provinsi)?.[0] || '00';
      return {
        id: idx + 1,
        kode_provinsi,
        nama_provinsi,
        nilai_persen: +(nilai_desimal * 100).toFixed(2),
        nilai_desimal,
        keterangan: 'BPS / Juknis Bapanas'
      };
    }).sort((a, b) => b.nilai_desimal - a.nilai_desimal);

    return NextResponse.json({
      success: true,
      source: 'constants_fallback',
      data: fallbackData
    });
  } catch (err: any) {
    console.error('Error in konversi-gkg route:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

