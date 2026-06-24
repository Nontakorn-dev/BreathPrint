import { type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn('flex items-start gap-3 cursor-pointer group', className)}
    >
      <input
        type="checkbox"
        id={id}
        className="mt-1 h-5 w-5 rounded border-line text-brand focus:ring-brand/30 shrink-0"
        {...props}
      />
      <span className="text-sm text-sub group-hover:text-ink transition-colors">{label}</span>
    </label>
  )
}
