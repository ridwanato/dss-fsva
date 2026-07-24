import { WEIGHTS, WEIGHTS_PROV, COMPOSITE_CUTOFF, COMPOSITE_CUTOFF_PROV } from './constants'
import { normalizeValue, getPriorityIndividual } from './normalization'
import { CalculatedIndicators } from './form1-calculator'

export interface FSVAResult {
  // Prioritas individu
  p_ncpr: number; p_energy: number; p_protein: number; p_cadangan: number
  p_poverty: number; p_cv_harga: number; p_pou: number
  p_sekolah: number; p_air: number; p_pph: number; p_stunting: number
  p_food_safety?: number // Prov only
  // Skor normalisasi
  x_ncpr: number; x_energy: number; x_protein: number; x_cadangan: number
  x_poverty: number; x_cv_harga: number; x_pou: number
  x_sekolah: number; x_air: number; x_pph: number; x_stunting: number
  x_food_safety?: number // Prov only
  // Hasil akhir
  food_safety?: number // Prov only
  skor_komposit: number
  indeks_komposit: number
  prioritas: number
  indeks_ketersediaan: number
  indeks_keterjangkauan: number
  indeks_pemanfaatan: number
}

export function calculateFSVAResult(
  indicators: CalculatedIndicators,
  level: 'kab_kota' | 'provinsi' = 'kab_kota'
): FSVAResult {
  // Step 1: Normalisasi nilai aktual (0-1)
  const x_ncpr     = normalizeValue('ncpr',     indicators.ncpr, level)
  const x_energy   = normalizeValue('energy',   indicators.pct_ake, level)
  const x_protein  = normalizeValue('protein',  indicators.pct_prohe, level)
  const x_cadangan = normalizeValue('cadangan', indicators.rasio_cadangan, level)
  const x_poverty  = normalizeValue('poverty',  indicators.pct_miskin, level)
  const x_cv_harga = normalizeValue('cv_harga', indicators.cv_harga, level)
  const x_pou      = normalizeValue('pou',      indicators.pou, level)
  const x_sekolah  = normalizeValue('sekolah',  indicators.lama_sekolah, level)
  const x_air      = normalizeValue('air',      indicators.pct_no_water, level)
  const x_pph      = normalizeValue('pph',      indicators.skor_pph, level)
  const x_stunting = normalizeValue('stunting', indicators.pct_stunting, level)
  const x_food_safety = level === 'provinsi' && indicators.food_safety !== undefined
    ? normalizeValue('food_safety', indicators.food_safety, level)
    : undefined;

  // Step 2: Skor komposit Y(j) = Σ ai × xij (Bobot total = 100)
  let skor = 0
  if (level === 'provinsi') {
    skor = (
      x_ncpr            * WEIGHTS_PROV.ncpr     +
      x_energy          * WEIGHTS_PROV.energy   +
      x_protein         * WEIGHTS_PROV.protein  +
      x_cadangan        * WEIGHTS_PROV.cadangan +
      x_poverty         * WEIGHTS_PROV.poverty  +
      x_cv_harga        * WEIGHTS_PROV.cv_harga +
      x_pou             * WEIGHTS_PROV.pou      +
      x_sekolah         * WEIGHTS_PROV.sekolah  +
      x_air             * WEIGHTS_PROV.air      +
      (x_food_safety || 0) * WEIGHTS_PROV.food_safety +
      x_pph             * WEIGHTS_PROV.pph      +
      x_stunting        * WEIGHTS_PROV.stunting
    )
  } else {
    skor = (
      x_ncpr     * WEIGHTS.ncpr     +
      x_energy   * WEIGHTS.energy   +
      x_protein  * WEIGHTS.protein  +
      x_cadangan * WEIGHTS.cadangan +
      x_poverty  * WEIGHTS.poverty  +
      x_cv_harga * WEIGHTS.cv_harga +
      x_pou      * WEIGHTS.pou      +
      x_sekolah  * WEIGHTS.sekolah  +
      x_air      * WEIGHTS.air      +
      x_pph      * WEIGHTS.pph      +
      x_stunting * WEIGHTS.stunting
    )
  }

  // Step 3: Indeks komposit (0-100)
  const indeks = skor // sudah dalam skala 0-100 karena bobot total = 100

  // Step 4: Tentukan prioritas
  let prioritas: number
  const cutoff = level === 'provinsi' ? COMPOSITE_CUTOFF_PROV : COMPOSITE_CUTOFF
  if (indeks < cutoff.p1_max)      prioritas = 1
  else if (indeks < cutoff.p2_max) prioritas = 2
  else if (indeks < cutoff.p3_max) prioritas = 3
  else if (indeks < cutoff.p4_max) prioritas = 4
  else if (indeks < cutoff.p5_max) prioritas = 5
  else                             prioritas = 6

  // Step 5: Indeks per aspek (proporsi dari bobot aspek)
  let indeks_ketersediaan = 0
  let indeks_keterjangkauan = 0
  let indeks_pemanfaatan = 0

  if (level === 'provinsi') {
    const total_ketersediaan = WEIGHTS_PROV.ncpr + WEIGHTS_PROV.energy + WEIGHTS_PROV.protein + WEIGHTS_PROV.cadangan
    const total_keterjangkauan = WEIGHTS_PROV.poverty + WEIGHTS_PROV.cv_harga + WEIGHTS_PROV.pou
    const total_pemanfaatan = WEIGHTS_PROV.sekolah + WEIGHTS_PROV.air + WEIGHTS_PROV.food_safety + WEIGHTS_PROV.pph + WEIGHTS_PROV.stunting

    indeks_ketersediaan = (
      (x_ncpr * WEIGHTS_PROV.ncpr + x_energy * WEIGHTS_PROV.energy +
       x_protein * WEIGHTS_PROV.protein + x_cadangan * WEIGHTS_PROV.cadangan)
      / total_ketersediaan * 100
    )
    indeks_keterjangkauan = (
      (x_poverty * WEIGHTS_PROV.poverty + x_cv_harga * WEIGHTS_PROV.cv_harga + x_pou * WEIGHTS_PROV.pou)
      / total_keterjangkauan * 100
    )
    indeks_pemanfaatan = (
      (x_sekolah * WEIGHTS_PROV.sekolah + x_air * WEIGHTS_PROV.air +
       (x_food_safety || 0) * WEIGHTS_PROV.food_safety + x_pph * WEIGHTS_PROV.pph + x_stunting * WEIGHTS_PROV.stunting)
      / total_pemanfaatan * 100
    )
  } else {
    const total_ketersediaan = WEIGHTS.ncpr + WEIGHTS.energy + WEIGHTS.protein + WEIGHTS.cadangan
    const total_keterjangkauan = WEIGHTS.poverty + WEIGHTS.cv_harga + WEIGHTS.pou
    const total_pemanfaatan = WEIGHTS.sekolah + WEIGHTS.air + WEIGHTS.pph + WEIGHTS.stunting

    indeks_ketersediaan = (
      (x_ncpr * WEIGHTS.ncpr + x_energy * WEIGHTS.energy +
       x_protein * WEIGHTS.protein + x_cadangan * WEIGHTS.cadangan)
      / total_ketersediaan * 100
    )
    indeks_keterjangkauan = (
      (x_poverty * WEIGHTS.poverty + x_cv_harga * WEIGHTS.cv_harga + x_pou * WEIGHTS.pou)
      / total_keterjangkauan * 100
    )
    indeks_pemanfaatan = (
      (x_sekolah * WEIGHTS.sekolah + x_air * WEIGHTS.air +
       x_pph * WEIGHTS.pph + x_stunting * WEIGHTS.stunting)
      / total_pemanfaatan * 100
    )
  }

  const result: FSVAResult = {
    p_ncpr:     getPriorityIndividual('ncpr',     indicators.ncpr, level),
    p_energy:   getPriorityIndividual('energy',   indicators.pct_ake, level),
    p_protein:  getPriorityIndividual('protein',  indicators.pct_prohe, level),
    p_cadangan: getPriorityIndividual('cadangan', indicators.rasio_cadangan, level),
    p_poverty:  getPriorityIndividual('poverty',  indicators.pct_miskin, level),
    p_cv_harga: getPriorityIndividual('cv_harga', indicators.cv_harga, level),
    p_pou:      getPriorityIndividual('pou',      indicators.pou, level),
    p_sekolah:  getPriorityIndividual('sekolah',  indicators.lama_sekolah, level),
    p_air:      getPriorityIndividual('air',      indicators.pct_no_water, level),
    p_pph:      getPriorityIndividual('pph',      indicators.skor_pph, level),
    p_stunting: getPriorityIndividual('stunting', indicators.pct_stunting, level),
    x_ncpr, x_energy, x_protein, x_cadangan,
    x_poverty, x_cv_harga, x_pou,
    x_sekolah, x_air, x_pph, x_stunting,
    skor_komposit: skor,
    indeks_komposit: indeks,
    prioritas,
    indeks_ketersediaan,
    indeks_keterjangkauan,
    indeks_pemanfaatan,
  }

  if (level === 'provinsi') {
    result.food_safety = indicators.food_safety;
    result.x_food_safety = x_food_safety;
    result.p_food_safety = getPriorityIndividual('food_safety', indicators.food_safety || 0, level);
  }

  return result;
}
