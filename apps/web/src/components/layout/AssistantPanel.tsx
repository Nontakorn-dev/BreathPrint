import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, X } from 'lucide-react'
import { useT } from '@/i18n'
import { useAuthStore } from '@/store/auth-store'
import { getUserScreenings, getBaseline } from '@/lib/storage'
import { askAssistant, quickReplies, type AssistantMessage, type AssistantContext } from '@/lib/assistant'
import { generateId } from '@/lib/utils'

interface AssistantPanelProps {
  onClose: () => void
}

export function AssistantPanel({ onClose }: AssistantPanelProps) {
  const { t } = useT()
  const profile = useAuthStore((s) => s.profile)
  const userId = useAuthStore((s) => s.userId)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 'greet', role: 'assistant', content: t('assistant.greeting'), createdAt: '' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ctx, setCtx] = useState<AssistantContext>({ profile })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load the user's latest result + baseline to give context-aware replies.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    Promise.all([getUserScreenings(userId), getBaseline(userId)]).then(([sessions, baseline]) => {
      if (cancelled) return
      const latest = sessions.find((s) => s.result)
      setCtx({
        profile,
        latestResult: latest?.result,
        latestSession: latest,
        baseline: baseline ?? null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [userId, profile])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: AssistantMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    const reply = await askAssistant(trimmed, ctx)
    setMessages((m) => [
      ...m,
      { id: generateId(), role: 'assistant', content: reply, createdAt: new Date().toISOString() },
    ])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[min(70vh,560px)] w-[min(92vw,380px)]">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink leading-tight">{t('assistant.title')}</p>
            <p className="text-[11px] text-muted leading-tight">{t('assistant.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-muted hover:bg-panel2 hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-panel/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-brand text-white rounded-br-sm'
                  : 'bg-white border border-line text-ink rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white border border-line px-4 py-3 text-sm text-muted">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* quick replies */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-2">
        {quickReplies().map((q) => (
          <button
            key={q.id}
            onClick={() => send(t(q.messageKey))}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-sub hover:border-brand/40 hover:text-brand transition-colors"
          >
            {t(q.messageKey)}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
          className="flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label={t('assistant.send')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40 hover:bg-brand2 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="px-4 pb-2.5 text-[10px] leading-snug text-muted">{t('assistant.disclaimer')}</p>
    </div>
  )
}
