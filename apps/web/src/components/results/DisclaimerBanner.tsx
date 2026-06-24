import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DisclaimerBanner({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-warn/25 bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
      <div>
        <p className={cn('font-bold text-ink', compact ? 'text-sm' : 'text-base')}>
          เครื่องมือคัดกรอง — ไม่ใช่การวินิจฉัย
        </p>
        {!compact && (
          <p className="text-sm text-sub mt-1">
            BreathPrint AI ใช้สำหรับคัดกรองความเสี่ยงเท่านั้น ไม่สามารถแทนการตรวจทางคลินิก
            เช่น IOS หรือ spirometry หากมีอาการรุนแรง กรุณาพบแพทย์ทันที
          </p>
        )}
      </div>
    </div>
  )
}
