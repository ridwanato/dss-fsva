import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tahunStr = formData.get('tahun') as string;
    let tahun = tahunStr ? parseInt(tahunStr) : 2025; // Default to 2025
    const kabupaten = formData.get('kabupaten') as string;
    const level = (formData.get('level') as string) || 'kab_kota';
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Nama peta / kabupaten wajib diisi' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Ambil daftar geometri untuk kabupaten/provinsi tertentu saja untuk auto-matching
    const { data: geomData } = await authClient
      .from('geometries')
      .select('kode_bps, nama_desa')
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level);
    const geomList = geomData || [];
    
    // Helper untuk membersihkan nama desa/kecamatan (hapus kelurahan/desa, spasi, huruf kecil)
    const cleanName = (name: string) => {
      if (!name) return '';
      return String(name).toLowerCase()
        .replace(/^(kelurahan|kel\.|desa|kecamatan|kec\.)\s+/i, '')
        .replace(/[^a-z0-9]/g, '');
    };

    // Helper Levenshtein distance untuk pencocokan nama secara fuzzy
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
    let inserts: any[] = [];

    if (level === 'provinsi') {
      const isSingleSheet = !workbook.Sheets['0.1 Produksi Pangan & Penduduk'] && !workbook.Sheets['0.2 Konsumsi Energi'];
      const mapData: Record<string, any> = {};
      const cleanCode = (code: any) => String(code || '').trim().replace(/\./g, '');
      const getFloat = (val: any) => {
        if (val === undefined || val === null || val === '') return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };

      if (isSingleSheet) {
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        
        if (rows[0] && String(rows[0][0]).includes('TAHUN KALKULASI')) {
          const parsedYear = parseInt(rows[0][1]);
          if (!isNaN(parsedYear)) {
            tahun = parsedYear;
          }
        }

        for (let i = 3; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 3) continue;
          const rawCode = String(row[2] || '').trim();
          if (!rawCode) continue;
          const code = cleanCode(rawCode);

          mapData[code] = {
            kode_bps: rawCode,
            nama_kecamatan: String(row[1] || '').trim(),
            produksi_padi: getFloat(row[3]),
            produksi_jagung: getFloat(row[4]),
            produksi_ubi_kayu: getFloat(row[5]),
            produksi_ubi_jalar: getFloat(row[6]),
            produksi_sagu: getFloat(row[7]),
            produksi_pisang: getFloat(row[8]),
            jumlah_penduduk: getFloat(row[9]),
            konsumsi_energi: getFloat(row[10]),
            konsumsi_protein: getFloat(row[11]),
            cbpp: getFloat(row[12]),
            jumlah_penduduk_prov: getFloat(row[13]),
            cbpk: getFloat(row[14]),
            jumlah_penduduk_kab: getFloat(row[15]),
            cbp_kec: getFloat(row[16]),
            pct_miskin: getFloat(row[17]),
            cv_harga_beras: getFloat(row[18]),
            cv_harga_ayam: getFloat(row[19]),
            cv_harga_telur: getFloat(row[20]),
            cv_harga_minyak: getFloat(row[21]),
            pou: getFloat(row[22]),
            lama_sekolah_perempuan: getFloat(row[23]),
            pct_no_water: getFloat(row[24]),
            segar: getFloat(row[25]),
            siap_saji: getFloat(row[26]),
            skor_pph: getFloat(row[27]),
            pct_stunting: getFloat(row[28]),
          };
        }
      } else {
        // PROVINSI FLOW: Multi-sheet parsing (0.1 s.d. 0.6)
        const sheet01 = workbook.Sheets['0.1 Produksi Pangan & Penduduk'] || workbook.Sheets[workbook.SheetNames[0]];
        const sheet02 = workbook.Sheets['0.2 Konsumsi Energi'] || workbook.Sheets[workbook.SheetNames[1]];
        const sheet03 = workbook.Sheets['0.3 Konsumsi Protein Hewani'] || workbook.Sheets[workbook.SheetNames[2]];
        const sheet04 = workbook.Sheets['0.4 Stok_Cadangan'] || workbook.Sheets[workbook.SheetNames[3]];
        const sheet05 = workbook.Sheets['0.5 Indikator Keterjangkauan'] || workbook.Sheets[workbook.SheetNames[4]];
        const sheet06 = workbook.Sheets['0.6 Indikator Pemanfaatan'] || workbook.Sheets[workbook.SheetNames[5]];

        const d01 = XLSX.utils.sheet_to_json<any[]>(sheet01, { header: 1 });
        const d02 = XLSX.utils.sheet_to_json<any[]>(sheet02, { header: 1 });
        const d03 = XLSX.utils.sheet_to_json<any[]>(sheet03, { header: 1 });
        const d04 = XLSX.utils.sheet_to_json<any[]>(sheet04, { header: 1 });
        const d05 = XLSX.utils.sheet_to_json<any[]>(sheet05, { header: 1 });
        const d06 = XLSX.utils.sheet_to_json<any[]>(sheet06, { header: 1 });

        const findStartRow = (data: any[][]) => {
          for (let r = 4; r < data.length; r++) {
            const code = String(data[r]?.[4] || '').trim();
            if (code && /^\d+$/.test(code.replace(/\./g, ''))) {
              return r;
            }
          }
          return 5;
        };

        const start01 = findStartRow(d01);
        for (let r = start01; r < d01.length; r++) {
          const row = d01[r];
          if (!row || row.length < 5) continue;
          const rawCode = String(row[4] || '').trim();
          if (!rawCode) continue;
          const code = cleanCode(rawCode);
          
          mapData[code] = {
            kode_bps: rawCode,
            nama_kecamatan: String(row[5] || '').trim(),
            produksi_padi: getFloat(row[9]),
            produksi_jagung: getFloat(row[18]),
            produksi_ubi_kayu: getFloat(row[24]),
            produksi_ubi_jalar: getFloat(row[30]),
            produksi_sagu: getFloat(row[36]),
            produksi_pisang: getFloat(row[42]),
            jumlah_penduduk: getFloat(row[46]) || getFloat(row[50]) || 0,
          };
        }

        const start02 = findStartRow(d02);
        for (let r = start02; r < d02.length; r++) {
          const row = d02[r];
          if (!row) continue;
          const code = cleanCode(row[4]);
          if (mapData[code]) {
            mapData[code].konsumsi_energi = getFloat(row[9]);
          }
        }

        const start03 = findStartRow(d03);
        for (let r = start03; r < d03.length; r++) {
          const row = d03[r];
          if (!row) continue;
          const code = cleanCode(row[4]);
          if (mapData[code]) {
            mapData[code].konsumsi_protein = getFloat(row[9]);
          }
        }

        const start04 = findStartRow(d04);
        for (let r = start04; r < d04.length; r++) {
          const row = d04[r];
          if (!row) continue;
          const code = cleanCode(row[4]);
          if (mapData[code]) {
            mapData[code].cbpp = getFloat(row[9]);
            mapData[code].jumlah_penduduk_prov = getFloat(row[12]);
            mapData[code].cbpk = getFloat(row[19]);
            mapData[code].jumlah_penduduk_kab = getFloat(row[22]);
            mapData[code].cbp_kec = getFloat(row[31]);
          }
        }

        const start05 = findStartRow(d05);
        for (let r = start05; r < d05.length; r++) {
          const row = d05[r];
          if (!row) continue;
          const code = cleanCode(row[4]);
          if (mapData[code]) {
            mapData[code].pct_miskin = getFloat(row[9]);
            mapData[code].cv_harga_beras = getFloat(row[15]);
            mapData[code].cv_harga_ayam = getFloat(row[19]);
            mapData[code].cv_harga_telur = getFloat(row[23]);
            mapData[code].cv_harga_minyak = getFloat(row[27]);
            mapData[code].pou = getFloat(row[34]);
          }
        }

        const start06 = findStartRow(d06);
        for (let r = start06; r < d06.length; r++) {
          const row = d06[r];
          if (!row) continue;
          const code = cleanCode(row[4]);
          if (mapData[code]) {
            mapData[code].lama_sekolah_perempuan = getFloat(row[9]);
            mapData[code].pct_no_water = getFloat(row[15]);
            mapData[code].segar = getFloat(row[21]);
            mapData[code].siap_saji = getFloat(row[25]);
            mapData[code].skor_pph = getFloat(row[32]);
            mapData[code].pct_stunting = getFloat(row[38]);
          }
        }
      }

      inserts = Object.values(mapData).map(row => {
        let rawKodeBps = String(row.kode_bps).trim();
        let namaKecExcel = String(row.nama_kecamatan).trim();

        // 1. Coba cari match persis kode_bps
        let matchedGeom = geomList.find(g => g.kode_bps.replace(/\./g, '') === rawKodeBps.replace(/\./g, ''));
        
        // 2. Jika kode BPS beda, coba match berdasarkan nama
        if (!matchedGeom && namaKecExcel) {
          const cleanedExcelName = cleanName(namaKecExcel);
          matchedGeom = geomList.find(g => cleanName(g.nama_desa) === cleanedExcelName);
        }

        // 3. Fuzzy matching
        if (!matchedGeom && namaKecExcel) {
          const cleanedExcelName = cleanName(namaKecExcel);
          let bestMatch = null;
          let bestScore = 0;
          
          for (const g of geomList) {
            const cleanedGeomName = cleanName(g.nama_desa);
            const dist = getLevenshtein(cleanedExcelName, cleanedGeomName);
            const maxLen = Math.max(cleanedExcelName.length, cleanedGeomName.length);
            const score = 1 - dist / maxLen;
            
            if (score > bestScore && dist <= 2 && score >= 0.75) {
              bestScore = score;
              bestMatch = g;
            }
          }
          if (bestMatch) matchedGeom = bestMatch;
        }

        const finalKodeBps = matchedGeom ? matchedGeom.kode_bps : rawKodeBps;

        return {
          kode_bps: finalKodeBps,
          nama_kabupaten: kabupaten,
          user_id: userId,
          tahun,
          level,
          produksi_padi: row.produksi_padi,
          produksi_jagung: row.produksi_jagung,
          produksi_ubi_kayu: row.produksi_ubi_kayu,
          produksi_ubi_jalar: row.produksi_ubi_jalar,
          produksi_sagu: row.produksi_sagu,
          produksi_pisang: row.produksi_pisang,
          jumlah_penduduk: row.jumlah_penduduk,
          konsumsi_energi: row.konsumsi_energi || 0,
          konsumsi_protein: row.konsumsi_protein || 0,
          cbpp: row.cbpp || 0,
          jumlah_penduduk_prov: row.jumlah_penduduk_prov || 1,
          cbpk: row.cbpk || 0,
          jumlah_penduduk_kab: row.jumlah_penduduk_kab || 1,
          cbp_kec: row.cbp_kec || 0,
          pct_miskin: row.pct_miskin || 0,
          cv_harga_beras: row.cv_harga_beras || 0,
          cv_harga_ayam: row.cv_harga_ayam || 0,
          cv_harga_telur: row.cv_harga_telur || 0,
          cv_harga_minyak: row.cv_harga_minyak || 0,
          pou: row.pou || 0,
          lama_sekolah_perempuan: row.lama_sekolah_perempuan || 0,
          pct_no_water: row.pct_no_water || 0,
          segar: row.segar || 0,
          siap_saji: row.siap_saji || 0,
          skor_pph: row.skor_pph || 0,
          pct_stunting: row.pct_stunting || 0,
        };
      });

    } else {
      // KAB_KOTA FLOW: Single-sheet parsing
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      let headerRowIndex = 0;
      findHeaderLoop: for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 15; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          const val = worksheet[cellRef]?.v;
          if (val && (
            String(val).toLowerCase().includes('kode desa') ||
            String(val).toLowerCase().includes('desa/kelurahan') ||
            String(val).toLowerCase().includes('nama desa')
          )) {
            headerRowIndex = r;
            break findHeaderLoop;
          }
        }
      }

      let foundTahun = false;
      for (let r = 0; r < headerRowIndex; r++) {
        for (let c = 0; c < 10; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          const val = worksheet[cellRef]?.v;
          if (val && String(val).toLowerCase().includes('tahun')) {
            const nextCellRef = XLSX.utils.encode_cell({ r, c: c + 1 });
            const nextVal = worksheet[nextCellRef]?.v;
            if (nextVal && !isNaN(Number(nextVal))) {
              tahun = Number(nextVal);
              foundTahun = true;
              break;
            }
          }
        }
        if (foundTahun) break;
      }

      const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: headerRowIndex });
      
      inserts = rawData.map(row => {
        const norm: any = {};
        for (const key in row) {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          norm[normalizedKey] = row[key];
        }

        let rawKodeBps = String(norm['kodedesabps'] || norm['kodebps'] || '').trim();
        let namaDesaExcel = String(norm['namadesakelurahan'] || norm['namadesa'] || '').trim();
        
        if (!rawKodeBps && !namaDesaExcel) return null;

        let matchedGeom = geomList.find(g => g.kode_bps.replace(/\./g, '') === rawKodeBps.replace(/\./g, ''));
        
        if (!matchedGeom && namaDesaExcel) {
          const cleanedExcelName = cleanName(namaDesaExcel);
          matchedGeom = geomList.find(g => cleanName(g.nama_desa) === cleanedExcelName);
        }

        if (!matchedGeom && namaDesaExcel) {
          const cleanedExcelName = cleanName(namaDesaExcel);
          let bestMatch = null;
          let bestScore = 0;
          
          for (const g of geomList) {
            const cleanedGeomName = cleanName(g.nama_desa);
            const dist = getLevenshtein(cleanedExcelName, cleanedGeomName);
            const maxLen = Math.max(cleanedExcelName.length, cleanedGeomName.length);
            const score = 1 - dist / maxLen;
            
            if (score > bestScore && dist <= 2 && score >= 0.75) {
              bestScore = score;
              bestMatch = g;
            }
          }
          if (bestMatch) matchedGeom = bestMatch;
        }

        const finalKodeBps = matchedGeom ? matchedGeom.kode_bps : rawKodeBps;
        if (!finalKodeBps) return null;
        
        return {
          kode_bps: finalKodeBps,
          nama_kabupaten: kabupaten,
          user_id: userId,
          tahun,
          level,
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
    }

    for (const insertData of inserts) {
      if (!insertData) continue;
      const { error } = await authClient.from('raw_indicators').upsert(insertData, {
        onConflict: 'level,nama_kabupaten,kode_bps,tahun'
      });
      if (error) {
        errors.push(`Gagal menyimpan kode BPS ${insertData.kode_bps}: ${error.message}`);
      } else {
        inserted++;
      }
    }

    return NextResponse.json({ success: true, inserted, errors, tahun });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
