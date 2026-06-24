import { Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/25 group-hover:scale-105 transition-transform">
        <Wind className="h-5 w-5" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="text-lg font-extrabold text-brand font-display tracking-tight">
          BreathPrint
        </span>
      )}
    </Link>
  )
}
