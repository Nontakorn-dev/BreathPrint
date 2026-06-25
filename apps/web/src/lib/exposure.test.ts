import { describe, it, expect } from 'vitest'
import {
  calculateWeeklyExposureDose,
  getExposureDeltaPct,
  getExposureLevel,
} from '@/lib/exposure'

describe('calculateWeeklyExposureDose', () => {
  it('multiplies PM2.5 by the default weekly outdoor hours', () => {
    const r = calculateWeeklyExposureDose({ pm25UgM3: 40 })
    expect(r.weeklyDose).toBe(1400) // 40 * 35h
    expect(r.weeklyOutdoorHours).toBe(35)
    expect(r.unit).toBe('µg·h/wk')
  })

  it('honours a custom outdoor-hours value', () => {
    expect(calculateWeeklyExposureDose({ pm25UgM3: 50, weeklyOutdoorHours: 10 }).weeklyDose).toBe(500)
  })

  it('averages historical readings with the current one', () => {
    const r = calculateWeeklyExposureDose({ pm25UgM3: 60, historicalPm25: [20] })
    expect(r.pm25Used).toBe(40) // mean(20, 60)
    expect(r.weeklyDose).toBe(1400) // 40 * 35
  })
})

describe('getExposureDeltaPct', () => {
  it('returns null when there is no baseline', () => {
    expect(getExposureDeltaPct(100, undefined)).toBeNull()
    expect(getExposureDeltaPct(100, 0)).toBeNull()
  })

  it('computes a signed percent change vs baseline', () => {
    expect(getExposureDeltaPct(120, 100)).toBe(20)
    expect(getExposureDeltaPct(80, 100)).toBe(-20)
  })
})

describe('getExposureLevel', () => {
  it('classifies a dose into bands', () => {
    expect(getExposureLevel(100)).toBe('low')
    expect(getExposureLevel(700)).toBe('moderate')
    expect(getExposureLevel(1200)).toBe('high')
    expect(getExposureLevel(2000)).toBe('very_high')
  })
})
