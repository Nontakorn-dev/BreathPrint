import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-2 w-full rounded-full bg-panel2 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-brand transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

interface StepProgressProps {
  currentStep: number
  totalSteps: number
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i <= currentStep ? 'bg-brand' : 'bg-line',
          )}
        />
      ))}
    </div>
  )
}
