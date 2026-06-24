'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname, useParams } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, ArrowUp, Heart, Bell, HandHeart, BookOpen } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import AminaIcon from '@/components/brand/AminaIcon'
import { loadMessages, type DBMessage } from '@/lib/supabase/chat'
import { stripPhaseLabels, renderMarkdown } from '@/lib/amina-response-utils'

const QUICK_CHIPS = [
  { id: 'reflect', label: 'Help me reflect', icon: Heart, prompt: 'I need help reflecting on something.' },
  { id: 'reminder', label: 'Give me a reminder', icon: Bell, prompt: 'Give me an Islamic reminder for today.' },
  { id: 'dua', label: "Make du'a for me", icon: HandHeart, prompt: "Please make du'a for me." },
  { id: 'quran', label: 'Quranic guidance', icon: BookOpen, prompt: 'I need Quranic guidance on something.' },
]

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

const GREETING: UIMessage = {
  id: '__greeting__',
  role: 'assistant',
  parts: [{ type: 'text', text: "Salam, sister.\nI'm so glad you're here.\nWhat's on your heart today?" }],
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

function ChatInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ id: string }>()
  const conversationId = params?.id

  const bottomRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)
  const historyLoadedRef = useRef(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: [GREETING],
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: {
          messages: msgs,
          conversationId: conversationId ?? null,
        },
      }),
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Load conversation history from DB on mount
  useEffect(() => {
    if (!conversationId || historyLoadedRef.current) return
    historyLoadedRef.current = true

    loadMessages(conversationId)
      .then((dbMessages: DBMessage[]) => {
        if (dbMessages.length === 0) return
        setMessages([
          GREETING,
          ...dbMessages.map((m): UIMessage => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            parts: [{ type: 'text', text: m.content }],
          })),
        ])
      })
      .catch(() => {})
  }, [conversationId, setMessages])

  // Auto-send ?q= param from home page chips
  useEffect(() => {
    const q = searchParams.get('q')
    if (!q || autoSentRef.current) return
    autoSentRef.current = true
    router.replace(pathname, { scroll: false })
    sendMessage({ text: q }, { body: { conversationId: conversationId ?? null } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend(text: string) {
    if (!text.trim() || isLoading) return
    sendMessage({ text }, { body: { conversationId: conversationId ?? null } })
  }

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
        {messages.map(msg => {
          const text = getMessageText(msg)
          return (
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
                    {stripPhaseLabels(text).split(/\n\n+/).map((para, i) => (
                      <p
                        key={i}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(para.trim()) }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{text}</p>
                )}
              </div>
            </div>
          )
        })}

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

        <div ref={bottomRef} />
      </div>

      {/* Quick chips — only before any user messages */}
      {userMessageCount === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_CHIPS.map(chip => {
            const Icon = chip.icon
            return (
              <button
                key={chip.id}
                onClick={() => handleSend(chip.prompt)}
                className="chip flex-shrink-0 text-xs"
              >
                <Icon size={14} strokeWidth={1.5} className="text-olive" /> {chip.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}

function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const val = inputRef.current?.value.trim()
    if (!val || disabled) return
    onSend(val)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      className="px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-2 flex-shrink-0"
      style={{ borderTop: '1px solid var(--amina-hairline)', background: 'var(--amina-soft-cream)' }}
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5"
        style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
      >
        <input
          ref={inputRef}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Share what's on your heart..."
          className="flex-1 bg-transparent text-[14px] text-charcoal placeholder:text-muted outline-none"
        />
        <button
          onClick={submit}
          disabled={disabled}
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
