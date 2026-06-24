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
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageHero
          className="mb-0"
          title="ประวัติการคัดกรอง"
          subtitle="Personalized Acoustic Baseline และแนวโน้มตามเวลา"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="shrink-0 mt-1 border-line"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      </div>

      {(location.state as { offlineQueued?: boolean })?.offlineQueued && (
        <div className="rounded-2xl border border-warn/30 bg-amber-50 dark:bg-amber-950/30 px-5 py-3.5 text-sm text-warn font-medium">
          บันทึกออฟไลน์แล้ว — กด Sync เมื่อกลับมาออนไลน์
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <BaselineChart sessions={sessions} />
          <ScreeningHistory sessions={sessions} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {baseline ? (
            <SurfacePanel className="sticky top-24">
              <p className="section-label mb-4">Baseline เฉลี่ย</p>
              <div className="space-y-5">
                <div className="text-center rounded-2xl bg-brand-light/40 dark:bg-brand/10 py-6">
                  <p className="text-5xl font-extrabold text-brand font-display leading-none">
                    {baseline.avgRiskScore}
                  </p>
                  <p className="text-xs text-muted mt-2 font-medium">Risk Score เฉลี่ย</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-panel/50 p-4 text-center">
                    <p className="text-2xl font-extrabold text-brand2 font-display">
                      {baseline.avgExposureDose}
                    </p>
                    <p className="text-[10px] text-muted mt-1">µg·h/wk</p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel/50 p-4 text-center">
                    <p className="text-2xl font-extrabold text-ink font-display">
                      {baseline.screeningCount}
                    </p>
                    <p className="text-[10px] text-muted mt-1">ครั้ง</p>
                  </div>
                </div>
              </div>
            </SurfacePanel>
          ) : (
            <SurfacePanel className="text-center py-12">
              <p className="text-sub text-sm">ยังไม่มี Baseline — คัดกรองอย่างน้อย 1 ครั้ง</p>
            </SurfacePanel>
          )}
        </div>
      </div>
    </div>
  )
}
