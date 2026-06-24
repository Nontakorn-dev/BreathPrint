import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RiskBand } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskBand(score: number): RiskBand {
  if (score <= 30) return 'low'
  if (score <= 60) return 'moderate'
  if (score <= 80) return 'high'
  return 'very_high'
}

export function getRiskBandLabel(band: RiskBand): string {
  const labels: Record<RiskBand, string> = {
    low: 'ต่ำ (Low)',
    moderate: 'ปานกลาง (Moderate)',
    high: 'สูง (High)',
    very_high: 'สูงมาก (Very High)',
  }
  return labels[band]
}

export function getRiskBandColor(band: RiskBand): string {
  const colors: Record<RiskBand, string> = {
    low: 'var(--color-good)',
    moderate: 'var(--color-warn)',
    high: 'var(--color-accent)',
    very_high: 'var(--color-bad)',
  }
  return colors[band]
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getDeviceModel(): string {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) {
    const match = ua.match(/Android[^;]*;\s*([^)]+)/)
    return match?.[1]?.trim() ?? 'Android'
  }
  return 'Unknown'
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
