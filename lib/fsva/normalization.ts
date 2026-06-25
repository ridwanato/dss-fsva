import { INDICATOR_RANGES } from './constants'

type IndicatorKey = keyof typeof INDICATOR_RANGES

// Tentukan prioritas individu berdasarkan range breaks di Tabel 2/6 Juknis
export function getPriorityIndividual(key: IndicatorKey, value: number): number {
  const range = INDICATOR_RANGES[key]
  const { breaks, inverse } = range
  const N = breaks.length

  if (inverse) {
    // Nilai besar = lebih buruk = prioritas rendah (angka prioritas kecil, e.g., 1)
    for (let i = N - 1; i >= 0; i--) {
      if (value >= breaks[i]) {
        return N - i;
      }
    }
    return N + 1;
  } else {
    // Nilai kecil = lebih buruk = prioritas rendah (angka prioritas kecil, e.g., 1)
    for (let i = 0; i < N; i++) {
      if (value < breaks[i]) {
        return i + 1;
      }
    }
    return N + 1;
  }
}


// Normalisasi nilai ke skala 0-1 berdasarkan min-max range
// Min = nilai terburuk, Max = nilai terbaik
export function normalizeValue(key: IndicatorKey, value: number): number {
  const range = INDICATOR_RANGES[key]
  const { min, max, inverse } = range

  // Clamp the raw value to the Min-Max boundaries to prevent scores outside [0, 1]
  const clamped = Math.max(min, Math.min(max, value))

  if (inverse) {
    // Indikator negatif/inverse: nilai besar = buruk, nilai kecil = baik
    // Skor normalisasi: (Max - Value) / (Max - Min)
    return (max - clamped) / (max - min)
  } else {
    // Indikator positif/normal: nilai besar = baik, nilai kecil = buruk
    // Skor normalisasi: (Value - Min) / (Max - Min)
    return (clamped - min) / (max - min)
  }
}

