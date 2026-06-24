import { Mic, Square, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Waveform } from '@/components/audio/Waveform'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
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
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">คลื่นเสียง</p>
        <Waveform bars={recorder.waveform} isActive={recorder.isRecording} />

        <p className="text-sm text-sub mt-3 text-center">
          {recorder.isRecording
            ? `กำลังบันทึก... ${recorder.duration.toFixed(1)}s / ${maxDuration}s`
            : recorder.audioBlob
              ? `บันทึกแล้ว ${recorder.duration.toFixed(1)} วินาที`
              : `บันทึก ${minDuration}–${maxDuration} วินาที`}
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
            เริ่มอัด
          </Button>
        )}

        {recorder.isRecording && (
          <Button fullWidth size="lg" variant="danger" onClick={recorder.stopRecording}>
            <Square className="h-5 w-5" />
            หยุดบันทึก
          </Button>
        )}

        {recorder.audioBlob && (
          <>
            <Button fullWidth size="lg" onClick={handleConfirm} disabled={!recorder.qualityOk}>
              <CheckCircle className="h-5 w-5" />
              ใช้การบันทึกนี้
            </Button>
            <Button fullWidth variant="ghost" onClick={recorder.reset}>
              <RotateCcw className="h-4 w-4" />
              บันทึกใหม่
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted text-center bg-brand-light/40 dark:bg-brand/10 rounded-xl px-4 py-3">
        <strong className="text-brand">เคล็ดลับ:</strong> ถือมือถือห่างจากปาก 15–20 ซม.
        นั่งตัวตรง หายใจตามปกติ ในที่เงียบ
      </p>
    </div>
  )
}
