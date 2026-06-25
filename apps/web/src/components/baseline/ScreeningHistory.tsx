import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getRiskBandColor, getRiskBandLabel, formatDate } from '@/lib/utils'
import { useT } from '@/i18n'
import type { ScreeningSession } from '@/types'

interface ScreeningHistoryProps {
  sessions: ScreeningSession[]
}

export function ScreeningHistory({ sessions }: ScreeningHistoryProps) {
  const { t } = useT()
  const completed = sessions.filter((s) => s.result)

  if (completed.length === 0) {
    return (
      <div className="surface-card text-center py-10">
        <p className="text-muted text-sm">{t('result.noHistory')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide px-1">{t('result.screeningList')}</p>
      {completed.map((session) => (
        <Link key={session.id} to={`/results/${session.id}`}>
          <div className="surface-card hover:border-brand/30 transition-all cursor-pointer group p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">{formatDate(session.createdAt)}</p>
                <p className="text-3xl font-extrabold text-ink font-display mt-0.5">
                  {session.result!.riskScore}
                  <span className="text-sm font-medium text-muted ml-1">/ 100</span>
                </p>
                <p
                  className="text-xs font-bold mt-1"
                  style={{ color: getRiskBandColor(session.result!.riskBand) }}
                >
                  {getRiskBandLabel(session.result!.riskBand)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted group-hover:text-brand transition-colors" />
            </div>
            {!session.synced && (
              <p className="text-xs text-warn mt-2 font-medium">{t('result.pendingSync')}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
