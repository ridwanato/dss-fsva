import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';
    const tahunStr = searchParams.get('tahun');
    const tahun = tahunStr ? parseInt(tahunStr) : 2025;
    const force = searchParams.get('force') === 'true';

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Parameter kabupaten/provinsi wajib diisi.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch geometries to map BPS codes to names (using case-insensitive ilike)
    const { data: geomData, error: geomError } = await supabase
      .from('geometries')
      .select('kode_bps, nama_desa, nama_kecamatan, kode_kemendagri, tipe_wilayah')
      .ilike('nama_kabupaten', kabupaten)
      .eq('level', level);

    if (geomError) throw geomError;

    const geomMap = new Map<string, { nama_desa: string; nama_kecamatan: string; tipe_wilayah: string }>();
    let totalKelurahan = 0;
    let totalDesa = 0;

    if (geomData) {
      geomData.forEach(g => {
        let tipe = g.tipe_wilayah;
        if (!tipe) {
          if (level === 'provinsi') tipe = 'Kecamatan';
          else {
            const code = g.kode_kemendagri || g.kode_bps || '';
            const parts = code.split('.');
            const clean = code.replace(/\./g, '').trim();
            const nameLower = (g.nama_desa || '').toLowerCase();
            
            if (nameLower.startsWith('kel.') || nameLower.startsWith('kelurahan')) tipe = 'Kelurahan';
            else if (nameLower.startsWith('desa')) tipe = 'Desa';
            else if (parts.length >= 4 && parts[3].startsWith('1')) tipe = 'Kelurahan';
            else if (parts.length >= 4 && parts[3].startsWith('2')) tipe = 'Desa';
            else if (clean.length === 10 && clean.substring(6, 7) === '1') tipe = 'Kelurahan';
            else tipe = 'Desa';
          }
        }
        if (tipe === 'Kelurahan') totalKelurahan++;
        else if (tipe === 'Desa') totalDesa++;
        geomMap.set(g.kode_bps, { nama_desa: g.nama_desa, nama_kecamatan: g.nama_kecamatan, tipe_wilayah: tipe });
      });
    }

    // 2. Fetch calculations results from fsva_results (using case-insensitive ilike)
    const { data: results, error: resError } = await supabase
      .from('fsva_results')
      .select('*')
      .ilike('nama_kabupaten', kabupaten)
      .eq('level', level)
      .eq('tahun', tahun);

    if (resError) throw resError;

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Tidak ada data kalkulasi FSVA ditemukan untuk wilayah "${kabupaten}" (${level}) pada tahun ${tahun}.`
      }, { status: 404 });
    }

    // Standardize canonical kabupaten name from DB record
    const canonicalKabupaten = results[0].nama_kabupaten || kabupaten;

    // 3. Aggregate metrics
    const totalWilayah = results.length;
    const priorityDist = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0 };
    results.forEach(r => {
      if (r.prioritas >= 1 && r.prioritas <= 6) {
        priorityDist[`P${r.prioritas}` as keyof typeof priorityDist]++;
      }
    });

    let kelurahanRentanCount = 0;
    let desaRentanCount = 0;

    const rentanWilayah = results
      .filter(r => r.prioritas >= 1 && r.prioritas <= 3)
      .map(r => {
        const geom = geomMap.get(r.kode_bps);
        const tipe = geom?.tipe_wilayah || 'Desa';
        if (tipe === 'Kelurahan') kelurahanRentanCount++;
        else if (tipe === 'Desa') desaRentanCount++;

        return {
          nama: geom?.nama_desa || 'Tidak diketahui',
          tipe_wilayah: tipe,
          induk: geom?.nama_kecamatan || '',
          prioritas: r.prioritas
        };
      })
      .sort((a, b) => a.prioritas - b.prioritas);

    const indicators = [
      { key: 'ncpr', label: 'Rasio Konsumsi Normatif (NCPR)', rawKey: 'ncpr', prioKey: 'p_ncpr', unit: '' },
      { key: 'pct_ake', label: 'Persentase Ketersediaan Energi', rawKey: 'pct_ake', prioKey: 'p_energy', unit: '%' },
      { key: 'pct_prohe', label: 'Persentase Ketersediaan Protein Hewani', rawKey: 'pct_prohe', prioKey: 'p_protein', unit: '%' },
      { key: 'rasio_cadangan', label: 'Rasio Cadangan Pangan', rawKey: 'rasio_cadangan', prioKey: 'p_cadangan', unit: 'kg/kap' },
      { key: 'pct_miskin', label: 'Persentase Penduduk Miskin', rawKey: 'pct_miskin', prioKey: 'p_poverty', unit: '%' },
      { key: 'cv_harga', label: 'CV Harga Bapok', rawKey: 'cv_harga', prioKey: 'p_cv_harga', unit: '' },
      { key: 'pou', label: 'Prevalence of Undernourishment (PoU)', rawKey: 'pou', prioKey: 'p_pou', unit: '%' },
      { key: 'lama_sekolah', label: 'Lama Sekolah Perempuan', rawKey: 'lama_sekolah', prioKey: 'p_sekolah', unit: 'tahun' },
      { key: 'pct_no_water', label: 'Persentase Rumah Tangga Tanpa Air Bersih', rawKey: 'pct_no_water', prioKey: 'p_air', unit: '%' },
      { key: 'skor_pph', label: 'Skor Pola Pangan Harapan (PPH)', rawKey: 'skor_pph', prioKey: 'p_pph', unit: 'skor' },
      { key: 'pct_stunting', label: 'Persentase Stunting', rawKey: 'pct_stunting', prioKey: 'p_stunting', unit: '%' },
      ...(level === 'provinsi' ? [{ key: 'food_safety', label: 'Keamanan Pangan', rawKey: 'food_safety', prioKey: 'p_food_safety', unit: 'skor' }] : [])
    ];

    const avgMetrics = indicators.map(ind => {
      let sumRaw = 0;
      let sumPrio = 0;
      let countRaw = 0;
      let countPrio = 0;

      results.forEach(r => {
        const rawVal = r[ind.rawKey];
        const prioVal = r[ind.prioKey];
        if (rawVal !== null && rawVal !== undefined) {
          sumRaw += Number(rawVal);
          countRaw++;
        }
        if (prioVal !== null && prioVal !== undefined) {
          sumPrio += Number(prioVal);
          countPrio++;
        }
      });

      return {
        key: ind.key,
        label: ind.label,
        avgRaw: countRaw > 0 ? Number((sumRaw / countRaw).toFixed(2)) : null,
        avgPrio: countPrio > 0 ? Number((sumPrio / countPrio).toFixed(2)) : null,
        unit: ind.unit
      };
    });

    // Generate SHA-256 hash of the input data to detect data changes
    const currentDataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ totalWilayah, priorityDist, rentanWilayah, avgMetrics }))
      .digest('hex');

    // 4. Check if cached insight exists in Supabase table `ai_insights`
    if (!force) {
      try {
        const { data: cachedRow, error: cacheErr } = await supabase
          .from('ai_insights')
          .select('insight, data_hash, updated_at, created_at')
          .ilike('nama_kabupaten', kabupaten)
          .eq('level', level)
          .eq('tahun', tahun)
          .maybeSingle();

        if (!cacheErr && cachedRow && cachedRow.insight) {
          // Return cached insight immediately (no Gemini call needed!)
          return NextResponse.json({
            success: true,
            cached: true,
            updated_at: cachedRow.updated_at || cachedRow.created_at,
            metadata: {
              kabupaten: canonicalKabupaten,
              level,
              tahun,
              totalWilayah,
              rentanCount: rentanWilayah.length
            },
            insight: cachedRow.insight
          });
        }
      } catch (checkCacheErr) {
        console.warn('Note: ai_insights cache check skipped:', checkCacheErr);
      }
    }

    // 5. Read Gemini API Key
    let apiKey = process.env.GEMINI_API_KEY;
    let debugInfo = { envPath: '', exists: false, processCwd: process.cwd(), matchFound: false, errorOccurred: '' };
    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), '.env.local');
        debugInfo.envPath = envPath;
        debugInfo.exists = fs.existsSync(envPath);
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s#\r\n]+)/);
          if (match && match[1]) {
            apiKey = match[1].replace(/['"]/g, '').trim();
            debugInfo.matchFound = true;
          }
        }
      } catch (e: any) {
        debugInfo.errorOccurred = e.message || String(e);
        console.error('Failed to read .env.local manually:', e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: `API Key Gemini belum dikonfigurasi di file .env.local (GEMINI_API_KEY). Debug: ${JSON.stringify(debugInfo)}`
      }, { status: 500 });
    }

    // 6. Construct Prompt
    const levelLabel = level === 'provinsi' ? 'Kecamatan' : 'Desa/Kelurahan';
    const isProv = level === 'provinsi';

    const systemContext = `
Anda adalah seorang analis senior Ketahanan Pangan dari Badan Pangan Nasional (Bapanas) Republik Indonesia.
Tugas Anda adalah menulis laporan analisis komprehensif mengenai peta Ketahanan dan Kerentanan Pangan (Food Security and Vulnerability Atlas / FSVA) untuk wilayah yang dipilih berdasarkan data statistik yang disediakan.

Tulis laporan dalam Bahasa Indonesia yang formal, objektif, profesional, dan kaya analisis kebijakan.

Berikut adalah data statistik FSVA hasil agregasi untuk:
- Wilayah: ${canonicalKabupaten} (${isProv ? 'Provinsi' : 'Kabupaten/Kota'})
- Tahun Analisis: ${tahun} (menggunakan data basis tahun ${tahun - 1})
- Total Unit Analisis (${levelLabel}): ${totalWilayah} ${!isProv ? `(terdiri dari ${totalDesa} Desa dan ${totalKelurahan} Kelurahan)` : ''}
- Distribusi Prioritas Komposit (P1 = Sangat Rentan, P6 = Sangat Tahan):
  * Prioritas 1 (Sangat Rentan): ${priorityDist.P1} ${levelLabel}
  * Prioritas 2 (Rentan): ${priorityDist.P2} ${levelLabel}
  * Prioritas 3 (Cukup Rentan): ${priorityDist.P3} ${levelLabel}
  * Prioritas 4 (Cukup Tahan): ${priorityDist.P4} ${levelLabel}
  * Prioritas 5 (Tahan): ${priorityDist.P5} ${levelLabel}
  * Prioritas 6 (Sangat Tahan): ${priorityDist.P6} ${levelLabel}
- Jumlah Wilayah Rentan Pangan (Prioritas 1-3): ${rentanWilayah.length} dari ${totalWilayah} ${!isProv ? `(${kelurahanRentanCount} Kelurahan rentan, ${desaRentanCount} Desa rentan)` : ''}
- Daftar Wilayah Rentan Pangan (Prioritas 1-3) Beserta Prioritas dan Tipe Wilayahnya (Desa/Kelurahan):
  ${JSON.stringify(rentanWilayah)}
- Rata-rata Nilai Indikator (Nilai Mentah & Kelas Prioritas 1-6):
  ${JSON.stringify(avgMetrics)}

(Catatan Penting: Pahami dan bedakan karakteristik wilayah Desa vs Kelurahan dalam pembahasan dan rekomendasi kebijakan jika relevan, contohnya Kelurahan cenderung memiliki mata pencaharian non-pertanian dan perkotaan, sedangkan Desa memiliki karakteristik agraris dan pedesaan).

FORMAT LAPORAN HARUS MENGIKUTI STRUKTUR BERIKUT (Gunakan Markdown tebal untuk Judul Bab dan Poin-Poin Utama):

# **LAPORAN ANALISIS AI INSIGHT FSVA - ${canonicalKabupaten.toUpperCase()} TAHUN ${tahun}**

### **1. RINGKASAN EKSEKUTIF**
- Jelaskan secara singkat status ketahanan pangan komposit wilayah secara keseluruhan (berapa banyak yang Rentan vs Tahan).
- Sebutkan daftar wilayah (maksimal 10 wilayah terburuk jika terlalu banyak) yang tergolong dalam Prioritas 1, 2, atau 3, beserta kecamatan induknya.
- Identifikasi indikator utama (2-3 indikator dengan rata-rata prioritas terkecil) yang menjadi faktor pemicu utama (driver) kerawanan pangan di wilayah ini.

### **2. ANALISIS PILAR KETAHANAN PANGAN**
Bahas secara detil pencapaian per indikator yang dibagi dalam 3 pilar utama:
- **Pilar Ketersediaan Pangan**:
  * Analisis indikator NCPR (Rasio Konsumsi Normatif), Persentase Ketersediaan Energi, Persentase Protein Hewani, dan Rasio Cadangan Pangan di wilayah ini. Sebutkan angka rata-rata mentahnya dan intepretasikan situasinya.
- **Pilar Akses Pangan**:
  * Analisis tingkat kemiskinan (persentase penduduk miskin), fluktuasi/CV harga pangan pokok, dan prevalensi kerawanan pangan (PoU). Jelaskan implikasinya terhadap daya beli masyarakat.
- **Pilar Pemanfaatan Pangan**:
  * Analisis kualitas hidup meliputi rata-rata lama sekolah perempuan, persentase rumah tangga tanpa air bersih terlindungi, prevalensi stunting pada balita, skor Pola Pangan Harapan (PPH), serta indikator keamanan pangan (khusus provinsi jika ada). Hubungkan aspek kesehatan/sanitasi dengan stunting.

### **3. REKOMENDASI KEBIJAKAN**
Berikan rekomendasi aksi konkret yang spesifik dan dapat diimplementasikan oleh pemerintah daerah setempat untuk menangani kerawanan pangan, dikelompokkan menjadi:
- **Intervensi Pilar Ketersediaan**: Tindakan konkret untuk meningkatkan produksi, distribusi, atau cadangan pangan daerah.
- **Intervensi Pilar Akses Pangan**: Tindakan konkret mengatasi kemiskinan, beasiswa pendidikan, menstabilkan harga bapok, atau memperbaiki infrastruktur jalan penghubung.
- **Intervensi Pilar Pemanfaatan Pangan**: Tindakan konkret meningkatkan akses air bersih terlindungi, program gizi penanganan stunting terintegrasi, dan penyuluhan Pola Pangan Harapan (PPH).

---
Keterbatasan: Tulis langsung teks laporannya tanpa ada sapaan pembuka (seperti "Halo", "Ini laporan yang Anda minta") atau penutup chat. Langsung mulai dengan judul utama.
`;

    // 7. Call Gemini API with Multi-Model Fallback & Retry
    const modelsToTry = ['gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let generatedText = '';
    let lastGeminiError = '';

    for (const mName of modelsToTry) {
      if (generatedText) break;
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${apiKey}`;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemContext }] }],
              generationConfig: { temperature: 0.2 }
            })
          });

          if (response.ok) {
            const resJson = await response.json();
            generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (generatedText) break;
          } else {
            const errorText = await response.text();
            lastGeminiError = `Model ${mName} (${response.status}): ${errorText}`;
            if (response.status === 503 || response.status === 429) {
              await new Promise(r => setTimeout(r, 2000));
            } else {
              break;
            }
          }
        } catch (fetchErr: any) {
          lastGeminiError = fetchErr.message;
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    if (!generatedText) {
      throw new Error(`Gagal menghasilkan analisis dari Gemini API. ${lastGeminiError}`);
    }

    // 8. Save/Upsert generated insight to Supabase `ai_insights` table
    const nowIso = new Date().toISOString();
    try {
      await supabase
        .from('ai_insights')
        .upsert({
          nama_kabupaten: canonicalKabupaten,
          level: level,
          tahun: tahun,
          insight: generatedText,
          data_hash: currentDataHash,
          updated_at: nowIso
        }, {
          onConflict: 'nama_kabupaten,level,tahun'
        });
    } catch (saveErr) {
      console.warn('Could not save insight cache to Supabase:', saveErr);
    }

    return NextResponse.json({
      success: true,
      cached: false,
      updated_at: nowIso,
      metadata: {
        kabupaten: canonicalKabupaten,
        level,
        tahun,
        totalWilayah,
        rentanCount: rentanWilayah.length
      },
      insight: generatedText
    });
  } catch (err: any) {
    console.error('API AI Insight Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
