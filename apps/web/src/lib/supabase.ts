import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  ScreeningResult,
  ScreeningSession,
  UserBaseline,
  UserProfile,
} from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export async function ensureAuth(): Promise<string> {
  if (!supabase) {
    const localId = localStorage.getItem('breathprint_user_id')
    if (localId) return localId
    const newId = crypto.randomUUID()
    localStorage.setItem('breathprint_user_id', newId)
    return newId
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user!.id
}

export async function uploadAudio(
  userId: string,
  screeningId: string,
  type: 'breath' | 'cough',
  blob: Blob,
): Promise<string | null> {
  if (!supabase) return null

  const ext = blob.type.includes('webm') ? 'webm' : 'wav'
  const path = `${userId}/${screeningId}/${type}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('audio-recordings')
    .upload(path, blob, { upsert: true, contentType: blob.type })
  if (upErr) throw upErr

  // Private bucket → use a signed URL (not getPublicUrl, which 403s on private).
  const { data, error: signErr } = await supabase.storage
    .from('audio-recordings')
    .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days
  if (signErr || !data?.signedUrl) throw signErr ?? new Error('signed url failed')
  return data.signedUrl
}

// ---------------------------------------------------------------------------
// Cloud-table sync (WS3). All no-ops when Supabase is not configured, so the
// app keeps working fully offline on IndexedDB. Callers treat errors as
// non-fatal (local data remains the source of truth; pending queue retries).
// ---------------------------------------------------------------------------

export async function upsertProfile(profile: UserProfile): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('profiles').upsert({
    id: profile.id,
    age: profile.age,
    sex: profile.sex,
    smoking_status: profile.smokingStatus,
    device_model: profile.deviceModel,
    consent_at: profile.consentAt,
    consent_research: profile.consentResearch ?? false,
    consent_pdpa: profile.consentPdpa ?? false,
    consent_audio: profile.consentAudio ?? false,
  })
  if (error) throw error
}

export async function upsertScreening(
  session: ScreeningSession,
  userId: string,
): Promise<string> {
  if (!supabase) return session.id
  const { error } = await supabase.from('screenings').upsert({
    id: session.id,
    user_id: userId,
    breath_audio_url: session.breathAudioUrl ?? null,
    cough_audio_url: session.coughAudioUrl ?? null,
    lat: session.lat ?? null,
    lng: session.lng ?? null,
    pm25_ugm3: session.pm25UgM3 ?? null,
    exposure_dose_weekly: session.exposureDoseWeekly ?? null,
    symptoms_json: session.symptoms,
    pef_value: session.pefValue ?? null,
    device_info: session.deviceInfo,
    status: session.status,
    created_at: session.createdAt,
  })
  if (error) throw error
  return session.id
}

export async function insertResult(
  result: ScreeningResult,
  screeningId: string,
): Promise<void> {
  if (!supabase) return
  // Upsert keyed on screening_id (UNIQUE) so re-analysis updates the same row.
  const { error } = await supabase
    .from('results')
    .upsert(
      {
        screening_id: screeningId,
        risk_score: result.riskScore,
        confidence: result.confidence,
        risk_band: result.riskBand,
        explanation_bullets: result.explanationBullets,
        time_events_json: result.timeEvents,
        exposure_delta_pct: result.exposureDeltaPct,
        referral_level: result.referralLevel,
        model_version: result.modelVersion,
      },
      { onConflict: 'screening_id' },
    )
  if (error) throw error
}

export async function upsertBaseline(baseline: UserBaseline, userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('baselines').upsert({
    user_id: userId,
    avg_risk_score: baseline.avgRiskScore,
    avg_exposure_dose: baseline.avgExposureDose,
    screening_count: baseline.screeningCount,
    updated_at: baseline.updatedAt,
  })
  if (error) throw error
}
