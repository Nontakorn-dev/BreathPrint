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
    <div className={cn('surface-card px-5 py-6 sm:px-8 sm:py-7', className)}>
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex flex-1 items-start min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={cn(
                    'flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full text-sm font-bold transition-all shrink-0',
                    isActive &&
                      'bg-brand text-white shadow-lg shadow-brand/30 ring-4 ring-brand/15 scale-105',
                    isComplete && !isActive && 'bg-brand text-white',
                    !isActive && !isComplete && 'bg-panel border-2 border-line text-muted',
                  )}
                >
                  {index + 1}
                </div>
                <p
                  className={cn(
                    'mt-2.5 text-[11px] sm:text-xs font-semibold text-center leading-snug px-1',
                    isActive ? 'text-brand' : isComplete ? 'text-ink' : 'text-muted',
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div className="flex items-center flex-1 min-w-[12px] max-w-[80px] pt-[18px] lg:pt-5 px-1">
                  <div
                    className={cn(
                      'h-[3px] w-full rounded-full transition-colors',
                      isComplete ? 'bg-brand' : 'bg-line',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
