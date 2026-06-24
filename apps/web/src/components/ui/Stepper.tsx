import { cn } from '@/lib/utils'

export interface StepperStep {
  id: string
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('surface-card px-4 py-5 sm:px-6', className)}>
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-sm font-bold transition-all shrink-0',
                    isActive && 'bg-brand text-white shadow-md shadow-brand/30 ring-4 ring-brand/15',
                    isComplete && 'bg-brand text-white',
                    !isActive && !isComplete && 'bg-panel2 text-muted border border-line',
                  )}
                >
                  {index + 1}
                </div>
                <p
                  className={cn(
                    'mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight px-0.5',
                    isActive ? 'text-brand' : isComplete ? 'text-ink' : 'text-muted',
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mt-4 sm:mt-[18px] mx-1 rounded-full min-w-[12px]',
                    isComplete ? 'bg-brand' : 'bg-line',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
