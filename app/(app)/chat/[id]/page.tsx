'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname, useParams } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, ArrowUp, Heart, Bell, HandHeart, BookOpen } from 'lucide-react'
import AminaIcon from '@/components/brand/AminaIcon'
import {
  loadMessages,
  saveMessage,
  createConversation,
} from '@/lib/supabase/chat'
import { stripPhaseLabels, renderMarkdown } from '@/lib/amina-response-utils'

interface UIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  persisted?: boolean
}

const QUICK_CHIPS = [
  { id: 'reflect', label: 'Help me reflect', icon: Heart, prompt: 'I need help reflecting on something.' },
  { id: 'reminder', label: 'Give me a reminder', icon: Bell, prompt: 'Give me an Islamic reminder for today.' },
  { id: 'dua', label: "Make du'a for me", icon: HandHeart, prompt: "Please make du'a for me." },
  { id: 'quran', label: 'Quranic guidance', icon: BookOpen, prompt: 'I need Quranic guidance on something.' },
]

const GREETING: UIMessage = {
  id: '__greeting__',
  role: 'assistant',
  content: "Salam, sister.\nI'm so glad you're here.\nWhat's on your heart today?",
  timestamp: new Date(),
  persisted: true,
}

function AminaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-cream flex-shrink-0"
      style={{ width: size, height: size, border: '1px solid var(--amina-hairline)' }}
    >
      <AminaIcon size={Math.round(size * 0.62)} />
    </div>
  )
}

function dbToUI(m: DBMessage): UIMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.created_at),
    persisted: true,
  }
}

function ChatInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ id: string }>()
  const conversationId = params?.id

  const [messages, setMessages] = useState<UIMessage[]>([GREETING])
  const messagesRef = useRef<UIMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)
  const textareaRef = useRef<HTMLInputElement>(null)

  // Keep ref in sync so async callbacks always see the latest messages
  const setMessagesAndRef = useCallback((updater: (prev: UIMessage[]) => UIMessage[]) => {
    setMessages(prev => {
      const next = updater(prev)
      messagesRef.current = next
      return next
    })
  }, [])

  // Load conversation history from DB on mount
  useEffect(() => {
    if (!conversationId) { setIsLoadingHistory(false); return }

    loadMessages(conversationId)
      .then(dbMessages => {
        if (dbMessages.length > 0) {
          setMessagesAndRef(() => [GREETING, ...dbMessages.map(dbToUI)])
        }
      })
      .catch(() => {
        // Conversation may be brand new — that's fine, show greeting only
      })
      .finally(() => setIsLoadingHistory(false))
  }, [conversationId])

  // Auto-send ?q= param from home page (only after history loads)
  useEffect(() => {
    if (isLoadingHistory) return
    const q = searchParams.get('q')
    if (!q || autoSentRef.current) return
    autoSentRef.current = true
    router.replace(pathname, { scroll: false })
    sendMessage(q)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingHistory])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isLoadingHistory) return
    setError(null)

    const userMsg: UIMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    // Optimistically add to UI immediately
    setMessagesAndRef(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Snapshot full history right now (including the new user message) for AI context
    const contextMessages = [...messagesRef.current, userMsg]
      .filter(m => m.id !== '__greeting__')
      .map(m => ({ role: m.role, content: m.content }))

    // Fire-and-forget: save user message — never blocks the AI call
    if (conversationId) {
      saveMessage(conversationId, 'user', text.trim())
        .then(saved => setMessagesAndRef(prev =>
          prev.map(m => m.id === userMsg.id ? { ...m, id: saved.id, persisted: true } : m)
        ))
        .catch(() => {})
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages }),
      })

      if (res.status === 429) {
        setError('Taking a breath... please try again in a moment.')
        setIsLoading(false)
        return
      }
      if (!res.ok) throw new Error('api_error')

      const data = await res.json()
      const assistantContent: string = data.content

      const assistantMsg: UIMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }
      setMessagesAndRef(prev => [...prev, assistantMsg])

      // Fire-and-forget: save assistant response
      if (conversationId) {
        saveMessage(conversationId, 'assistant', assistantContent)
          .then(saved => setMessagesAndRef(prev =>
            prev.map(m => m.id === assistantMsg.id ? { ...m, id: saved.id, persisted: true } : m)
          ))
          .catch(() => {})
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setMessagesAndRef(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isLoading, isLoadingHistory, setMessagesAndRef])

  const userMessageCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="flex flex-col h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--amina-hairline)', background: 'var(--amina-soft-cream)' }}
      >
        <button onClick={() => router.push('/home')} aria-label="Back" style={{ color: 'var(--amina-soft-charcoal)' }}>
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <AminaAvatar size={36} />
          <div>
            <p className="font-semibold text-charcoal text-[14px]">Amina</p>
            <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.45)' }}>Faith companion</p>
          </div>
        </div>
        <button aria-label="More options" style={{ color: 'rgba(44,41,38,0.4)' }}>
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {isLoadingHistory ? (
          <div className="flex justify-center pt-8">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--amina-muted-gold)', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
              {msg.role === 'assistant' && <AminaAvatar size={28} />}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'text-white rounded-tr-sm max-w-[78%]'
                    : 'text-charcoal rounded-tl-sm max-w-[82%]'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'var(--amina-primary-action)' }
                    : { background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }
                }
              >
                {msg.role === 'assistant' ? (
                  <div className="font-amina-voice text-[15px] leading-relaxed space-y-2">
                    {stripPhaseLabels(msg.content).split(/\n\n+/).map((para, i) => (
                      <p
                        key={i}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(para.trim()) }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
                <p className={`text-[11px] mt-1 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-muted'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start items-end gap-2">
            <AminaAvatar size={28} />
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(44,41,38,0.25)', animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'var(--amina-rose-selected)' }}
          >
            <p className="text-[13px]" style={{ color: 'var(--amina-primary-action)' }}>{error}</p>
            <button onClick={() => setError(null)} className="text-[11px] mt-1" style={{ color: 'rgba(44,41,38,0.45)' }}>Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips — only before any user messages */}
      {!isLoadingHistory && userMessageCount === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_CHIPS.map(chip => {
            const Icon = chip.icon
            return (
              <button
                key={chip.id}
                onClick={() => sendMessage(chip.prompt)}
                className="chip flex-shrink-0 text-xs"
              >
                <Icon size={14} strokeWidth={1.5} className="text-olive" /> {chip.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-2 flex-shrink-0"
        style={{ borderTop: '1px solid var(--amina-hairline)', background: 'var(--amina-soft-cream)' }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <input
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Share what's on your heart..."
            className="flex-1 bg-transparent text-[14px] text-charcoal placeholder:text-muted outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || isLoadingHistory}
            aria-label="Send message"
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
            style={{ background: 'var(--amina-primary-action)' }}
          >
            <ArrowUp size={16} strokeWidth={2} className="text-white" />
          </button>
        </div>
        <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(44,41,38,0.35)' }}>
          Amina is an AI companion, not a scholar or therapist.
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
          <div className="flex flex-col items-center gap-3">
            <AminaIcon size={40} className="animate-pulse" />
          </div>
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  )
}
