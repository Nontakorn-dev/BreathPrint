import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { useT } from '@/i18n'
import type { TimeEvent } from '@/types'

interface ExplanationPanelProps {
  bullets: string[]
  timeEvents: TimeEvent[]
}

export function ExplanationPanel({ bullets, timeEvents }: ExplanationPanelProps) {
  const { t } = useT()
  return (
    <Card className="bg-panel border-brand2/20">
      <CardHeader>
        <CardTitle className="text-brand2 text-base">
          {t('result.explanationTitle')}
        </CardTitle>
      </CardHeader>
      <ul className="space-y-2">
        {bullets.map((bullet, i) => (
          <li key={i} className="text-sm text-sub flex gap-2">
            <span className="text-brand font-bold shrink-0">•</span>
            {bullet}
          </li>
        ))}
      </ul>

      {timeEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-xs font-bold text-brand2 mb-2">{t('result.timeGrounding')}</p>
          <div className="space-y-1.5">
            {timeEvents.map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-line"
              >
                <span className="font-mono font-bold text-accent shrink-0">
                  {ev.start.toFixed(1)}–{ev.end.toFixed(1)}s
                </span>
                <span className="text-sub">{ev.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
