import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tahunStr = formData.get('tahun') as string;
    const tahun = tahunStr ? parseInt(tahunStr) : 2024;
    const kabupaten = formData.get('kabupaten') as string;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Nama peta / kabupaten wajib diisi' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse to JSON
    // Template columns start from row 2
    const data = XLSX.utils.sheet_to_json<any>(worksheet, { range: 1 }); // Assuming row 1 is header, row 2 is data

    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Ambil daftar geometri untuk kabupaten tertentu saja untuk auto-matching
    const { data: geomData } = await authClient
      .from('geometries')
      .select('kode_bps, nama_desa')
      .eq('nama_kabupaten', kabupaten);
    const geomList = geomData || [];
    
    // Helper untuk membersihkan nama desa (hapus kelurahan/desa, spasi, huruf kecil)
    const cleanName = (name: string) => {
      if (!name) return '';
      return String(name).toLowerCase()
        .replace(/^(kelurahan|kel\.|desa)\s+/i, '')
        .replace(/[^a-z0-9]/g, '');
    };

    // Helper Levenshtein distance untuk pencocokan nama desa secara fuzzy
    const getLevenshtein = (a: string, b: string) => {
      const tmp = [];
      let i, j, alen = a.length, blen = b.length;
      if (alen === 0) return blen;
      if (blen === 0) return alen;
      for (i = 0; i <= alen; i++) tmp[i] = [i];
      for (j = 0; j <= blen; j++) tmp[0][j] = j;
      for (i = 1; i <= alen; i++) {
        for (j = 1; j <= blen; j++) {
          tmp[i][j] = Math.min(
            tmp[i - 1][j] + 1,
            tmp[i][j - 1] + 1,
            tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
          );
        }
      }
      return tmp[alen][blen];
    };

    let inserted = 0;
    const errors: string[] = [];

    const rawData = XLSX.utils.sheet_to_json<any>(worksheet);
    
    const inserts = rawData.map(row => {
      const norm: any = {};
      for (const key in row) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        norm[normalizedKey] = row[key];
      }

      let rawKodeBps = String(norm['kodedesabps'] || norm['kodebps'] || '').trim();
      let namaDesaExcel = String(norm['namadesakelurahan'] || norm['namadesa'] || '').trim();
      
      if (!rawKodeBps && !namaDesaExcel) return null;

      // 1. Coba cari match persis kode_bps
      let matchedGeom = geomList.find(g => g.kode_bps.replace(/\./g, '') === rawKodeBps.replace(/\./g, ''));
      
      // 2. Jika kode BPS beda, coba match berdasarkan nama desa (exact match)
      if (!matchedGeom && namaDesaExcel) {
        const cleanedExcelName = cleanName(namaDesaExcel);
        matchedGeom = geomList.find(g => cleanName(g.nama_desa) === cleanedExcelName);
      }

      // 3. Jika tetap tidak ketemu, lakukan fuzzy matching berbasis Levenshtein distance
      if (!matchedGeom && namaDesaExcel) {
        const cleanedExcelName = cleanName(namaDesaExcel);
        let bestMatch = null;
        let bestScore = 0;
        
        for (const g of geomList) {
          const cleanedGeomName = cleanName(g.nama_desa);
          const dist = getLevenshtein(cleanedExcelName, cleanedGeomName);
          const maxLen = Math.max(cleanedExcelName.length, cleanedGeomName.length);
          const score = 1 - dist / maxLen;
          
          // Izinkan eror penulisan hingga maksimal 2 karakter dan tingkat kemiripan >= 75%
          if (score > bestScore && dist <= 2 && score >= 0.75) {
            bestScore = score;
            bestMatch = g;
          }
        }
        
        if (bestMatch) {
          matchedGeom = bestMatch;
        }
      }

      // Jika tetap tidak ketemu, pakai rawKodeBps (tapi mungkin akan gagal Foreign Key)
      const finalKodeBps = matchedGeom ? matchedGeom.kode_bps : rawKodeBps;
      
      if (!finalKodeBps) return null;
      
      return {
        kode_bps: finalKodeBps,
        nama_kabupaten: kabupaten,
        user_id: userId,
        tahun,
        produksi_padi: Number(norm['produksipaditon'] || norm['produksipadi']) || 0,
        produksi_jagung: Number(norm['produksijagungton'] || norm['produksijagung']) || 0,
        produksi_ubi_kayu: Number(norm['produksiubikayuton'] || norm['produksiubikayu']) || 0,
        produksi_ubi_jalar: Number(norm['produksiubijalarton'] || norm['produksiubijalar']) || 0,
        produksi_sagu: Number(norm['produksisaguton'] || norm['produksisagu']) || 0,
        produksi_pisang: Number(norm['produksipisangton'] || norm['produksipisang']) || 0,
        jumlah_penduduk: Number(norm['jumlahpenduduk']) || 0,
        konsumsi_energi: Number(norm['konsumsienergikkalkaphr'] || norm['konsumsienergi']) || 0,
        konsumsi_protein: Number(norm['konsumsiproteinhewanigrkaphr'] || norm['konsumsiprotein']) || 0,
        cadangan_cbpd: Number(norm['cadangancbpdton'] || norm['cadangancbpd']) || 0,
        cadangan_lpm: Number(norm['cadanganlpmton'] || norm['cadanganlpm']) || 0,
        pct_miskin: Number(norm['pendudukmiskindesil12'] || norm['pctmiskin'] || norm['pendudukmiskin']) || 0,
        cv_harga_beras: Number(norm['cvhargaberas']) || 0,
        cv_harga_ayam: Number(norm['cvhargaayam']) || 0,
        cv_harga_telur: Number(norm['cvhargatelur']) || 0,
        cv_harga_minyak: Number(norm['cvhargaminyak']) || 0,
        pou: Number(norm['pou']) || 0,
        lama_sekolah_perempuan: Number(norm['rataratalamasekolahperempuantahun'] || norm['lamasekolah']) || 0,
        pct_no_water: Number(norm['rttanpaairbersih'] || norm['pctnowater']) || 0,
        skor_pph: Number(norm['skorpphkonsumsi'] || norm['skorpph']) || 0,
        pct_stunting: Number(norm['balitastunting'] || norm['pctstunting']) || 0,
      };
    }).filter(Boolean);

    for (const insertData of inserts) {
       if (!insertData) continue;
       const { error } = await authClient.from('raw_indicators').upsert(insertData, {
         onConflict: 'nama_kabupaten,kode_bps,tahun'
       });
       if (error) {
         errors.push(`Gagal menyimpan desa kode ${insertData.kode_bps}: ${error.message}`);
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
