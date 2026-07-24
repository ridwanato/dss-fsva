import { calculateAllIndicators, RawIndicatorInput } from './form1-calculator'
import { calculateFSVAResult, FSVAResult } from './composite-score'

export interface FSVAFullResult extends FSVAResult {
  kode_bps: string
  tahun: number
}

export function processFSVAData(
  data: (RawIndicatorInput & { kode_bps: string, tahun: number })[],
  level: 'kab_kota' | 'provinsi' = 'kab_kota'
): FSVAFullResult[] {
  return data.map(item => {
    const indicators = calculateAllIndicators(item, level)
    const result = calculateFSVAResult(indicators, level)
    
    return {
      ...result,
      kode_bps: item.kode_bps,
      tahun: item.tahun,
    }
  })
}
