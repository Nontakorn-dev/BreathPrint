import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Home, RotateCcw } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'
import { PageContainer, PageMain, PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { RiskScoreGauge } from '@/components/results/RiskScoreGauge'
import { ExplanationPanel } from '@/components/results/ExplanationPanel'
import { ReferralCard } from '@/components/results/ReferralCard'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import { ChangeAlert } from '@/components/baseline/ChangeAlert'
import { getScreening, getBaseline } from '@/lib/storage'
import type { ScreeningSession, UserBaseline } from '@/types'

const RESULT_STEPS = [
  { id: 'capture', label: 'รับสัญญาณ' },
  { id: 'audio', label: 'บันทึกเสียง' },
  { id: 'analyze', label: 'วิเคราะห์ AI' },
  { id: 'report', label: 'รายงานผล' },
]

export function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<ScreeningSession | null>(null)
  const [baseline, setBaseline] = useState<UserBaseline | null>(null)

  useEffect(() => {
    if (!id) return
    getScreening(id).then((s) => {
      setSession(s ?? null)
      if (s) getBaseline(s.userId).then((b) => setBaseline(b ?? null))
    })
  }, [id])

  if (!session?.result) {
    return (
      <PageContainer>
        <AppHeader />
        <PageMain>
          <div className="text-center py-16">
            <p className="text-sub">ไม่พบผลการคัดกรอง</p>
            <Link to="/">
              <Button className="mt-4">กลับหน้าหลัก</Button>
            </Link>
          </div>
        </PageMain>
        <AppFooter />
      </PageContainer>
    )
  }

  const { result } = session

  return (
    <PageContainer>
      <AppHeader />
      <PageMain>
        <PageHero
          title="รายงานผลการคัดกรอง 📋"
          subtitle="BreathPrint Risk Score และคำอธิบายจาก audio-LLM"
        />

        <Stepper steps={RESULT_STEPS} currentStep={3} className="mb-6 lg:mb-8" />

        <DisclaimerBanner />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mt-6">
          <div className="space-y-6">
            <SurfacePanel>
              <RiskScoreGauge score={result.riskScore} band={result.riskBand} />
            </SurfacePanel>
            <ChangeAlert
              currentScore={result.riskScore}
              baselineScore={baseline?.avgRiskScore ?? null}
              exposureDelta={result.exposureDeltaPct}
            />
            <ReferralCard level={result.referralLevel} score={result.riskScore} />
          </div>

          <div className="space-y-6">
            <ExplanationPanel bullets={result.explanationBullets} timeEvents={result.timeEvents} />
            <p className="text-xs text-muted text-center lg:text-left px-2">
              Model: {result.modelVersion} · คัดกรอง ไม่ใช่วินิจฉัย
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to="/screening" className="flex-1">
            <Button fullWidth size="lg">
              <RotateCcw className="h-4 w-4" />
              คัดกรองใหม่
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button fullWidth variant="outline" size="lg">
              <Home className="h-4 w-4" />
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </PageMain>
      <AppFooter />
    </PageContainer>
  )
}
