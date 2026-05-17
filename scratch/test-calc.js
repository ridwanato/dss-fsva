const WEIGHTS = {
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
};

const INDICATOR_RANGES = {
  ncpr:     { breaks: [0.50, 0.75, 1.00, 1.25, 1.50], inverse: true },
  energy:   { breaks: [70,   80,   90,   100,  110],  inverse: false },
  protein:  { breaks: [70,   80,   90,   100,  110],  inverse: false },
  cadangan: { breaks: [0.25, 0.38, 0.50, 0.63, 0.75], inverse: false },
  poverty:  { breaks: [10,   15,   20,   25,   30],   inverse: true },
  cv_harga: { breaks: [6,    7,    8,    9,    10],   inverse: true },
  pou:      { breaks: [5,    10,   15,   20,   25],   inverse: true },
  sekolah:  { breaks: [6.0,  6.5,  7.5,  8.5,  9.0], inverse: false },
  air:      { breaks: [30,   40,   50,   60,   70],   inverse: true },
  pph:      { breaks: [70,   75,   80,   85,   90],   inverse: false },
  stunting: { breaks: [20,   30,   40],               inverse: true, who: true },
};

function normalizeValue(key, value) {
  const range = INDICATOR_RANGES[key];
  const { breaks, inverse } = range;

  if ('who' in range && range.who) {
    const min_val = 40, max_val = 20;
    const clamped = Math.min(Math.max(value, max_val), min_val);
    return (min_val - clamped) / (min_val - max_val);
  }

  let min_val, max_val;
  if (inverse) {
    min_val = breaks[4]; max_val = breaks[0];
    const clamped = Math.min(Math.max(value, max_val), min_val);
    return (min_val - clamped) / (min_val - max_val);
  } else {
    min_val = breaks[0]; max_val = breaks[4];
    const clamped = Math.min(Math.max(value, min_val), max_val);
    return (clamped - min_val) / (max_val - min_val);
  }
}

const indicators = {
  ncpr: 7.492699,
  energy: 96.14,
  protein: 72.5022,
  cadangan: 0.276240794,
  poverty: 12.186622,
  cv_harga: 3.8905,
  pou: 2.740278058,
  sekolah: 9.356136,
  air: 2.740278058,
  pph: 92.0308,
  stunting: 4.0
};

let skor = 0;
for (const key of Object.keys(indicators)) {
  const norm = normalizeValue(key, indicators[key]);
  const weight = WEIGHTS[key];
  console.log(`x_${key} = ${norm} (weight: ${weight}) -> ${norm * weight}`);
  skor += norm * weight;
}
console.log('Indeks Komposit:', skor);
