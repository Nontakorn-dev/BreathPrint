import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Shared max-width for header, main, footer — fills MacBook/laptop screens */
export const CONTENT_CLASS = 'max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-10'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('min-h-dvh page-gradient flex flex-col relative', className)}>
      <div className="page-blob page-blob-a" aria-hidden />
      <div className="page-blob page-blob-b" aria-hidden />
      <div className="relative z-10 flex flex-col flex-1 min-h-dvh">{children}</div>
    </div>
  )
}

export function PageMain({
  children,
  className,
  narrow,
}: {
  children: ReactNode
  className?: string
  narrow?: boolean
}) {
  return (
    <main
      className={cn(
        'flex-1 w-full py-6 sm:py-8 lg:py-10',
        narrow ? 'max-w-2xl mx-auto px-5 sm:px-8 lg:px-10' : CONTENT_CLASS,
        className,
      )}
    >
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
    <div className={cn('surface-card p-6 sm:p-8 lg:p-9 animate-fade-up', className)}>
      {children}
    </div>
  )
}

export function PageHero({
  title,
  subtitle,
  className,
  action,
}: {
  title: ReactNode
  subtitle?: string
  className?: string
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        'mb-6 lg:mb-8 animate-fade-up flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4',
        className,
      )}
    >
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink font-display leading-[1.12] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sub mt-2.5 text-sm sm:text-base lg:text-[1.05rem] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
