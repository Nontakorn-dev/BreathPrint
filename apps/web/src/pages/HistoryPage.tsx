import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { ScreeningHistory } from '@/components/baseline/ScreeningHistory'
import { BaselineChart } from '@/components/baseline/BaselineChart'
import { useAuthStore } from '@/store/auth-store'
import { getUserScreenings, getBaseline } from '@/lib/storage'
import { syncPendingUploads } from '@/lib/offline-queue'
import type { ScreeningSession, UserBaseline } from '@/types'

export function HistoryPage() {
  const userId = useAuthStore((s) => s.userId)
  const location = useLocation()
  const [sessions, setSessions] = useState<ScreeningSession[]>([])
  const [baseline, setBaseline] = useState<UserBaseline | null>(null)
  const [syncing, setSyncing] = useState(false)

  const load = async () => {
    if (!userId) return
    const [s, b] = await Promise.all([getUserScreenings(userId), getBaseline(userId)])
    setSessions(s)
    setBaseline(b ?? null)
  }

  useEffect(() => {
    load()
  }, [userId])

  const handleSync = async () => {
    if (!userId) return
    setSyncing(true)
    await syncPendingUploads(userId)
    await load()
    setSyncing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHero
          className="mb-0"
          title="ประวัติการคัดกรอง"
          subtitle="Personalized Acoustic Baseline และแนวโน้มตามเวลา"
        />
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="shrink-0 mt-1">
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      </div>

      {(location.state as { offlineQueued?: boolean })?.offlineQueued && (
        <div className="rounded-2xl border border-warn/30 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-warn font-medium">
          บันทึกออฟไลน์แล้ว — กด Sync เมื่อกลับมาออนไลน์
        </div>
      )}

      {baseline && (
        <SurfacePanel>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Baseline เฉลี่ย</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-brand font-display">{baseline.avgRiskScore}</p>
              <p className="text-xs text-muted mt-1">Risk Score</p>
            </div>
            <div className="text-center border-x border-line">
              <p className="text-3xl font-extrabold text-brand2 font-display">{baseline.avgExposureDose}</p>
              <p className="text-xs text-muted mt-1">Exposure µg·h/wk</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-ink font-display">{baseline.screeningCount}</p>
              <p className="text-xs text-muted mt-1">ครั้ง</p>
            </div>
          </div>
        </SurfacePanel>
      )}

      <BaselineChart sessions={sessions} />
      <ScreeningHistory sessions={sessions} />
    </div>
  )
}
