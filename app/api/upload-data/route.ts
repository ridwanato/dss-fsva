import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tahunStr = formData.get('tahun') as string;
    const tahun = tahunStr ? parseInt(tahunStr) : 2024;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse to JSON
    // Template columns start from row 2
    const data = XLSX.utils.sheet_to_json<any>(worksheet, { range: 1 }); // Assuming row 1 is header, row 2 is data

    const supabase = getServiceSupabase();
    let inserted = 0;
    const errors: string[] = [];

    const rowsToInsert = data.map((row: any) => {
      // Mapping based on "Format XLSX yang diterima" in the prompt
      // We'll use the column index or generic keys if headers might change.
      // Since sheet_to_json with range: 1 uses row 2 as headers, or we can use header: 'A'
      return null;
    }).filter(Boolean);
    
    // Better to use header: 'A'
    const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 'A', range: 1 }); // range 1 skips first row (the title maybe), assuming row 2 is header
    
    const inserts = rawData.map(row => {
      if (!row.C) return null; // kode_bps
      return {
        kode_bps: String(row.C),
        tahun,
        produksi_padi: Number(row.E) || 0,
        produksi_jagung: Number(row.F) || 0,
        produksi_ubi_kayu: Number(row.G) || 0,
        produksi_ubi_jalar: Number(row.H) || 0,
        produksi_sagu: Number(row.I) || 0,
        produksi_pisang: Number(row.J) || 0,
        jumlah_penduduk: Number(row.K) || 0,
        konsumsi_energi: Number(row.L) || 0,
        konsumsi_protein: Number(row.M) || 0,
        cadangan_cbpd: Number(row.N) || 0,
        cadangan_lpm: Number(row.O) || 0,
        pct_miskin: Number(row.P) || 0,
        cv_harga_beras: Number(row.Q) || 0,
        cv_harga_ayam: Number(row.R) || 0,
        cv_harga_telur: Number(row.S) || 0,
        cv_harga_minyak: Number(row.T) || 0,
        pou: Number(row.U) || 0,
        lama_sekolah_perempuan: Number(row.V) || 0,
        pct_no_water: Number(row.W) || 0,
        skor_pph: Number(row.X) || 0,
        pct_stunting: Number(row.Y) || 0,
      };
    }).filter(Boolean);

    for (const insertData of inserts) {`n       if (!insertData) continue;
       const { error } = await supabase.from('raw_indicators').upsert(insertData, {
         onConflict: 'kode_bps,tahun'
       });
       if (error) {
         errors.push(`Row ${insertData?.kode_bps}: ${error.message}`);
       } else {
         inserted++;
       }
    }

    return NextResponse.json({ success: true, inserted, errors });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
