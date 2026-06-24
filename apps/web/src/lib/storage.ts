import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  PendingUpload,
  ScreeningSession,
  UserBaseline,
  UserProfile,
} from '@/types'

interface BreathPrintDB extends DBSchema {
  profile: {
    key: string
    value: UserProfile
  }
  screenings: {
    key: string
    value: ScreeningSession
    indexes: { 'by-user': string; 'by-date': string }
  }
  pending: {
    key: string
    value: PendingUpload
  }
  baseline: {
    key: string
    value: UserBaseline
  }
}

let dbPromise: Promise<IDBPDatabase<BreathPrintDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<BreathPrintDB>('breathprint', 1, {
      upgrade(db) {
        db.createObjectStore('profile')
        const screenings = db.createObjectStore('screenings', { keyPath: 'id' })
        screenings.createIndex('by-user', 'userId')
        screenings.createIndex('by-date', 'createdAt')
        db.createObjectStore('pending', { keyPath: 'id' })
        db.createObjectStore('baseline')
      },
    })
  }
  return dbPromise
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDb()
  await db.put('profile', profile, profile.id)
}

export async function getProfile(userId: string): Promise<UserProfile | undefined> {
  const db = await getDb()
  return db.get('profile', userId)
}

export async function saveScreening(session: ScreeningSession): Promise<void> {
  const db = await getDb()
  const { breathAudioBlob, coughAudioBlob, ...rest } = session
  await db.put('screenings', { ...rest, breathAudioBlob, coughAudioBlob } as ScreeningSession)
}

export async function getScreening(id: string): Promise<ScreeningSession | undefined> {
  const db = await getDb()
  return db.get('screenings', id)
}

export async function getUserScreenings(userId: string): Promise<ScreeningSession[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('screenings', 'by-user', userId)
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveBaseline(baseline: UserBaseline): Promise<void> {
  const db = await getDb()
  await db.put('baseline', baseline, baseline.userId)
}

export async function getBaseline(userId: string): Promise<UserBaseline | undefined> {
  const db = await getDb()
  return db.get('baseline', userId)
}

export async function addPendingUpload(pending: PendingUpload): Promise<void> {
  const db = await getDb()
  await db.put('pending', pending)
}

export async function getPendingUploads(): Promise<PendingUpload[]> {
  const db = await getDb()
  return db.getAll('pending')
}

export async function removePendingUpload(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('pending', id)
}

export async function updateBaselineFromScreenings(
  userId: string,
  sessions: ScreeningSession[],
): Promise<UserBaseline> {
  const completed = sessions.filter((s) => s.result)
  const avgRisk =
    completed.reduce((sum, s) => sum + (s.result?.riskScore ?? 0), 0) /
    (completed.length || 1)
  const avgExposure =
    completed.reduce((sum, s) => sum + (s.exposureDoseWeekly ?? 0), 0) /
    (completed.length || 1)

  const baseline: UserBaseline = {
    userId,
    avgRiskScore: Math.round(avgRisk),
    avgExposureDose: Math.round(avgExposure * 10) / 10,
    screeningCount: completed.length,
    updatedAt: new Date().toISOString(),
  }

  await saveBaseline(baseline)
  return baseline
}
