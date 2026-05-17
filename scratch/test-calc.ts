import { calculateFSVAResult } from './lib/fsva/composite-score';

const indicators = {
  ncpr: 7.492699,
  pct_ake: 96.14,
  pct_prohe: 72.5022,
  rasio_cadangan: 0.276240794,
  pct_miskin: 12.186622,
  cv_harga: 3.8905,
  pou: 2.740278058,
  lama_sekolah: 9.356136,
  pct_no_water: 2.740278058,
  skor_pph: 92.0308,
  pct_stunting: 4.0
};

const result = calculateFSVAResult(indicators as any);
console.log(result);
