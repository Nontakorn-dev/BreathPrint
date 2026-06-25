import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

export function DisclaimerBanner({ className, compact }: { className?: string; compact?: boolean }) {
  const { t } = useT()
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-warn/25 bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
      <div>
        <p className={cn('font-bold text-ink', compact ? 'text-sm' : 'text-base')}>
          {t('result.disclaimerTitle')}
        </p>
        {!compact && (
          <p className="text-sm text-sub mt-1">
            {t('result.disclaimerBody')}
          </p>
        )}
      </div>
    </div>
  )
}
