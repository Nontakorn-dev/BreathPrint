import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Home, RotateCcw } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'
import { PageContainer, PageMain, PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { RiskScoreGauge } from '@/components/results/RiskScoreGauge'
import { ConfidenceIndicator } from '@/components/results/ConfidenceIndicator'
import { ExplanationPanel } from '@/components/results/ExplanationPanel'
import { ReferralCard } from '@/components/results/ReferralCard'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import { ChangeAlert } from '@/components/baseline/ChangeAlert'
import { AiAssistantFab } from '@/components/layout/AiAssistantFab'
import { getScreening, getBaseline } from '@/lib/storage'
import { useT } from '@/i18n'
import type { ScreeningSession, UserBaseline } from '@/types'

export function ResultPage() {
  const { t } = useT()
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<ScreeningSession | null>(null)
  const [baseline, setBaseline] = useState<UserBaseline | null>(null)

  const RESULT_STEPS = [
    { id: 'capture', label: t('result.stepCapture') },
    { id: 'audio', label: t('result.stepAudio') },
    { id: 'analyze', label: t('result.stepAnalyze') },
    { id: 'report', label: t('result.stepReport') },
  ]

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
            <p className="text-sub">{t('result.notFound')}</p>
            <Link to="/">
              <Button className="mt-4">{t('result.backHome')}</Button>
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
          title={t('result.heroTitle')}
          subtitle={t('result.heroSubtitle')}
        />

        <Stepper steps={RESULT_STEPS} currentStep={3} className="mb-6 lg:mb-8" />

        <DisclaimerBanner />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mt-6">
          <div className="space-y-6">
            <SurfacePanel>
              <RiskScoreGauge score={result.riskScore} band={result.riskBand} />
              <div className="mt-4 pt-4 border-t border-line">
                <ConfidenceIndicator confidence={result.confidence} />
              </div>
            </SurfacePanel>
            <ChangeAlert
              currentScore={result.riskScore}
              baselineScore={baseline?.avgRiskScore ?? null}
              exposureDelta={result.exposureDeltaPct}
            />
            <ReferralCard level={result.referralLevel} score={result.riskScore} />
          </div>

          <div className="space-y-6">
            <ExplanationPanel
              bullets={result.explanationBullets}
              timeEvents={result.timeEvents}
              llmExplanation={result.explanationLlm}
            />
            <p className="text-xs text-muted text-center lg:text-left px-2">
              {t('result.modelNote', { model: result.modelVersion })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to="/screening" className="flex-1">
            <Button fullWidth size="lg">
              <RotateCcw className="h-4 w-4" />
              {t('result.rescreen')}
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button fullWidth variant="outline" size="lg">
              <Home className="h-4 w-4" />
              {t('result.backHome')}
            </Button>
          </Link>
        </div>
      </PageMain>
      <AppFooter />
      <AiAssistantFab />
    </PageContainer>
  )
}
