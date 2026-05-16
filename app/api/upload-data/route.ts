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
    
    const rawData = XLSX.utils.sheet_to_json<any>(worksheet);
    
    const inserts = rawData.map(row => {
      const kodeBps = row['Kode Desa BPS'] || row['KODE BPS'] || row['KODE_BPS'] || row['kode_bps'];
      if (!kodeBps) return null; // Wajib ada kode_bps
      
      return {
        kode_bps: String(kodeBps).trim(),
        tahun,
        produksi_padi: Number(row['Produksi Padi (ton)']) || 0,
        produksi_jagung: Number(row['Produksi Jagung (ton)']) || 0,
        produksi_ubi_kayu: Number(row['Produksi Ubi Kayu (ton)']) || 0,
        produksi_ubi_jalar: Number(row['Produksi Ubi Jalar (ton)']) || 0,
        produksi_sagu: Number(row['Produksi Sagu (ton)']) || 0,
        produksi_pisang: Number(row['Produksi Pisang (ton)']) || 0,
        jumlah_penduduk: Number(row['Jumlah Penduduk']) || 0,
        konsumsi_energi: Number(row['Konsumsi Energi (kkal/kap/hr)']) || 0,
        konsumsi_protein: Number(row['Konsumsi Protein Hewani (gr/kap/hr)']) || 0,
        cadangan_cbpd: Number(row['Cadangan CBPD (ton)']) || 0,
        cadangan_lpm: Number(row['Cadangan LPM (ton)']) || 0,
        pct_miskin: Number(row['% Penduduk Miskin (desil 1+2)']) || 0,
        cv_harga_beras: Number(row['CV Harga Beras (%)']) || 0,
        cv_harga_ayam: Number(row['CV Harga Ayam (%)']) || 0,
        cv_harga_telur: Number(row['CV Harga Telur (%)']) || 0,
        cv_harga_minyak: Number(row['CV Harga Minyak (%)']) || 0,
        pou: Number(row['PoU (%)']) || 0,
        lama_sekolah_perempuan: Number(row['Rata-rata Lama Sekolah Perempuan (tahun)']) || 0,
        pct_no_water: Number(row['% RT Tanpa Air Bersih']) || 0,
        skor_pph: Number(row['Skor PPH Konsumsi']) || 0,
        pct_stunting: Number(row['% Balita Stunting']) || 0,
      };
    }).filter(Boolean);

    for (const insertData of inserts) {
       if (!insertData) continue;
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
