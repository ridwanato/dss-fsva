import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level') || 'kab_kota';
    const tahun = searchParams.get('tahun') || '2026';
    const kabupaten = searchParams.get('kabupaten') || '';
    const form = searchParams.get('form') || 'zip';

    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch raw_indicators with geometries
    let query = authClient
      .from('raw_indicators')
      .select(`
        *,
        geometries ( nama_kabupaten, nama_provinsi, level, kode_bps, kode_kemendagri, nama_kecamatan, nama_desa )
      `)
      .eq('tahun', tahun)
      .eq('user_id', userId)
      .eq('level', level);

    if (kabupaten) {
      query = query.eq('nama_kabupaten', kabupaten);
    }

    const { data: rawData, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    // Fetch fsva_results to merge priority calculations if available
    const { data: resultsData } = await authClient
      .from('fsva_results')
      .select('*')
      .eq('tahun', tahun)
      .eq('user_id', userId)
      .eq('level', level);

    const resultMap = new Map<string, any>();
    (resultsData || []).forEach((r: any) => {
      const key = `${r.kode_bps}_${r.nama_kabupaten}`;
      resultMap.set(key, r);
    });

    const formattedRows = (rawData || []).map((row: any) => {
      const key = `${row.kode_bps}_${row.nama_kabupaten}`;
      const calc = resultMap.get(key) || {};
      const geom = row.geometries || {};

      return {
        nama_kabupaten: row.nama_kabupaten || geom.nama_kabupaten || '',
        nama_kecamatan: geom.nama_kecamatan || row.nama_kabupaten || '',
        nama_desa: geom.nama_desa || row.nama_kabupaten || '',
        kode_bps: row.kode_bps || geom.kode_bps || '',
        kode_kemendagri: geom.kode_kemendagri || row.kode_bps || '',
        kode_kecamatan: geom.kode_kecamatan || (row.kode_bps && String(row.kode_bps).length >= 7 ? String(row.kode_bps).substring(0, 7) : ''),

        // Raw inputs
        produksi_padi: row.produksi_padi || 0,
        produksi_jagung: row.produksi_jagung || 0,
        produksi_ubi_kayu: row.produksi_ubi_kayu || 0,
        produksi_ubi_jalar: row.produksi_ubi_jalar || 0,
        produksi_sagu: row.produksi_sagu || 0,
        produksi_pisang: row.produksi_pisang || 0,
        jumlah_penduduk: row.jumlah_penduduk || 0,
        konsumsi_energi: row.konsumsi_energi || 0,
        konsumsi_protein: row.konsumsi_protein || 0,
        cadangan_cbpd: row.cadangan_cbpd || 0,
        cadangan_lpm: row.cadangan_lpm || 0,
        cbpk: row.cbpk || 0,
        jumlah_penduduk_kab: row.jumlah_penduduk_kab || row.jumlah_penduduk || 0,
        pct_miskin: row.pct_miskin || 0,
        cv_harga_beras: row.cv_harga_beras || 0,
        cv_harga_ayam: row.cv_harga_ayam || 0,
        cv_harga_telur: row.cv_harga_telur || 0,
        cv_harga_minyak: row.cv_harga_minyak || 0,
        pou: row.pou || 0,
        lama_sekolah_perempuan: row.lama_sekolah_perempuan || 0,
        pct_no_water: row.pct_no_water || 0,
        skor_pph: row.skor_pph || 0,
        pct_stunting: row.pct_stunting || 0,

        // Computed calculated indicators & priorities if available
        ncpr: calc.ncpr || 0,
        pct_ake: calc.pct_ake || 0,
        pct_prohe: calc.pct_prohe || 0,
        rasio_cadangan: calc.rasio_cadangan || 0,
        cv_harga: calc.cv_harga || 0,
        lama_sekolah: calc.lama_sekolah || row.lama_sekolah_perempuan || 0,
        p_ncpr: calc.p_ncpr || 6,
        p_energy: calc.p_energy || 6,
        p_protein: calc.p_protein || 6,
        p_cadangan: calc.p_cadangan || 6,
        p_poverty: calc.p_poverty || 6,
        p_cv_harga: calc.p_cv_harga || 6,
        p_pou: calc.p_pou || 6,
        p_sekolah: calc.p_sekolah || 6,
        p_air: calc.p_air || 6,
        p_pph: calc.p_pph || 6,
        p_stunting: calc.p_stunting || 4,
        indeks_komposit: calc.indeks_komposit || 0,
        prioritas: calc.prioritas || 6,
      };
    });

    const tempDir = path.join(process.cwd(), 'tmp', 'exports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const payloadPath = path.join(tempDir, `payload_${Date.now()}.json`);
    fs.writeFileSync(payloadPath, JSON.stringify({
      level,
      tahun,
      kabupaten,
      rows: formattedRows
    }));

    const scriptPath = path.join(process.cwd(), 'lib', 'fsva', 'generate_v2_export.py');
    const pythonCmd = `python "${scriptPath}" "${level}" "${payloadPath}" "${tempDir}" "${form}"`;

    const { stdout, stderr } = await execAsync(pythonCmd);
    
    // Clean up payload file
    if (fs.existsSync(payloadPath)) {
      fs.unlinkSync(payloadPath);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(stdout.trim());
    } catch (e) {
      console.error('Python Output:', stdout, stderr);
      throw new Error(`Gagal memproses file template Excel: ${stderr || stdout}`);
    }

    if (!parsedResult.success || !parsedResult.file_path) {
      throw new Error(parsedResult.error || 'Terjadi kesalahan saat memproduksi file export');
    }

    const fileBuffer = fs.readFileSync(parsedResult.file_path);
    const fileName = parsedResult.zip_name || parsedResult.file_name || 'FSVA_V2_Export.xlsx';

    // Clean up output file after reading into buffer
    if (fs.existsSync(parsedResult.file_path)) {
      fs.unlinkSync(parsedResult.file_path);
    }

    const isZip = fileName.endsWith('.zip');
    const contentType = isZip 
      ? 'application/zip' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Export V2 error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
