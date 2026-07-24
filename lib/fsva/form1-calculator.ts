import {
  GKG_CONVERSION, COMMODITY_CONVERSION, PADI_SUSUT,
  BERAS_SUSUT, KOMODITAS_SUSUT, JAGUNG_KONSUMSI_FACTOR,
  NUTRITION_STANDARDS, CV_HARGA_WEIGHTS
} from './constants'

export interface RawIndicatorInput {
  produksi_padi: number       // ton
  produksi_jagung: number     // ton JPK kadar air 28%
  produksi_ubi_kayu: number   // ton
  produksi_ubi_jalar: number  // ton
  produksi_sagu: number       // ton
  produksi_pisang: number     // ton
  jumlah_penduduk: number     // jiwa
  provinsi: string            // untuk lookup GKG
  konsumsi_energi: number     // kkal/kap/hr
  konsumsi_protein: number    // gr/kap/hr
  cadangan_cbpd: number       // ton
  cadangan_lpm: number        // ton
  pct_miskin: number          // %
  cv_harga_beras: number      // %
  cv_harga_ayam: number       // %
  cv_harga_telur: number      // %
  cv_harga_minyak: number     // %
  pou: number                 // %
  lama_sekolah_perempuan: number // tahun
  pct_no_water: number        // %
  skor_pph: number            // 0-100
  pct_stunting: number        // %
  // Tambahan untuk tingkat provinsi
  cbpp?: number               // kg
  jumlah_penduduk_prov?: number // jiwa
  cbpk?: number               // kg
  jumlah_penduduk_kab?: number // jiwa
  cbp_kec?: number            // kg
  segar?: number              // %
  siap_saji?: number          // %
}

export interface CalculatedIndicators {
  // Indikator 1: NCPR
  ncpr: number
  // Indikator 2: % AKE
  pct_ake: number
  // Indikator 3: % Protein Hewani
  pct_prohe: number
  // Indikator 4: Rasio Cadangan
  rasio_cadangan: number
  // Indikator 5: % Miskin (langsung dari input)
  pct_miskin: number
  // Indikator 6: CV Harga gabungan
  cv_harga: number
  // Indikator 7-11: langsung dari input
  pou: number
  lama_sekolah: number
  pct_no_water: number
  skor_pph: number
  pct_stunting: number
  // Indikator 12 untuk tingkat provinsi
  food_safety?: number
}

// ================================================================
// INDIKATOR 1: NCPR (Rumus 1–15 Juknis)
// ================================================================
function calculateNCPR(input: RawIndicatorInput): number {
  if (input.jumlah_penduduk <= 0) return 99; // Hindari division by zero
  
  const c = GKG_CONVERSION[input.provinsi] ?? GKG_CONVERSION['Indonesia']

  // Padi → Beras konsumsi
  const P = input.produksi_padi * 1000 // ton → kg
  // Rumus 1: Pnet = P - (benih + pakan + tercecer + industri_non_makanan)
  const Pnet = P * (1 - PADI_SUSUT.benih - PADI_SUSUT.pakan - PADI_SUSUT.tercecer - PADI_SUSUT.industri_non_mak)
  const Rnet = c * Pnet
  // Rumus 4: Rc = Rnet - (pakan + tercecer + industri_non_makanan)
  const Rc = Rnet * (1 - BERAS_SUSUT.pakan - BERAS_SUSUT.tercecer - BERAS_SUSUT.industri_non_mak)

  // Jagung setara beras
  const M = input.produksi_jagung * 1000 * JAGUNG_KONSUMSI_FACTOR
  const Mnet = M * (1 - KOMODITAS_SUSUT.jagung.benih - KOMODITAS_SUSUT.jagung.pakan - KOMODITAS_SUSUT.jagung.tercecer)
  const Mr = Mnet * COMMODITY_CONVERSION.jagung

  // Ubi kayu setara beras
  const C = input.produksi_ubi_kayu * 1000
  const Cnet = C * (1 - KOMODITAS_SUSUT.ubi_kayu.pakan - KOMODITAS_SUSUT.ubi_kayu.tercecer)
  const Cr = Cnet * COMMODITY_CONVERSION.ubi_kayu

  // Ubi jalar setara beras
  const J = input.produksi_ubi_jalar * 1000
  const Jnet = J * (1 - KOMODITAS_SUSUT.ubi_jalar.pakan - KOMODITAS_SUSUT.ubi_jalar.tercecer)
  const Jr = Jnet * COMMODITY_CONVERSION.ubi_jalar

  // Sagu setara beras
  const S = input.produksi_sagu * 1000
  const Snet = S * (1 - KOMODITAS_SUSUT.sagu.tercecer)
  const Sr = Snet * COMMODITY_CONVERSION.sagu

  // Pisang setara beras
  const B = input.produksi_pisang * 1000
  const Bnet = B * (1 - KOMODITAS_SUSUT.pisang.tercecer)
  const Br = Bnet * COMMODITY_CONVERSION.pisang

  // Total produksi pangan pokok (kg)
  const Pfood = Rc + Mr + Cr + Jr + Sr + Br

  // Ketersediaan per kapita per hari (gram)
  const F = (Pfood / (input.jumlah_penduduk * 365)) * 1000

  // IAV = Cnorm / F (jika >1 = defisit)
  if (F <= 0) return 99 // nilai ekstrem defisit
  return NUTRITION_STANDARDS.konsumsi_normatif_gr / F
}

// ================================================================
// INDIKATOR 2: % AKE (Rumus 16)
// ================================================================
function calculatePctAKE(konsumsi_energi: number): number {
  return (konsumsi_energi / NUTRITION_STANDARDS.energi_kkal) * 100
}

// ================================================================
// INDIKATOR 3: % Protein Hewani (Rumus 17)
// ================================================================
function calculatePctProhe(konsumsi_protein: number): number {
  return (konsumsi_protein / NUTRITION_STANDARDS.protein_hewani_gr) * 100
}

// ================================================================
// INDIKATOR 4: Rasio Cadangan (Rumus 18)
// ================================================================
function calculateRasioCadangan(
  cbpd: number, lpm: number, penduduk: number, 
  level: 'kab_kota' | 'provinsi' = 'kab_kota',
  cbpp?: number, jml_pend_prov?: number,
  cbpk?: number, jml_pend_kab?: number,
  cbp_kec?: number
): number {
  if (level === 'provinsi') {
    const provCapita = cbpp && jml_pend_prov && jml_pend_prov > 0 ? cbpp / jml_pend_prov : 0;
    const kabCapita = cbpk && jml_pend_kab && jml_pend_kab > 0 ? cbpk / jml_pend_kab : 0;
    const kecCapita = cbp_kec && penduduk > 0 ? cbp_kec / penduduk : 0;
    return provCapita + kabCapita + kecCapita;
  }

  if (penduduk <= 0) return 0; // Hindari division by zero
  const totalCadangan = (cbpd + lpm) * 1000 // ton → kg
  return totalCadangan / penduduk // kg/kapita
}

// ================================================================
// INDIKATOR 6: CV Harga Gabungan (Rumus 19-20)
// ================================================================
function calculateCVHarga(
  cv_beras: number, cv_ayam: number,
  cv_telur: number, cv_minyak: number
): number {
  return (
    cv_beras  * CV_HARGA_WEIGHTS.beras  +
    cv_ayam   * CV_HARGA_WEIGHTS.ayam   +
    cv_telur  * CV_HARGA_WEIGHTS.telur  +
    cv_minyak * CV_HARGA_WEIGHTS.minyak
  )
}

// ================================================================
// INDIKATOR 10 PROVINSI: Keamanan Pangan
// ================================================================
function calculateFoodSafety(segar?: number, siap_saji?: number): number {
  const vals: number[] = [];
  if (segar !== undefined && segar !== null && !isNaN(segar)) vals.push(segar);
  if (siap_saji !== undefined && siap_saji !== null && !isNaN(siap_saji)) vals.push(siap_saji);
  if (vals.length === 0) return 0; // fallback if no data
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ================================================================
// MAIN EXPORT: Kalkulasi semua indikator
// ================================================================
export function calculateAllIndicators(
  input: RawIndicatorInput, 
  level: 'kab_kota' | 'provinsi' = 'kab_kota'
): CalculatedIndicators {
  const result: CalculatedIndicators = {
    ncpr:            calculateNCPR(input),
    pct_ake:         calculatePctAKE(input.konsumsi_energi),
    pct_prohe:       calculatePctProhe(input.konsumsi_protein),
    rasio_cadangan:  calculateRasioCadangan(
      input.cadangan_cbpd, input.cadangan_lpm, input.jumlah_penduduk, 
      level, input.cbpp, input.jumlah_penduduk_prov, input.cbpk, input.jumlah_penduduk_kab, input.cbp_kec
    ),
    pct_miskin:      input.pct_miskin,
    cv_harga:        calculateCVHarga(input.cv_harga_beras, input.cv_harga_ayam, input.cv_harga_telur, input.cv_harga_minyak),
    pou:             input.pou,
    lama_sekolah:    input.lama_sekolah_perempuan,
    pct_no_water:    input.pct_no_water,
    skor_pph:        input.skor_pph,
    pct_stunting:    input.pct_stunting,
  };

  if (level === 'provinsi') {
    result.food_safety = calculateFoodSafety(input.segar, input.siap_saji);
  }

  return result;
}
