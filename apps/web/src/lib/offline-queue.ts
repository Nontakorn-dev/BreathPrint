import {
  addPendingUpload,
  getPendingUploads,
  removePendingUpload,
  saveScreening,
  updateBaselineFromScreenings,
  getUserScreenings,
  getBaseline,
} from '@/lib/storage'
import {
  uploadAudio,
  isSupabaseConfigured,
  upsertProfile,
  upsertScreening,
  insertResult,
  upsertBaseline,
} from '@/lib/supabase'
import { runInference } from '@/lib/inference'
import { getProfile } from '@/lib/storage'
import type { ScreeningSession } from '@/types'
import { generateId } from '@/lib/utils'

export async function queueScreeningForSync(session: ScreeningSession): Promise<void> {
  await addPendingUpload({
    id: session.id,
    session,
    createdAt: new Date().toISOString(),
  })
}

export async function syncPendingUploads(userId: string): Promise<number> {
  const pending = await getPendingUploads()
  let synced = 0

  for (const item of pending) {
    if (item.session.userId !== userId) continue
    try {
      await processAndSaveScreening(item.session, userId)
      await removePendingUpload(item.id)
      synced++
    } catch {
      // keep in queue for retry
    }
  }

  return synced
}

export async function processAndSaveScreening(
  session: ScreeningSession,
  userId: string,
): Promise<ScreeningSession> {
  const profile = await getProfile(userId)
  if (!profile) throw new Error('Profile not found')

  let breathUrl = session.breathAudioUrl
  let coughUrl = session.coughAudioUrl

  if (isSupabaseConfigured) {
    if (session.breathAudioBlob) {
      breathUrl = (await uploadAudio(userId, session.id, 'breath', session.breathAudioBlob)) ?? undefined
    }
    if (session.coughAudioBlob) {
      coughUrl = (await uploadAudio(userId, session.id, 'cough', session.coughAudioBlob)) ?? undefined
    }
  }

  const allScreenings = await getUserScreenings(userId)
  const baseline = allScreenings.filter((s) => s.result)

  const inference = await runInference({
    screeningId: session.id,
    symptoms: session.symptoms,
    pm25UgM3: session.pm25UgM3 ?? 42.6,
    exposureDoseWeekly: session.exposureDoseWeekly ?? 0,
    pefValue: session.pefValue,
    age: profile.age,
    smokingStatus: profile.smokingStatus,
    baselineAvgRisk:
      baseline.length > 0
        ? baseline.reduce((s, x) => s + (x.result?.riskScore ?? 0), 0) / baseline.length
        : undefined,
    baselineAvgExposure:
      baseline.length > 0
        ? baseline.reduce((s, x) => s + (x.exposureDoseWeekly ?? 0), 0) / baseline.length
        : undefined,
    breathAudio: session.breathAudioBlob,
    coughAudio: session.coughAudioBlob,
    breathDuration: session.breathDuration,
    coughDuration: session.coughDuration,
  })

  const completed: ScreeningSession = {
    ...session,
    breathAudioUrl: breathUrl,
    coughAudioUrl: coughUrl,
    status: 'complete',
    synced: navigator.onLine,
    result: {
      id: generateId(),
      screeningId: session.id,
      riskScore: inference.riskScore,
      confidence: inference.confidence,
      riskBand: inference.riskBand,
      explanationBullets: inference.explanationBullets,
      explanationLlm: inference.explanationLlm,
      timeEvents: inference.timeEvents,
      exposureDeltaPct: inference.exposureDeltaPct,
      referralLevel: inference.referralLevel,
      modelVersion: inference.modelVersion,
      createdAt: new Date().toISOString(),
    },
  }

  await saveScreening(completed)
  const updated = await getUserScreenings(userId)
  await updateBaselineFromScreenings(userId, updated)

  if (isSupabaseConfigured) {
    // Best-effort cloud sync. Non-fatal: local IndexedDB is the source of truth;
    // on failure the session stays in the pending queue and retries on reconnect.
    try {
      const finalBaseline = await getBaseline(userId)
      await upsertProfile(profile)
      await upsertScreening(completed, userId)
      if (completed.result) await insertResult(completed.result, completed.id)
      if (finalBaseline) await upsertBaseline(finalBaseline, userId)
    } catch {
      // swallowed — see comment above
    }
  }

  return completed
}

export function isOnline(): boolean {
  return navigator.onLine
}
