import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

const widths = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('min-h-dvh page-gradient flex flex-col', className)}>
      {children}
    </div>
  )
}

export function PageMain({
  children,
  className,
  maxWidth = 'lg',
}: {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}) {
  return (
    <main className={cn('flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8', widths[maxWidth], className)}>
      {children}
    </main>
  )
}

export function SurfacePanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('surface-card p-5 sm:p-7 animate-fade-up', className)}>{children}</div>
  )
}

export function PageHero({
  title,
  subtitle,
  className,
}: {
  title: ReactNode
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn('mb-6 sm:mb-8 animate-fade-up', className)}>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-display leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-sub mt-2 text-sm sm:text-base max-w-xl">{subtitle}</p>}
    </div>
  )
}
