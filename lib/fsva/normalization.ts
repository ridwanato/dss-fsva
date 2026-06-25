import { INDICATOR_RANGES } from './constants'

type IndicatorKey = keyof typeof INDICATOR_RANGES

// Tentukan prioritas individu (1-6) berdasarkan range Tabel 2 Juknis
export function getPriorityIndividual(key: IndicatorKey, value: number): number {
  const range = INDICATOR_RANGES[key]
  const { breaks, inverse } = range

  let priority: number
  if (inverse) {
    // Nilai besar = lebih buruk = prioritas rendah (1)
    if (value >= breaks[4]) priority = 1
    else if (value >= breaks[3]) priority = 2
    else if (value >= breaks[2]) priority = 3
    else if (value >= breaks[1]) priority = 4
    else if (value >= breaks[0]) priority = 5
    else priority = 6
  } else {
    // Nilai kecil = lebih buruk = prioritas rendah (1)
    if (value < breaks[0]) priority = 1
    else if (value < breaks[1]) priority = 2
    else if (value < breaks[2]) priority = 3
    else if (value < breaks[3]) priority = 4
    else if (value < breaks[4]) priority = 5
    else priority = 6
  }
  return priority
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

