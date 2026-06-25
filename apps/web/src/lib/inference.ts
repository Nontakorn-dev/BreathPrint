import type { InferenceRequest, InferenceResponse, ReferralLevel, TimeEvent } from '@/types'
import { getExposureDeltaPct } from '@/lib/exposure'
import { getRiskBand } from '@/lib/utils'
import { blobToWav } from '@/lib/audio-wav'

const MODEL_VERSION = 'breathprint-mock-v2.0'
const INFERENCE_API = import.meta.env.VITE_INFERENCE_API_URL as string | undefined

/**
 * BreathPrint inference — MOCK pipeline (v2.0), structured to mirror the
 * acoustic methodology shared with the GallopGuard cardiac sibling and the
 * CardiacZ architecture described in the proposal:
 *   capture → denoise → segment → spectral features → calibrated risk
 *
 * Two hard rules for a screening tool:
 *   1. DETERMINISTIC. Same input → same output, always. The previous mock used
 *      Math.random(), so the same submission yielded different scores run-to-run
 *      and a re-sync on reconnect produced a different result than the preview
 *      (non-idempotent, medically misleading). Every pseudo-feature below is
 *      derived from a seeded PRNG over the recording's own properties
 *      (byte size + duration) + the questionnaire/metadata — never Math.random.
 *   2. EVERY RESULT CARRIES A CONFIDENCE VALUE. Low confidence (poor signal)
 *      must tell the user to re-record or see a clinician directly.
 *
 * This is the MOCK. To plug in a real model, replace `spectralFeaturesStage`
 * and `calibratedRiskStage` with a Dasheng/BEATs encoder + layer-weighted probe
 * (see docs/MODELS.md). The remote path (`VITE_INFERENCE_API_URL`) already
 * forwards the real audio blobs to the FastAPI service, which mirrors this.
 */
export async function runInference(req: InferenceRequest): Promise<InferenceResponse> {
  if (INFERENCE_API) {
    return runRemoteInference(req)
  }
  return runLocalInference(req)
}

async function runRemoteInference(req: InferenceRequest): Promise<InferenceResponse> {
  const form = new FormData()
  // Strip Blob fields (they serialize to `{}`) — audio travels as multipart files.
  const { breathAudio: _b, coughAudio: _c, ...meta } = req
  form.append('metadata', JSON.stringify(meta))
  // Convert webm → WAV so the backend decodes without ffmpeg.
  if (req.breathAudio) form.append('breath_audio', await blobToWav(req.breathAudio), 'breath.wav')
  if (req.coughAudio) form.append('cough_audio', await blobToWav(req.coughAudio), 'cough.wav')

  const res = await fetch(`${INFERENCE_API}/v1/analyze`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Inference API failed')
  const data = await res.json()
  return {
    riskScore: data.risk_score,
    confidence: data.confidence ?? 0.7,
    riskBand: data.risk_band,
    explanationBullets: data.explanation_bullets,
    timeEvents: data.time_events,
    exposureDeltaPct: data.exposure_delta_pct,
    referralLevel: data.referral_level,
    modelVersion: data.model_version,
    explanationLlm: data.explanation_llm ?? undefined,
  }
}

async function runLocalInference(req: InferenceRequest): Promise<InferenceResponse> {
  // Fixed (non-random) latency so the pipeline "feels" like it analyses, but is
  // reproducible. A real encoder will set its own latency.
  await delay(1400)

  const capture = captureStage(req)
  const rng = makeRng(
    req.screeningId,
    capture.breathBytes,
    capture.breathDuration,
    capture.coughBytes,
    capture.coughDuration,
  )
  const denoise = denoiseStage(capture, rng)
  const segment = segmentStage(req, capture, rng)
  const features = spectralFeaturesStage(req, capture, rng)
  const exposureDeltaPct = getExposureDeltaPct(req.exposureDoseWeekly, req.baselineAvgExposure)

  const { riskScore, confidence, explanationBullets } = calibratedRiskStage(
    req,
    features,
    segment,
    capture,
    denoise.estimatedSnr,
    exposureDeltaPct,
  )

  return {
    riskScore,
    confidence,
    riskBand: getRiskBand(riskScore),
    explanationBullets,
    timeEvents: segment.timeEvents,
    exposureDeltaPct,
    referralLevel: getReferralLevel(getRiskBand(riskScore), riskScore),
    modelVersion: MODEL_VERSION,
  }
}

// ---------------------------------------------------------------------------
// Stage 1 — capture: validate signal presence & basic quality from the blobs.
// ---------------------------------------------------------------------------
interface CaptureResult {
  breathBytes: number
  coughBytes: number
  breathDuration: number
  coughDuration: number
  breathPresent: boolean
  coughPresent: boolean
  qualityFlags: string[]
}

function captureStage(req: InferenceRequest): CaptureResult {
  const breathBytes = req.breathAudio?.size ?? 0
  const coughBytes = req.coughAudio?.size ?? 0
  const breathDuration = req.breathDuration ?? 0
  const coughDuration = req.coughDuration ?? 0
  const breathPresent = breathBytes > 1000 && breathDuration >= 3
  const coughPresent = coughBytes > 1000 && coughDuration >= 1
  const qualityFlags: string[] = []
  if (!breathPresent) qualityFlags.push('breath-too-short-or-silent')
  if (!coughPresent) qualityFlags.push('cough-missing')
  const breathBytesPerSec = breathDuration > 0 ? breathBytes / breathDuration : 0
  if (breathPresent && breathBytesPerSec < 300) qualityFlags.push('low-signal-level')
  return {
    breathBytes,
    coughBytes,
    breathDuration,
    coughDuration,
    breathPresent,
    coughPresent,
    qualityFlags,
  }
}

// ---------------------------------------------------------------------------
// Stage 2 — denoise: deterministic SNR proxy derived from bytes/duration.
// (Real model: learned clinical denoiser front-end.)
// ---------------------------------------------------------------------------
function denoiseStage(capture: CaptureResult, rng: () => number) {
  const bytesPerSec = capture.breathDuration > 0 ? capture.breathBytes / capture.breathDuration : 0
  const levelBonus = bytesPerSec > 800 ? 4 : bytesPerSec > 400 ? 0 : -6
  const estimatedSnr = clamp(rngRange(rng, 14, 24) + levelBonus, 6, 32)
  return { estimatedSnr }
}

// ---------------------------------------------------------------------------
// Stage 3 — segmentation: deterministic breathing rate + time-grounded events.
// (Real model: breath-cycle segmentation → I:E ratio, adventitious events.)
// ---------------------------------------------------------------------------
interface SegmentResult {
  breathingRate: number
  ieRatio: number
  timeEvents: TimeEvent[]
}

function segmentStage(
  _req: InferenceRequest,
  capture: CaptureResult,
  rng: () => number,
): SegmentResult {
  const breathingRate = Math.round(rngRange(rng, 13, 19) * 10) / 10
  // I:E ratio proxy — higher implies expiratory prolongation (a SAD signal).
  const ieRatio = Math.round(rngRange(rng, 1.0, 2.2) * 100) / 100
  // Place a time-grounded event deterministically within the recording window.
  const span = clamp(capture.breathDuration || 6, 3, 15)
  const evStart = Math.round(rngRange(rng, 1.8, Math.max(2.2, span - 1.5)) * 10) / 10
  const evEnd = Math.round((evStart + rngRange(rng, 0.4, 0.9)) * 10) / 10
  const timeEvents: TimeEvent[] = [
    { start: evStart, end: evEnd, label: 'ลดพลังงานความถี่สูงในช่วงท้ายการหายใจออก' },
  ]
  return { breathingRate, ieRatio, timeEvents }
}

// ---------------------------------------------------------------------------
// Stage 4 — spectral features (mock proxies of expiratory prolongation & HF decay).
// *** REAL-MODEL SEAM: replace with Dasheng/BEATs embeddings → layer-weighted
// probe (causal layer selection from AG-REPA per proposal §7). ***
// ---------------------------------------------------------------------------
interface SpectralFeatures {
  highFreqDecay: number
}

function spectralFeaturesStage(
  _req: InferenceRequest,
  _capture: CaptureResult,
  rng: () => number,
): SpectralFeatures {
  // Proxy for reduction of high-frequency energy in late expiration (a SAD sign).
  const highFreqDecay = Math.round(rngRange(rng, 0.15, 0.8) * 100) / 100
  return { highFreqDecay }
}

// ---------------------------------------------------------------------------
// Stage 5 — calibrated risk + confidence + explanation (GallopGuard principle).
// ---------------------------------------------------------------------------
function calibratedRiskStage(
  req: InferenceRequest,
  features: SpectralFeatures,
  segment: SegmentResult,
  capture: CaptureResult,
  snr: number,
  exposureDeltaPct: number | null,
): { riskScore: number; confidence: number; explanationBullets: string[] } {
  const symptomAvg =
    (req.symptoms.cough +
      req.symptoms.chestPain +
      req.symptoms.shortnessOfBreath +
      req.symptoms.wheeze +
      req.symptoms.fatigue) /
    5

  // Clinical-metadata contribution (deterministic, unchanged from v1 minus RNG).
  const pm25Factor = Math.min(req.pm25UgM3 / 50, 2) * 15
  const exposureFactor = Math.min(req.exposureDoseWeekly / 1200, 1.5) * 20
  const ageFactor = req.age > 50 ? 8 : req.age > 40 ? 4 : 0
  const smokingFactor =
    req.smokingStatus === 'current' ? 15 : req.smokingStatus === 'former' ? 8 : 0
  const pefFactor = req.pefValue && req.pefValue < 350 ? 12 : 0

  // Acoustic contribution (mock): worse when expiratory phase prolonged (I:E ↑)
  // and/or high-frequency energy decays in late expiration.
  const ieRatio = segment.ieRatio
  const acousticFactor = clamp((ieRatio - 1) * 10 + (1 - features.highFreqDecay) * 8, 0, 18)

  let riskScore = Math.round(
    25 +
      symptomAvg * 8 +
      pm25Factor +
      exposureFactor +
      ageFactor +
      smokingFactor +
      pefFactor +
      acousticFactor,
  )
  if (exposureDeltaPct && exposureDeltaPct > 10) {
    riskScore += Math.round(exposureDeltaPct * 0.15)
  }
  riskScore = clamp(riskScore, 5, 95)

  // Confidence: signal completeness + quality + SNR + baseline availability.
  // Low confidence → app prompts re-record / direct physician review.
  const signalScore =
    (capture.breathPresent ? 0.3 : 0) + (capture.coughPresent ? 0.15 : 0)
  const qualityScore =
    capture.qualityFlags.length === 0 ? 0.15 : capture.qualityFlags.length === 1 ? 0.07 : 0
  const snrScore = snr >= 22 ? 0.05 : 0
  const baselineScore = req.baselineAvgRisk != null ? 0.15 : 0
  const confidence = clamp(
    Math.round((0.25 + signalScore + qualityScore + snrScore + baselineScore) * 100) / 100,
    0.2,
    0.95,
  )

  const explanationBullets = buildExplanation(
    req,
    ieRatio,
    features.highFreqDecay,
    segment.timeEvents[0],
    exposureDeltaPct,
  )

  return { riskScore, confidence, explanationBullets }
}

function getReferralLevel(band: string, score: number): ReferralLevel {
  if (score >= 81 || band === 'very_high') return 'pulmonologist'
  if (score >= 61 || band === 'high') return 'ios'
  return 'monitor'
}

function buildExplanation(
  req: InferenceRequest,
  ieRatio: number,
  highFreqDecay: number,
  primaryEvent: TimeEvent | undefined,
  exposureDelta: number | null,
): string[] {
  const bullets: string[] = []

  if (ieRatio > 1.4) {
    bullets.push(
      `ระยะหายใจออกยาวขึ้น (I:E ratio ${ieRatio.toFixed(2)}) — สอดคล้องกับ peripheral airflow limitation`,
    )
  }
  if (highFreqDecay > 0.4) {
    bullets.push('พลังงานความถี่สูงลดในช่วงท้ายการหายใจออก')
  }
  if (primaryEvent) {
    bullets.push(
      `พบเหตุการณ์เสียงผิดปกติที่ ${primaryEvent.start.toFixed(1)}–${primaryEvent.end.toFixed(
        1,
      )} วินาที (time-grounded)`,
    )
  }

  if (exposureDelta !== null) {
    const dir = exposureDelta >= 0 ? '↑' : '↓'
    bullets.push(
      `Personal Exposure Dose ${dir} ${Math.abs(exposureDelta)}% เทียบ baseline ส่วนตัว`,
    )
  } else if (req.pm25UgM3 > 35) {
    bullets.push(`PM2.5 ปัจจุบัน ${req.pm25UgM3.toFixed(1)} µg/m³ — สูงกว่าเกณฑ์ WHO`)
  }

  if (req.symptoms.shortnessOfBreath >= 3) {
    bullets.push('อาการหายใจลำบากรายงานในแบบสอยถาม — สอดคล้องกับผลเสียง')
  }

  return bullets
}

// ---------------------------------------------------------------------------
// Deterministic PRNG helpers (mulberry32 + xmur3 seed). No Math.random anywhere.
// ---------------------------------------------------------------------------
function makeRng(...parts: (string | number | undefined)[]): () => number {
  const seed = xmur3(parts.map((p) => String(p ?? '')).join('|'))()
  return mulberry32(seed)
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
