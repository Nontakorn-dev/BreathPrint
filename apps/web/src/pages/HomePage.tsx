import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wind, Mic, TrendingUp, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import { ChangeAlert } from '@/components/baseline/ChangeAlert'
import { useAuthStore } from '@/store/auth-store'
import { getUserScreenings, getBaseline } from '@/lib/storage'
import { getRiskBandColor, getRiskBandLabel } from '@/lib/utils'
import type { ScreeningSession, UserBaseline } from '@/types'

export function HomePage() {
  const profile = useAuthStore((s) => s.profile)
  const userId = useAuthStore((s) => s.userId)
  const [lastSession, setLastSession] = useState<ScreeningSession | null>(null)
  const [baseline, setBaseline] = useState<UserBaseline | null>(null)

  useEffect(() => {
    if (!userId) return
    getUserScreenings(userId).then((sessions) => {
      const completed = sessions.filter((s) => s.result)
      setLastSession(completed[0] ?? null)
    })
    getBaseline(userId).then((b) => setBaseline(b ?? null))
  }, [userId])

  const displayName = profile ? `ผู้ใช้อายุ ${profile.age} ปี` : 'ผู้ใช้'

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHero
        title={<>ยินดีต้อนรับ, {displayName} 👋</>}
        subtitle="เลือกเริ่มคัดกรอง บันทึกเสียงหายใจ/ไอ และดู Personal Exposure Dose จาก PM2.5 เพื่อค้นหาความเสี่ยง Early SAD"
      />

      <DisclaimerBanner compact />

      {lastSession?.result && (
        <ChangeAlert
          currentScore={lastSession.result.riskScore}
          baselineScore={baseline?.avgRiskScore ?? null}
          exposureDelta={lastSession.result.exposureDeltaPct}
        />
      )}

      <Link to="/screening">
        <Button fullWidth size="lg" className="text-base shadow-lg shadow-brand/20">
          <Mic className="h-5 w-5" />
          เริ่มคัดกรองใหม่
        </Button>
      </Link>

      <SurfacePanel>
        <h3 className="font-bold text-ink mb-4">ความสามารถหลัก</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Wind, title: 'PM2.5 + Exposure', desc: 'GPS snapshot + dose', color: 'text-brand' },
            { icon: Mic, title: 'เสียงหายใจ/ไอ', desc: 'Acoustic biomarker', color: 'text-brand2' },
            { icon: TrendingUp, title: 'Baseline ส่วนตัว', desc: 'ติดตามแนวโน้ม', color: 'text-good' },
            { icon: Shield, title: 'PDPA Ready', desc: 'ยินยอม + เข้ารหัส', color: 'text-warn' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-line bg-panel/50 p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light/60 ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SurfacePanel>

      {lastSession?.result ? (
        <Link to={`/results/${lastSession.id}`}>
          <SurfacePanel className="hover:border-brand/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">ผลล่าสุด</p>
                <p className="text-4xl font-extrabold text-ink font-display mt-1">
                  {lastSession.result.riskScore}
                  <span className="text-lg text-muted font-medium">/100</span>
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: getRiskBandColor(lastSession.result.riskBand) }}
                >
                  {getRiskBandLabel(lastSession.result.riskBand)}
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-muted group-hover:text-brand transition-colors" />
            </div>
          </SurfacePanel>
        </Link>
      ) : (
        <SurfacePanel className="text-center py-8">
          <p className="text-muted text-sm">ยังไม่มีผลคัดกรอง</p>
          <p className="text-xs text-muted mt-1">กดปุ่มด้านบนเพื่อเริ่มบันทึกเสียงและรับ Risk Score</p>
        </SurfacePanel>
      )}
    </div>
  )
}
