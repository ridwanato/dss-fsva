import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';
    const tahunStr = searchParams.get('tahun');
    const tahun = tahunStr ? parseInt(tahunStr) : 2025;

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: 'Parameter kabupaten/provinsi wajib diisi.' }, { status: 400 });
    }

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s#\r\n]+)/);
          if (match && match[1]) {
            apiKey = match[1].replace(/['"]/g, '').trim();
          }
        }
      } catch (e) {
        console.error('Failed to read .env.local manually:', e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API Key Gemini belum dikonfigurasi di file .env.local (GEMINI_API_KEY).'
      }, { status: 500 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch geometries to map BPS codes to names
    const { data: geomData, error: geomError } = await supabase
      .from('geometries')
      .select('kode_bps, nama_desa, nama_kecamatan')
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level);

    if (geomError) throw geomError;

    const geomMap = new Map<string, { nama_desa: string; nama_kecamatan: string }>();
    if (geomData) {
      geomData.forEach(g => {
        geomMap.set(g.kode_bps, { nama_desa: g.nama_desa, nama_kecamatan: g.nama_kecamatan });
      });
    }

    // 2. Fetch calculations results from fsva_results
    const { data: results, error: resError } = await supabase
      .from('fsva_results')
      .select('*')
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level)
      .eq('tahun', tahun);

    if (resError) throw resError;

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Tidak ada data kalkulasi FSVA ditemukan untuk wilayah "${kabupaten}" (${level}) pada tahun ${tahun}.`
      }, { status: 404 });
    }

    // 3. Aggregate metrics
    const totalWilayah = results.length;
    const priorityDist = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0 };
    results.forEach(r => {
      if (r.prioritas >= 1 && r.prioritas <= 6) {
        priorityDist[`P${r.prioritas}` as keyof typeof priorityDist]++;
      }
    });

    const rentanWilayah = results
      .filter(r => r.prioritas >= 1 && r.prioritas <= 3)
      .map(r => {
        const geom = geomMap.get(r.kode_bps);
        return {
          nama: geom?.nama_desa || 'Tidak diketahui',
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

    // 4. Construct Prompt
    const levelLabel = level === 'provinsi' ? 'Kecamatan' : 'Desa/Kelurahan';
    const subLabelPlural = level === 'provinsi' ? 'Kecamatan-Kecamatan' : 'Desa-Desa/Kelurahan-Kelurahan';
    const isProv = level === 'provinsi';

    const systemContext = `
Anda adalah seorang analis senior Ketahanan Pangan dari Badan Pangan Nasional (Bapanas) Republik Indonesia.
Tugas Anda adalah menulis laporan analisis komprehensif mengenai peta Ketahanan dan Kerentanan Pangan (Food Security and Vulnerability Atlas / FSVA) untuk wilayah yang dipilih berdasarkan data statistik yang disediakan.

Tulis laporan dalam Bahasa Indonesia yang formal, objektif, profesional, dan kaya analisis kebijakan.

Berikut adalah data statistik FSVA hasil agregasi untuk:
- Wilayah: ${kabupaten} (${isProv ? 'Provinsi' : 'Kabupaten/Kota'})
- Tahun Analisis: ${tahun} (menggunakan data basis tahun ${tahun - 1})
- Total Unit Analisis (${levelLabel}): ${totalWilayah}
- Distribusi Prioritas Komposit (P1 = Sangat Rentan, P6 = Sangat Tahan):
  * Prioritas 1 (Sangat Rentan): ${priorityDist.P1} ${levelLabel}
  * Prioritas 2 (Rentan): ${priorityDist.P2} ${levelLabel}
  * Prioritas 3 (Cukup Rentan): ${priorityDist.P3} ${levelLabel}
  * Prioritas 4 (Cukup Tahan): ${priorityDist.P4} ${levelLabel}
  * Prioritas 5 (Tahan): ${priorityDist.P5} ${levelLabel}
  * Prioritas 6 (Sangat Tahan): ${priorityDist.P6} ${levelLabel}
- Jumlah Wilayah Rentan Pangan (Prioritas 1-3): ${rentanWilayah.length} dari ${totalWilayah}
- Daftar Wilayah Rentan Pangan (Prioritas 1-3) Beserta Prioritasnya:
  ${JSON.stringify(rentanWilayah)}
- Rata-rata Nilai Indikator (Nilai Mentah & Kelas Prioritas 1-6):
  ${JSON.stringify(avgMetrics)}

(Catatan: Kelas prioritas indikator berskala 1 s/d 6, di mana angka yang semakin kecil berarti kerentanan semakin tinggi/semakin buruk, dan angka yang besar berarti kondisi semakin baik/tahan).

FORMAT LAPORAN HARUS MENGIKUTI STRUKTUR BERIKUT (Gunakan Markdown tebal untuk Judul Bab dan Poin-Poin Utama):

# **LAPORAN ANALISIS AI INSIGHT FSVA - ${kabupaten.toUpperCase()} TAHUN ${tahun}**

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

    // 5. Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemContext }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const resJson = await response.json();
    const generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      success: true,
      metadata: {
        kabupaten,
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
