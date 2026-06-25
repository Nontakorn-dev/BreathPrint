import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'
import { AssistantPanel } from './AssistantPanel'

export function AiAssistantFab() {
  const { t } = useT()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-5 sm:right-8 lg:right-10 z-40 flex flex-col items-end gap-2 safe-area-pb">
      {expanded && (
        <div className="surface-card shadow-2xl animate-fade-up overflow-hidden">
          <AssistantPanel onClose={() => setExpanded(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-label={t('assistant.fabAsk')}
        className={cn(
          'flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-white font-semibold text-sm',
          'shadow-lg shadow-brand/30 hover:bg-brand2 transition-all hover:scale-[1.02]',
        )}
      >
        {expanded ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        {t('assistant.fabAsk')}
      </button>
    </div>
  )
}
