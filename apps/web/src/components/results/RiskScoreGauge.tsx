import { getRiskBandColor, getRiskBandLabel } from '@/lib/utils'
import { useT } from '@/i18n'
import type { RiskBand } from '@/types'

interface RiskScoreGaugeProps {
  score: number
  band: RiskBand
}

export function RiskScoreGauge({ score, band }: RiskScoreGaugeProps) {
  const { t } = useT()
  const pointerPct = Math.min(100, Math.max(0, score))

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-sub">{t('result.riskScoreLabel')}</p>
        <p className="text-5xl lg:text-6xl font-extrabold text-ink font-display mt-1">{score}</p>
        <p
          className="text-sm font-bold mt-1"
          style={{ color: getRiskBandColor(band) }}
        >
          {getRiskBandLabel(band)}
        </p>
      </div>

      <div className="relative px-2">
        <div className="risk-gradient h-8 lg:h-9 rounded-full shadow-inner" />
        <div
          className="absolute top-0 -translate-x-1/2 transition-all"
          style={{ left: `${pointerPct}%` }}
        >
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-ink mx-auto" />
        </div>
        <div className="flex justify-between text-xs text-muted mt-2 px-1">
          <span>0</span>
          <span>30</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
        <div className="flex justify-between text-[11px] font-medium mt-1">
          <span className="text-good">{t('result.bandLow')}</span>
          <span className="text-warn">{t('result.bandModerate')}</span>
          <span className="text-accent">{t('result.bandHigh')}</span>
          <span className="text-bad">{t('result.bandVeryHigh')}</span>
        </div>
      </div>
    </div>
  )
}
