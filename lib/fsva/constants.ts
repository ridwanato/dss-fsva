// ================================================================
// KONSTANTA FSVA — Badan Pangan Nasional
// Kab/Kota : Keputusan Sekretaris Utama BPN Nomor 21 Tahun 2026
// Provinsi  : Keputusan Sekretaris Utama BPN Nomor 20 Tahun 2026
// ================================================================

// Bobot indikator (Tabel 3 Juknis) — total = 100
export const WEIGHTS = {
  ncpr:      9.5,
  energy:    8.0,
  protein:   8.0,
  cadangan:  8.0,
  poverty:   11.8,
  cv_harga:  11.3,
  pou:       9.9,
  sekolah:   6.5,
  air:       10.0,
  pph:       9.0,
  stunting:  8.0,
} as const

// Bobot indikator tingkat provinsi (12 Indikator)
export const WEIGHTS_PROV = {
  ncpr:        9.5,
  energy:      8.0,
  protein:     8.0,
  cadangan:    8.0,
  poverty:     11.8,
  cv_harga:    11.3,
  pou:         9.9,
  sekolah:     5.0,
  air:         7.5,
  food_safety: 6.0,
  pph:         7.8,
  stunting:    7.2,
} as const

// Cut off komposit (Tabel 4 Juknis) — sudah fixed, tidak dihitung ulang
export const COMPOSITE_CUTOFF = {
  p1_max: 46.37,   // <46.37 = Prioritas 1 (Sangat rentan)
  p2_max: 53.95,   // 46.37–53.95 = Prioritas 2 (Rentan)
  p3_max: 61.83,   // 53.95–61.83 = Prioritas 3 (Agak rentan)
  p4_max: 69.71,   // 61.83–69.71 = Prioritas 4 (Agak tahan)
  p5_max: 77.29,   // 69.71–77.29 = Prioritas 5 (Tahan)
                   // >77.29      = Prioritas 6 (Sangat tahan)
}

// Cut off komposit tingkat provinsi
export const COMPOSITE_CUTOFF_PROV = {
  p1_max: 45.76482182069139,
  p2_max: 53.47550897170462,
  p3_max: 61.41346884999059,
  p4_max: 69.35142872827656,
  p5_max: 77.06211587928979,
}

// Range indikator individu (Tabel 2 Juknis)
// breaks: batas antara P1-P2, P2-P3, P3-P4, P4-P5, P5-P6
// inverse: true = nilai BESAR = lebih BURUK (rentan)
export const INDICATOR_RANGES = {
  ncpr:     { breaks: [0.50, 0.75, 1.00, 1.25, 1.50], inverse: false, min: 0,  max: 10 },
  energy:   { breaks: [70,   80,   90,   100,  110],  inverse: false, min: 50, max: 120 },
  protein:  { breaks: [70,   80,   90,   100,  110],  inverse: false, min: 28, max: 120 },
  cadangan: { breaks: [0.25, 0.375, 0.50, 0.625, 0.75], inverse: false, min: 0,  max: 3.5 },
  poverty:  { breaks: [10,   15,   20,   25,   30],   inverse: true,  min: 0,  max: 50 },
  cv_harga: { breaks: [6,    7,    8,    9,    10],   inverse: true,  min: 2,  max: 20 },
  pou:      { breaks: [5,    10,   15,   20,   25],   inverse: true,  min: 0,  max: 75 },
  sekolah:  { breaks: [6.0,  6.5,  7.5,  8.5,  9.0],  inverse: false, min: 1,  max: 12 },
  air:      { breaks: [30,   40,   50,   60,   70],   inverse: true,  min: 0,  max: 100 },
  pph:      { breaks: [70,   75,   80,   85,   90],   inverse: false, min: 40, max: 100 },
  // Stunting: 4 kelompok per WHO & Juknis No.21/2026 Tabel 3
  // P1=≥40, P2=30-<40, P3=20-<30, P4=<20
  stunting: { breaks: [20,   30,   40],             inverse: true,  min: 0,  max: 75 },
}

// Range indikator individu tingkat provinsi (12 Indikator)
export const INDICATOR_RANGES_PROV = {
  ncpr:        { breaks: [0.50, 0.75, 1.00, 1.25, 1.50], inverse: false, min: 0,  max: 10 },
  energy:      { breaks: [70,   80,   90,   100,  110],  inverse: false, min: 50, max: 120 },
  protein:     { breaks: [70,   80,   90,   100,  110],  inverse: false, min: 28, max: 120 },
  cadangan:    { breaks: [0.25, 0.375, 0.50, 0.625, 0.75], inverse: false, min: 0,  max: 3.5 },
  poverty:     { breaks: [10,   15,   20,   25,   30],   inverse: true,  min: 0,  max: 50 },
  cv_harga:    { breaks: [6,    7,    8,    9,    10],   inverse: true,  min: 2,  max: 20 },
  pou:         { breaks: [5,    10,   15,   20,   25],   inverse: true,  min: 0,  max: 75 },
  sekolah:     { breaks: [6.0,  6.5,  7.5,  8.5,  9.0],  inverse: false, min: 1,  max: 12 },
  air:         { breaks: [30,   40,   50,   60,   70],   inverse: true,  min: 0,  max: 100 },
  food_safety: { breaks: [30,   40,   50,   60,   70],   inverse: false, min: 0,  max: 100 },
  pph:         { breaks: [70,   75,   80,   85,   90],   inverse: false, min: 40, max: 100 },
  // Stunting khusus 4 kelompok per WHO/PDF Tabel 4: P1≥40, P2=30-<40, P3=20-<30, P4=<20
  stunting:    { breaks: [20,   30,   40],               inverse: true,  min: 0,  max: 75 },
}

// Konversi GKG → Beras per Provinsi (Gambar 1 Juknis, Sumber BPS 2018)
export const GKG_CONVERSION: Record<string, number> = {
  'Papua Barat':        0.6670,
  'Kalimantan Tengah':  0.6594,
  'Kalimantan Utara':   0.6581,
  'Kep. Bangka Belitung': 0.6580,
  'Kalimantan Selatan': 0.6569,
  'Kalimantan Barat':   0.6568,
  'Sulawesi Tengah':    0.6553,
  'DKI Jakarta':        0.6544,
  'Nusa Tenggara Timur': 0.6503,
  'Kalimantan Timur':   0.6457,
  'Sumatera Barat':     0.6428,
  'Jambi':              0.6422,
  'Jawa Barat':         0.6411,
  'Jawa Timur':         0.6410,
  'Indonesia':          0.6402,
  'Aceh':               0.6395,
  'Bengkulu':           0.6394,
  'Jawa Tengah':        0.6384,
  'Lampung':            0.6382,
  'Sulawesi Barat':     0.6376,
  'Sumatera Selatan':   0.6375,
  'Sulawesi Tenggara':  0.6375,
  'Sulawesi Selatan':   0.6371,
  'Riau':               0.6371,
  'Sumatera Utara':     0.6368,
  'Kep. Riau':          0.6353,
  'Papua':              0.6339,
  'Banten':             0.6323,
  'Nusa Tenggara Barat': 0.6323,
  'DI Yogyakarta':      0.6306,
  'Bali':               0.6261,
  'Sulawesi Utara':     0.6238,
  'Maluku':             0.6217,
  'Maluku Utara':       0.6213,
  'Gorontalo':          0.6199,
}

// Konversi komoditas setara beras
// Angka konversi setara beras berdasarkan nilai energi dan %BDD
// Sumber: Rumus 11 Juknis (Buku Panduan NBM 2025)
export const COMMODITY_CONVERSION = {
  jagung:   0.92,   // dari Rumus 8 Juknis
  ubi_kayu: 0.363,  // Rumus 11: Cnet x 0.363
  ubi_jalar: 0.259, // Rumus 11: Jnet x 0.259
  sagu:     0.640,  // Rumus 11: Snet x 0.640
  pisang:   0.134,  // Rumus 11: Bnet x 0.134
}

// Faktor susut/tercecer padi (Rumus 1-5 Juknis)
export const PADI_SUSUT = {
  benih:             0.0090,  // 0.90%   — Rumus 1 Juknis
  pakan:             0.0044,  // 0.44%   — Rumus 1 Juknis
  tercecer:          0.0492,  // 4.92%   — Rumus 1 Juknis
  industri_non_mak:  0.0056,  // 0.56%   — Rumus 1 Juknis
}
export const BERAS_SUSUT = {
  benih:             0.0000,  // 0%
  pakan:             0.0017,  // 0.17%   — Rumus 3 Juknis
  tercecer:          0.0250,  // 2.5%    — Rumus 3 Juknis
  industri_non_mak:  0.0066,  // 0.66%   — Rumus 3 Juknis
}


// Faktor susut komoditas lain
// Faktor susut komoditas lain — Sumber: Rumus 9 Juknis (Tabel konversi Buku Panduan NBM 2025)
export const KOMODITAS_SUSUT = {
  jagung:    { benih: 0.0035, pakan: 0.0000, tercecer: 0.0462 }, // benih&pakan dihitung dari series 5 thn (benih dipakai, pakan ditangani terpisah); tercecer 4.62%
  ubi_kayu:  { benih: 0.0000, pakan: 0.0043, tercecer: 0.0423 }, // pakan 0.43%, tercecer 4.23% — Rumus 9 Juknis
  ubi_jalar: { benih: 0.0000, pakan: 0.0077, tercecer: 0.0490 }, // pakan 0.77%, tercecer 4.90% — Rumus 9 Juknis
  sagu:      { benih: 0.0000, pakan: 0.0000, tercecer: 0.0072 }, // tercecer 0.72% — Rumus 9 Juknis
  pisang:    { benih: 0.0000, pakan: 0.0000, tercecer: 0.0111 }, // tercecer 1.11% — Rumus 9 Juknis
}


// Konversi jagung JPK ke konsumsi (kadar air 28% → 14%)
export const JAGUNG_KONSUMSI_FACTOR = 0.7385

// Standar kebutuhan gizi (Permenkes No.28/2019 + Kesepakatan Tim FSVA)
export const NUTRITION_STANDARDS = {
  energi_kkal: 2100,       // kkal/kap/hari
  protein_hewani_gr: 25,   // gr/kap/hari
  konsumsi_normatif_gr: 300, // gram serealia/kap/hari
}

// Bobot CV harga (Rumus 20 Juknis)
export const CV_HARGA_WEIGHTS = {
  beras:  0.50,
  ayam:   0.15,
  telur:  0.20,
  minyak: 0.15,
}

// Label prioritas untuk UI (Tabel 5 Juknis - 6 prioritas)
export const PRIORITY_LABELS = {
  1: { label: 'Sangat Rentan',  color: '#6e1f1f', fill: '#6e1f1f' },
  2: { label: 'Rentan',         color: '#e85961', fill: '#e85961' },
  3: { label: 'Agak Rentan',    color: '#f4a1a7', fill: '#f4a1a7' },
  4: { label: 'Agak Tahan',     color: '#c9e077', fill: '#c9e077' },
  5: { label: 'Tahan',          color: '#94c945', fill: '#94c945' },
  6: { label: 'Sangat Tahan',   color: '#3b703b', fill: '#3b703b' },
} as const

// Label prioritas khusus stunting (Tabel 6 Juknis - 4 prioritas)
export const STUNTING_PRIORITY_LABELS = {
  1: { label: 'Sangat Tinggi',  color: '#6e1f1f', fill: '#6e1f1f' },
  2: { label: 'Tinggi',         color: '#f4a1a7', fill: '#f4a1a7' },
  3: { label: 'Sedang',         color: '#c9e077', fill: '#c9e077' },
  4: { label: 'Rendah',         color: '#3b703b', fill: '#3b703b' },
} as const
