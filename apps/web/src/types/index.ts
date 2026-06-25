export type Sex = 'male' | 'female' | 'other'
export type SmokingStatus = 'never' | 'former' | 'current'
export type RiskBand = 'low' | 'moderate' | 'high' | 'very_high'
export type ReferralLevel = 'monitor' | 'ios' | 'pulmonologist'
export type ScreeningStatus = 'draft' | 'uploading' | 'analyzing' | 'complete' | 'failed'

export interface UserProfile {
  id: string
  age: number
  sex: Sex
  smokingStatus: SmokingStatus
  deviceModel: string
  consentAt: string
  createdAt: string
  /** Which consents were granted (persisted for PDPA/IRB audit, not just a timestamp). */
  consentResearch?: boolean
  consentPdpa?: boolean
  consentAudio?: boolean
}

/** The three IRB/PDPA consent decisions collected on the consent screen. */
export interface ConsentDecision {
  consentResearch: boolean
  consentPdpa: boolean
  consentAudio: boolean
}

export interface SymptomScores {
  cough: number
  chestPain: number
  shortnessOfBreath: number
  wheeze: number
  fatigue: number
}

export interface LocationData {
  lat: number
  lng: number
  pm25UgM3: number
  aqiSource: string
}

export interface TimeEvent {
  start: number
  end: number
  label: string
}

export interface ScreeningResult {
  id: string
  screeningId: string
  riskScore: number
  /** Model confidence 0..1 (GallopGuard principle: every report carries confidence). */
  confidence: number
  riskBand: RiskBand
  explanationBullets: string[]
  timeEvents: TimeEvent[]
  exposureDeltaPct: number | null
  referralLevel: ReferralLevel
  modelVersion: string
  /** Phase 2 — audio-grounded LLM explanation (Typhoon), null if unavailable. */
  explanationLlm?: string
  createdAt: string
}

export interface ScreeningSession {
  id: string
  userId: string
  breathAudioBlob?: Blob
  coughAudioBlob?: Blob
  /** Recorded durations in seconds (fed into the inference pipeline). */
  breathDuration?: number
  coughDuration?: number
  breathAudioUrl?: string
  coughAudioUrl?: string
  lat?: number
  lng?: number
  pm25UgM3?: number
  exposureDoseWeekly?: number
  symptoms: SymptomScores
  pefValue?: number
  deviceInfo: string
  status: ScreeningStatus
  result?: ScreeningResult
  createdAt: string
  synced: boolean
}

export interface UserBaseline {
  userId: string
  avgRiskScore: number
  avgExposureDose: number
  screeningCount: number
  updatedAt: string
}

export interface InferenceRequest {
  screeningId: string
  symptoms: SymptomScores
  pm25UgM3: number
  exposureDoseWeekly: number
  pefValue?: number
  age: number
  smokingStatus: SmokingStatus
  baselineAvgRisk?: number
  baselineAvgExposure?: number
  /** Recorded audio blobs + durations, fed into the staged pipeline. */
  breathAudio?: Blob
  coughAudio?: Blob
  breathDuration?: number
  coughDuration?: number
}

export interface InferenceResponse {
  riskScore: number
  /** Model confidence 0..1. */
  confidence: number
  riskBand: RiskBand
  explanationBullets: string[]
  timeEvents: TimeEvent[]
  exposureDeltaPct: number | null
  referralLevel: ReferralLevel
  modelVersion: string
  explanationLlm?: string
}

export interface PendingUpload {
  id: string
  session: ScreeningSession
  createdAt: string
}
