import type { InferenceRequest, InferenceResponse, ReferralLevel } from '@/types'
import { getExposureDeltaPct } from '@/lib/exposure'
import { getRiskBand } from '@/lib/utils'

const MODEL_VERSION = 'breathprint-mock-v1.0'
const INFERENCE_API = import.meta.env.VITE_INFERENCE_API_URL as string | undefined

/**
 * Mock inference API — returns structured results per Proposal Section 15.
 * Uses FastAPI service when VITE_INFERENCE_API_URL is set.
 */
export async function runInference(req: InferenceRequest): Promise<InferenceResponse> {
  if (INFERENCE_API) {
    return runRemoteInference(req)
  }
  return runLocalInference(req)
}

async function runRemoteInference(req: InferenceRequest): Promise<InferenceResponse> {
  const form = new FormData()
  form.append('metadata', JSON.stringify(req))
  form.append('breath_audio', new Blob([''], { type: 'audio/webm' }), 'breath.webm')
  form.append('cough_audio', new Blob([''], { type: 'audio/webm' }), 'cough.webm')

  const res = await fetch(`${INFERENCE_API}/v1/analyze`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Inference API failed')
  const data = await res.json()
  return {
    riskScore: data.risk_score,
    riskBand: data.risk_band,
    explanationBullets: data.explanation_bullets,
    timeEvents: data.time_events,
    exposureDeltaPct: data.exposure_delta_pct,
    referralLevel: data.referral_level,
    modelVersion: data.model_version,
  }
}

async function runLocalInference(req: InferenceRequest): Promise<InferenceResponse> {
  await delay(1800 + Math.random() * 1200)

  const symptomAvg =
    (req.symptoms.cough +
      req.symptoms.chestPain +
      req.symptoms.shortnessOfBreath +
      req.symptoms.wheeze +
      req.symptoms.fatigue) /
    5

  const pm25Factor = Math.min(req.pm25UgM3 / 50, 2) * 15
  const exposureFactor = Math.min(req.exposureDoseWeekly / 1200, 1.5) * 20
  const ageFactor = req.age > 50 ? 8 : req.age > 40 ? 4 : 0
  const smokingFactor =
    req.smokingStatus === 'current' ? 15 : req.smokingStatus === 'former' ? 8 : 0
  const pefFactor = req.pefValue && req.pefValue < 350 ? 12 : 0

  let riskScore = Math.round(
    25 + symptomAvg * 8 + pm25Factor + exposureFactor + ageFactor + smokingFactor + pefFactor,
  )
  riskScore = Math.max(5, Math.min(95, riskScore + Math.round((Math.random() - 0.5) * 10)))

  const exposureDeltaPct = getExposureDeltaPct(
    req.exposureDoseWeekly,
    req.baselineAvgExposure,
  )

  if (exposureDeltaPct && exposureDeltaPct > 10) {
    riskScore = Math.min(95, riskScore + Math.round(exposureDeltaPct * 0.15))
  }

  const riskBand = getRiskBand(riskScore)
  const referralLevel = getReferralLevel(riskBand, riskScore)

  const explanationBullets = buildExplanation(req, riskScore, exposureDeltaPct)
  const timeEvents = [
    {
      start: 2.1,
      end: 2.6,
      label: 'ลดพลังงานความถี่สูงในช่วงท้ายการหายใจออก',
    },
    ...(symptomAvg > 2
      ? [{ start: 4.2, end: 5.1, label: 'ระยะหายใจออกยาวขึ้น (I:E ratio ↑)' }]
      : []),
  ]

  return {
    riskScore,
    riskBand,
    explanationBullets,
    timeEvents,
    exposureDeltaPct,
    referralLevel,
    modelVersion: MODEL_VERSION,
  }
}

function getReferralLevel(band: string, score: number): ReferralLevel {
  if (score >= 81 || band === 'very_high') return 'pulmonologist'
  if (score >= 61 || band === 'high') return 'ios'
  return 'monitor'
}

function buildExplanation(
  req: InferenceRequest,
  score: number,
  exposureDelta: number | null,
): string[] {
  const bullets: string[] = []

  if (score > 40) {
    bullets.push('ระยะหายใจออกยาวขึ้น (I:E ratio ↑) — สอดคล้องกับ peripheral airflow limitation')
  }
  if (score > 30) {
    bullets.push('พลังงานความถี่สูงลดในช่วงท้ายการหายใจออก')
  }
  bullets.push('พบเหตุการณ์เสียงผิดปกติที่ 2.1–2.6 วินาที (time-grounded)')

  if (exposureDelta !== null) {
    const dir = exposureDelta >= 0 ? '↑' : '↓'
    bullets.push(
      `Personal Exposure Dose ${dir} ${Math.abs(exposureDelta)}% เทียบ baseline ส่วนตัว`,
    )
  } else if (req.pm25UgM3 > 35) {
    bullets.push(`PM2.5 ปัจจุบัน ${req.pm25UgM3.toFixed(1)} µg/m³ — สูงกว่าเกณฑ์ WHO`)
  }

  if (req.symptoms.shortnessOfBreath >= 3) {
    bullets.push('อาการหายใจลำบากรายงานในแบบสอบถาม — สอดคล้องกับผลเสียง')
  }

  return bullets
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
