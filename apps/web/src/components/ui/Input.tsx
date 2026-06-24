import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'flex h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink',
          'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-bad focus:ring-bad/30',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
