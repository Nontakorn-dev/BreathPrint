import { Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  const { t } = useT()
  return (
    <Link to="/" className={cn('flex items-center gap-3 group', className)}>
      <div className="relative flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand2 text-white shadow-lg shadow-brand/30 group-hover:shadow-brand/40 group-hover:scale-[1.03] transition-all">
        <Wind className="h-5 w-5 lg:h-[1.35rem] lg:w-[1.35rem]" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="leading-tight">
          <span className="block text-lg lg:text-xl font-extrabold text-brand font-display tracking-tight">
            BreathPrint
          </span>
          <span className="hidden sm:block text-[10px] font-semibold text-muted uppercase tracking-widest">
            {t('nav.brandTagline')}
          </span>
        </div>
      )}
    </Link>
  )
}
