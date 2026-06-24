/**
 * Personal Exposure Dose calculation (µg·h/wk)
 * Combines current PM2.5 reading with estimated weekly outdoor exposure hours.
 */

const DEFAULT_WEEKLY_OUTDOOR_HOURS = 35
const CHIANG_MAI_FALLBACK_PM25 = 42.6

export interface ExposureInput {
  pm25UgM3: number
  weeklyOutdoorHours?: number
  /** Historical readings for rolling average (optional) */
  historicalPm25?: number[]
}

export interface ExposureResult {
  weeklyDose: number
  pm25Used: number
  weeklyOutdoorHours: number
  unit: 'µg·h/wk'
}

export function calculateWeeklyExposureDose(input: ExposureInput): ExposureResult {
  const hours = input.weeklyOutdoorHours ?? DEFAULT_WEEKLY_OUTDOOR_HOURS
  const readings = input.historicalPm25?.length
    ? [...input.historicalPm25, input.pm25UgM3]
    : [input.pm25UgM3]

  const avgPm25 = readings.reduce((a, b) => a + b, 0) / readings.length
  const weeklyDose = avgPm25 * hours

  return {
    weeklyDose: Math.round(weeklyDose * 10) / 10,
    pm25Used: Math.round(avgPm25 * 10) / 10,
    weeklyOutdoorHours: hours,
    unit: 'µg·h/wk',
  }
}

export function getExposureDeltaPct(
  currentDose: number,
  baselineDose: number | undefined,
): number | null {
  if (!baselineDose || baselineDose === 0) return null
  return Math.round(((currentDose - baselineDose) / baselineDose) * 100)
}

export function getChiangMaiFallbackPm25(): number {
  return CHIANG_MAI_FALLBACK_PM25
}

export function getExposureLevel(dose: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (dose < 500) return 'low'
  if (dose < 1000) return 'moderate'
  if (dose < 1500) return 'high'
  return 'very_high'
}

export function formatExposureDose(dose: number): string {
  return `${dose.toLocaleString('th-TH')} µg·h/wk`
}
