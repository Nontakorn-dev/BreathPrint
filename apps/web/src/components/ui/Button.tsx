import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand2 shadow-md shadow-brand/20',
        secondary: 'bg-panel text-ink border border-line hover:bg-panel2',
        outline: 'border-2 border-brand text-brand bg-transparent hover:bg-brand-light/50',
        ghost: 'text-sub hover:bg-panel hover:text-ink',
        danger: 'bg-bad text-white hover:bg-bad/90',
        accent: 'bg-accent text-white hover:bg-accent/90',
      },
      size: {
        default: 'h-11 px-6 text-sm rounded-full',
        sm: 'h-9 px-4 text-sm rounded-full',
        lg: 'h-14 px-8 text-base rounded-full',
        icon: 'h-11 w-11 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
