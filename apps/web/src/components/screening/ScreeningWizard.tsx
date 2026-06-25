import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/ui/Stepper'
import { PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { LocationStep } from '@/components/screening/LocationStep'
import { SymptomForm } from '@/components/screening/SymptomForm'
import { AudioRecorder } from '@/components/audio/AudioRecorder'
import { PEFInput } from '@/components/screening/PEFInput'
import { SubmitStep } from '@/components/screening/SubmitStep'
import {
  useScreeningStore,
  WIZARD_STEPS,
  getStepIndex,
  type WizardStep,
} from '@/store/screening-store'
import { useAuthStore } from '@/store/auth-store'
import { generateId, getDeviceModel } from '@/lib/utils'
import { processAndSaveScreening, queueScreeningForSync, isOnline } from '@/lib/offline-queue'
import { saveScreening } from '@/lib/storage'
import type { ScreeningSession } from '@/types'
import { useT } from '@/i18n'

function getStepperIndex(step: WizardStep): number {
  if (step === 'location' || step === 'symptoms') return 0
  if (step === 'breath' || step === 'cough') return 1
  if (step === 'pef' || step === 'submit') return 2
  return 3
}

export function ScreeningWizard() {
  const { t } = useT()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)!
  const store = useScreeningStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  const SCREENING_STEPS = [
    { id: 'env', label: t('screening.stepEnv') },
    { id: 'audio', label: t('screening.stepAudio') },
    { id: 'analyze', label: t('screening.stepAnalyze') },
    { id: 'report', label: t('screening.stepReport') },
  ]

  const stepIndex = getStepIndex(store.step)
  const stepperIndex = getStepperIndex(store.step)

  const goNext = () => {
    const next = WIZARD_STEPS[stepIndex + 1]
    if (next) store.setStep(next)
  }

  const goBack = () => {
    if (stepIndex === 0) {
      navigate('/')
      return
    }
    const prev = WIZARD_STEPS[stepIndex - 1]
    if (prev) store.setStep(prev)
  }

  const handleSubmit = async () => {
    if (!store.location || !store.breathBlob || !store.coughBlob) return

    setIsSubmitting(true)
    setProgress(10)

    const session: ScreeningSession = {
      id: generateId(),
      userId,
      breathAudioBlob: store.breathBlob,
      coughAudioBlob: store.coughBlob,
      breathDuration: store.breathDuration,
      coughDuration: store.coughDuration,
      lat: store.location.lat,
      lng: store.location.lng,
      pm25UgM3: store.location.pm25UgM3,
      exposureDoseWeekly: store.exposureDoseWeekly ?? 0,
      symptoms: store.symptoms,
      pefValue: store.pefValue,
      deviceInfo: getDeviceModel(),
      status: 'analyzing',
      createdAt: new Date().toISOString(),
      synced: false,
    }

    try {
      if (!isOnline()) {
        await saveScreening({ ...session, status: 'uploading' })
        await queueScreeningForSync({ ...session, status: 'uploading' })
        store.reset()
        navigate('/history', { state: { offlineQueued: true } })
        return
      }

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 90))
      }, 300)

      const completed = await processAndSaveScreening(session, userId)
      clearInterval(progressInterval)
      setProgress(100)
      store.reset()
      navigate(`/results/${completed.id}`)
    } catch {
      await saveScreening({ ...session, status: 'failed' })
      await queueScreeningForSync({ ...session, status: 'failed' })
      store.reset()
      navigate('/history', { state: { error: true } })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label={t('screening.back')}
          className="shrink-0 mt-1 border border-line bg-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHero
          className="mb-0 flex-1"
          title={t('screening.title')}
          subtitle={t('screening.subtitle')}
        />
      </div>

      <Stepper steps={SCREENING_STEPS} currentStep={stepperIndex} />

      <SurfacePanel className="min-h-[420px] lg:min-h-[480px]">
        <p className="section-label mb-1">
          {t('screening.stepOf', { n: stepIndex + 1, total: WIZARD_STEPS.length })}
        </p>

        {store.step === 'location' && (
          <LocationStep
            onComplete={(loc, dose) => {
              store.setLocation(loc)
              store.setExposureDose(dose)
              goNext()
            }}
          />
        )}

        {store.step === 'symptoms' && (
          <SymptomForm
            values={store.symptoms}
            onChange={store.setSymptoms}
            onComplete={goNext}
          />
        )}

        {store.step === 'breath' && (
          <AudioRecorder
            title={t('screening.breathTitle')}
            description={t('screening.breathDescription')}
            minDuration={8}
            maxDuration={15}
            onComplete={(blob, duration, qualityOk) => {
              store.setBreathRecording(blob, duration, qualityOk)
              goNext()
            }}
          />
        )}

        {store.step === 'cough' && (
          <AudioRecorder
            title={t('screening.coughTitle')}
            description={t('screening.coughDescription')}
            minDuration={3}
            maxDuration={10}
            onComplete={(blob, duration, qualityOk) => {
              store.setCoughRecording(blob, duration, qualityOk)
              goNext()
            }}
          />
        )}

        {store.step === 'pef' && (
          <PEFInput
            value={store.pefValue}
            onChange={store.setPefValue}
            onComplete={goNext}
            onSkip={goNext}
          />
        )}

        {store.step === 'submit' && store.location && (
          <SubmitStep
            pm25={store.location.pm25UgM3}
            exposureDose={store.exposureDoseWeekly ?? 0}
            symptoms={store.symptoms}
            hasBreath={!!store.breathBlob}
            hasCough={!!store.coughBlob}
            pefValue={store.pefValue}
            isSubmitting={isSubmitting}
            progress={progress}
            isOffline={!isOnline()}
            onSubmit={handleSubmit}
          />
        )}
      </SurfacePanel>
    </div>
  )
}
