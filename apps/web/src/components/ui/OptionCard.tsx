import { cn } from '@/lib/utils'

type StatusDot = 'good' | 'warn' | 'bad' | 'neutral'

interface OptionCardProps {
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  status?: StatusDot
  icon?: React.ReactNode
  className?: string
}

const dotColors: Record<StatusDot, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  neutral: 'bg-muted',
}

export function OptionCard({
  title,
  description,
  selected,
  onClick,
  status = 'neutral',
  icon,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
        'hover:border-brand/40 hover:shadow-sm',
        selected
          ? 'border-brand bg-brand-light/50 dark:bg-brand/10 ring-2 ring-brand/20'
          : 'border-line bg-surface',
        className,
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-panel text-brand">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm sm:text-base">{title}</p>
        {description && (
          <p className="text-xs sm:text-sm text-muted mt-0.5 truncate">{description}</p>
        )}
      </div>
      <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', dotColors[status])} />
    </button>
  )
}
