import { translate } from '@/i18n'
import { useThemeStore } from '@/store/theme-store'
import { getExposureLevel, formatExposureDose } from '@/lib/exposure'
import type {
  ScreeningResult,
  ScreeningSession,
  UserBaseline,
  UserProfile,
  ReferralLevel,
  RiskBand,
} from '@/types'

export interface AssistantContext {
  profile: UserProfile | null
  latestResult?: ScreeningResult
  latestSession?: ScreeningSession
  baseline?: UserBaseline | null
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const ASSISTANT_API = import.meta.env.VITE_ASSISTANT_API_URL as string | undefined

/**
 * Entry point. Uses a remote LLM-style endpoint when VITE_ASSISTANT_API_URL is
 * configured; otherwise falls back to the deterministic local responder.
 * Default is local — no health data leaves the device unless explicitly enabled.
 */
export async function askAssistant(
  message: string,
  ctx: AssistantContext,
): Promise<string> {
  if (ASSISTANT_API) {
    try {
      const res = await fetch(`${ASSISTANT_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, ctx }),
      })
      if (!res.ok) throw new Error('assistant api failed')
      const data = await res.json()
      if (typeof data.reply === 'string') return data.reply
      throw new Error('bad assistant response')
    } catch {
      // Fall back to the local responder on any failure.
    }
  }
  return generateAssistantReply(message, ctx)
}

/**
 * Deterministic, context-aware local responder (Thai + English via the i18n
 * assistant namespace). Same message + same context → same reply.
 */
export function generateAssistantReply(message: string, ctx: AssistantContext): string {
  const msg = message.toLowerCase().trim()
  const has = (...kws: string[]) => kws.some((k) => msg.includes(k))
  const result = ctx.latestResult

  // 1) confidence / signal quality / re-record
  if (has('มั่นใจ', 'คุณภาพ', 'confidence', 'quality', 're-record', 'อัดใหม่', 'ไม่แม่น', 'แม่น')) {
    if (!result) return translate('assistant.noResult')
    const confPct = Math.round((result.confidence ?? 0.7) * 100)
    if ((result.confidence ?? 0.7) < 0.55) {
      return translate('assistant.confidenceLow', { confidence: confPct })
    }
    return translate('assistant.confidenceOk', {
      level: confLevelWord(result.confidence ?? 0.7),
      confidence: confPct,
    })
  }

  // 2) baseline / trend
  if (has('baseline', 'แนวโน้ม', 'เปรียบเทียบ', 'trend', 'เฉลี่ย', 'average', 'เปลี่ยน')) {
    const b = ctx.baseline
    if (!b || b.screeningCount < 1) return translate('assistant.noBaseline')
    let deltaKey = 'assistant.baselineDeltaFlat'
    if (result && b.avgRiskScore > 0) {
      if (result.riskScore > b.avgRiskScore + 5) deltaKey = 'assistant.baselineDeltaUp'
      else if (result.riskScore < b.avgRiskScore - 5) deltaKey = 'assistant.baselineDeltaDown'
    }
    return translate('assistant.baselineTrend', {
      avg: Math.round(b.avgRiskScore),
      count: b.screeningCount,
      delta: translate(deltaKey),
    })
  }

  // 3) exposure / PM2.5 / air
  if (has('pm', 'ฝุ่น', 'อากาศ', 'exposure', 'air', 'dose', 'aqi', 'มลพิษ')) {
    const pm = ctx.latestSession?.pm25UgM3 ?? 0
    const dose = ctx.latestSession?.exposureDoseWeekly ?? 0
    return translate('assistant.exposure', {
      pm25: pm.toFixed(1),
      dose: formatExposureDose(dose),
      level: translate(`assistant.exposureLevel${cap(getExposureLevel(dose))}`),
    })
  }

  // 4) next steps / referral / doctor
  if (has('ต่อ', 'ทำอย่างไร', 'ส่งตรวจ', 'หมอ', 'แพทย์', 'refer', 'next', 'should', 'doctor', 'when', 'รักษา')) {
    if (!result) return translate('assistant.noResult')
    return translate('assistant.nextSteps', { referral: referralText(result.referralLevel) })
  }

  // 5) result meaning / risk / score
  if (has('ผล', 'แปล', 'ความเสี่ยง', 'risk', 'score', 'mean', 'result', 'คะแนน', 'หมาย')) {
    if (!result) return translate('assistant.noResult')
    return translate('assistant.resultExplain', {
      score: result.riskScore,
      band: bandLabel(result.riskBand),
      confidenceLevel: confLevelWord(result.confidence ?? 0.7),
      confidence: Math.round((result.confidence ?? 0.7) * 100),
    })
  }

  return translate('assistant.fallback')
}

function localeWord(th: string, en: string): string {
  return useThemeStore.getState().locale === 'en' ? en : th
}

function bandLabel(band: RiskBand): string {
  const map: Record<RiskBand, [string, string]> = {
    low: ['ต่ำ', 'low'],
    moderate: ['ปานกลาง', 'moderate'],
    high: ['สูง', 'high'],
    very_high: ['สูงมาก', 'very high'],
  }
  const [th, en] = map[band] ?? [band, band]
  return localeWord(th, en)
}

function confLevelWord(c: number): string {
  if (c >= 0.75) return localeWord('สูง', 'high')
  if (c >= 0.55) return localeWord('ปานกลาง', 'moderate')
  return localeWord('ต่ำ', 'low')
}

function referralText(level: ReferralLevel): string {
  switch (level) {
    case 'pulmonologist':
      return translate('assistant.referralPulmonologist')
    case 'ios':
      return translate('assistant.referralIos')
    default:
      return translate('assistant.referralMonitor')
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function quickReplies(): { id: string; messageKey: string }[] {
  return [
    { id: 'result', messageKey: 'assistant.quickResult' },
    { id: 'next', messageKey: 'assistant.quickNext' },
    { id: 'exposure', messageKey: 'assistant.quickExposure' },
    { id: 'baseline', messageKey: 'assistant.quickBaseline' },
  ]
}
