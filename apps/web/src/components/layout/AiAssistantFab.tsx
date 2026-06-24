import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AiAssistantFab() {
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 safe-area-pb">
      {open && !expanded && (
        <div className="surface-card px-4 py-3 max-w-[260px] text-sm text-sub shadow-lg animate-fade-up relative pr-8">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-muted hover:text-ink"
            aria-label="ปิด"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          👋 สวัสดี! สอบถาม BreathPrint Assistant เกี่ยวกับการคัดกรอง SAD ได้เลย
        </div>
      )}

      {expanded && (
        <div className="surface-card w-[min(320px,calc(100vw-2rem))] p-4 shadow-xl animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-ink text-sm">BreathPrint Assistant</p>
            <button type="button" onClick={() => setExpanded(false)} aria-label="ปิด">
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>
          <p className="text-sm text-sub">
            แอปนี้ใช้คัดกรองความเสี่ยง Small Airway Dysfunction จากเสียงหายใจและ PM2.5
            ไม่ใช่การวินิจฉัย — หากมีอาการรุนแรงควรพบแพทย์
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-white font-semibold text-sm',
          'shadow-lg shadow-brand/30 hover:bg-brand2 transition-all hover:scale-[1.02]',
        )}
      >
        <MessageCircle className="h-4 w-4" />
        ถามผู้ช่วย AI
      </button>
    </div>
  )
}
