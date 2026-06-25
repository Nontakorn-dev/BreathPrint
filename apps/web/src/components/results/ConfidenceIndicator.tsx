import { AlertTriangle } from 'lucide-react'
import { useT } from '@/i18n'

interface ConfidenceIndicatorProps {
  /** Model confidence 0..1 (falls back to a neutral value for legacy results). */
  confidence?: number
  /** Show the full "re-record / see clinician" callout when confidence is low. */
  showLowSignalCallout?: boolean
}

/** Threshold below which the result is treated as low-signal (GallopGuard principle). */
const LOW_CONFIDENCE_THRESHOLD = 0.55

function getConfidenceLevel(c: number): 'high' | 'moderate' | 'low' {
  if (c >= 0.75) return 'high'
  if (c >= LOW_CONFIDENCE_THRESHOLD) return 'moderate'
  return 'low'
}

export function ConfidenceIndicator({
  confidence,
  showLowSignalCallout = true,
}: ConfidenceIndicatorProps) {
  const { t } = useT()
  // Guard for legacy stored results created before confidence existed.
  const c = confidence ?? 0.7
  const pct = Math.round(c * 100)
  const level = getConfidenceLevel(c)
  const color =
    level === 'high' ? 'text-good' : level === 'moderate' ? 'text-warn' : 'text-bad'
  const barColor =
    level === 'high' ? 'bg-good' : level === 'moderate' ? 'bg-warn' : 'bg-bad'
  const levelLabel =
    level === 'high'
      ? t('result.confidenceHigh')
      : level === 'moderate'
        ? t('result.confidenceModerate')
        : t('result.confidenceLow')

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-sub">{t('result.modelConfidence')}</span>
        <span className={`text-xs font-bold ${color}`}>
          {levelLabel} · {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-panel2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {showLowSignalCallout && level === 'low' && (
        <div className="flex gap-2 items-start rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 mt-1">
          <AlertTriangle className="h-4 w-4 text-bad shrink-0 mt-0.5" />
          <p className="text-xs text-sub">
            {t('result.lowSignalCallout')}
            <strong className="text-ink">{t('result.lowSignalRerecord')}</strong>
            {t('result.lowSignalOr')}
            <strong className="text-ink">{t('result.lowSignalSeeClinician')}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
