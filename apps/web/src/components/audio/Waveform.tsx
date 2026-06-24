import { cn } from '@/lib/utils'

interface WaveformProps {
  bars: number[]
  isActive?: boolean
  className?: string
}

export function Waveform({ bars, isActive, className }: WaveformProps) {
  const displayBars = bars.length > 0 ? bars : Array(32).fill(0.05)

  return (
    <div
      className={cn(
        'flex items-end justify-center gap-[3px] h-24 px-4 rounded-xl bg-panel',
        className,
      )}
      aria-hidden
    >
      {displayBars.map((level, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 rounded-full transition-all duration-75',
            isActive ? 'bg-brand' : 'bg-brand/40',
          )}
          style={{ height: `${Math.max(8, level * 100)}%` }}
        />
      ))}
    </div>
  )
}
