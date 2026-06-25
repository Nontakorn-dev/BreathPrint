import { Loader2, Upload, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { formatExposureDose } from '@/lib/exposure'
import { useT } from '@/i18n'
import type { SymptomScores } from '@/types'

interface SubmitStepProps {
  pm25: number
  exposureDose: number
  symptoms: SymptomScores
  hasBreath: boolean
  hasCough: boolean
  pefValue?: number
  isSubmitting: boolean
  progress: number
  isOffline: boolean
  onSubmit: () => void
}

export function SubmitStep({
  pm25,
  exposureDose,
  symptoms,
  hasBreath,
  hasCough,
  pefValue,
  isSubmitting,
  progress,
  isOffline,
  onSubmit,
}: SubmitStepProps) {
  const { t } = useT()
  const symptomTotal = Object.values(symptoms).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink font-display">{t('screening.submit.title')}</h2>
        <p className="text-sub text-sm mt-1">{t('screening.submit.subtitle')}</p>
      </div>

      {isOffline && (
        <Card className="border-warn/30 bg-[#fff7e8]">
          <div className="flex items-center gap-2 text-warn">
            <WifiOff className="h-5 w-5" />
            <p className="text-sm font-medium">{t('screening.submit.offlineNote')}</p>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('screening.submit.dataToSend')}</CardTitle>
        </CardHeader>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-sub">PM2.5</dt>
            <dd className="font-medium text-ink">{pm25.toFixed(1)} µg/m³</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sub">Exposure Dose</dt>
            <dd className="font-medium text-ink">{formatExposureDose(exposureDose)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sub">{t('screening.submit.symptomTotal')}</dt>
            <dd className="font-medium text-ink">{t('screening.submit.symptomTotalValue', { total: symptomTotal })}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sub">{t('screening.submit.breath')}</dt>
            <dd className={hasBreath ? 'text-good font-medium' : 'text-bad'}>
              {hasBreath ? t('screening.submit.ready') : t('screening.submit.notRecorded')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sub">{t('screening.submit.cough')}</dt>
            <dd className={hasCough ? 'text-good font-medium' : 'text-bad'}>
              {hasCough ? t('screening.submit.ready') : t('screening.submit.notRecorded')}
            </dd>
          </div>
          {pefValue && (
            <div className="flex justify-between">
              <dt className="text-sub">PEF</dt>
              <dd className="font-medium text-ink">{pefValue} L/min</dd>
            </div>
          )}
        </dl>
      </Card>

      {isSubmitting && (
        <Card>
          <CardDescription className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            {t('screening.submit.analyzing')}
          </CardDescription>
          <ProgressBar value={progress} />
          <p className="text-xs text-muted mt-2">
            {t('screening.submit.analyzingDetail')}
          </p>
        </Card>
      )}

      <Button
        fullWidth
        size="lg"
        onClick={onSubmit}
        disabled={!hasBreath || !hasCough || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('screening.submit.buttonAnalyzing')}
          </>
        ) : isOffline ? (
          <>
            <WifiOff className="h-5 w-5" />
            {t('screening.submit.buttonOffline')}
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            {t('screening.submit.buttonSubmit')}
          </>
        )}
      </Button>

      {!isOffline && (
        <p className="text-xs text-center text-muted flex items-center justify-center gap-1">
          <Wifi className="h-3 w-3" /> {t('screening.submit.onlineStatus')}
        </p>
      )}
    </div>
  )
}
