import { Mic, Square, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Waveform } from '@/components/audio/Waveform'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  title: string
  description: string
  minDuration?: number
  maxDuration?: number
  onComplete: (blob: Blob, duration: number, qualityOk: boolean) => void
}

export function AudioRecorder({
  title,
  description,
  minDuration = 5,
  maxDuration = 15,
  onComplete,
}: AudioRecorderProps) {
  const { t } = useT()
  const recorder = useAudioRecorder({ minDuration, maxDuration })

  const handleConfirm = () => {
    if (recorder.audioBlob) {
      onComplete(recorder.audioBlob, recorder.duration, recorder.qualityOk)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink font-display">{title}</h2>
        <p className="text-muted text-sm mt-1">{description}</p>
      </div>

      <div className="rounded-2xl border border-line bg-panel/50 p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{t('screening.audio.waveform')}</p>
        <Waveform bars={recorder.waveform} isActive={recorder.isRecording} />

        <p className="text-sm text-sub mt-3 text-center">
          {recorder.isRecording
            ? t('screening.audio.recording', { cur: recorder.duration.toFixed(1), max: maxDuration })
            : recorder.audioBlob
              ? t('screening.audio.recorded', { duration: recorder.duration.toFixed(1) })
              : t('screening.audio.recordDuration', { min: minDuration, max: maxDuration })}
        </p>

        {recorder.error && (
          <p className="text-sm text-bad mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {recorder.error}
          </p>
        )}

        {recorder.qualityMessage && (
          <p
            className={cn(
              'text-sm mt-3 flex items-center justify-center gap-1',
              recorder.qualityOk ? 'text-good' : 'text-warn',
            )}
          >
            {recorder.qualityOk ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {recorder.qualityMessage}
          </p>
        )}

        {recorder.audioUrl && (
          <audio controls src={recorder.audioUrl} className="w-full mt-3 rounded-xl" />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!recorder.isRecording && !recorder.audioBlob && (
          <Button fullWidth size="lg" onClick={recorder.startRecording}>
            <Mic className="h-5 w-5" />
            {t('screening.audio.start')}
          </Button>
        )}

        {recorder.isRecording && (
          <Button fullWidth size="lg" variant="danger" onClick={recorder.stopRecording}>
            <Square className="h-5 w-5" />
            {t('screening.audio.stop')}
          </Button>
        )}

        {recorder.audioBlob && (
          <>
            <Button fullWidth size="lg" onClick={handleConfirm} disabled={!recorder.qualityOk}>
              <CheckCircle className="h-5 w-5" />
              {t('screening.audio.use')}
            </Button>
            <Button fullWidth variant="ghost" onClick={recorder.reset}>
              <RotateCcw className="h-4 w-4" />
              {t('screening.audio.retake')}
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted text-center bg-brand-light/40 dark:bg-brand/10 rounded-xl px-4 py-3">
        <strong className="text-brand">{t('screening.audio.tip')}</strong> {t('screening.audio.tipBody')}
      </p>
    </div>
  )
}
