'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, ArrowUp, Heart, Bell, HandHeart, BookOpen } from 'lucide-react'
import AminaIcon from '@/components/brand/AminaIcon'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_CHIPS = [
  { id: 'reflect', label: 'Help me reflect', icon: Heart, prompt: 'I need help reflecting on something.' },
  { id: 'reminder', label: 'Give me a reminder', icon: Bell, prompt: 'Give me an Islamic reminder for today.' },
  { id: 'dua', label: "Make du'a for me", icon: HandHeart, prompt: "Please make du'a for me." },
  { id: 'quran', label: 'Quranic guidance', icon: BookOpen, prompt: 'I need Quranic guidance on something.' },
]

function AminaAvatar({ size = 36 }: { size?: number }) {
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'As-salamu alaykum, sister.\nHow can I support you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send the ?q= param from home page on first mount
  useEffect(() => {
    const q = searchParams.get('q')
    if (!q || autoSentRef.current) return
    autoSentRef.current = true
    // Clean the URL so a refresh doesn't re-send
    router.replace(pathname, { scroll: false })
    sendMessage(q)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return
    setError(null)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (res.status === 429) {
        setError('Taking a breath... please try again in a moment.')
        setIsLoading(false)
        return
      }
      if (!res.ok) throw new Error('Response error')
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString() + '_a', role: 'assistant', content: data.content, timestamp: new Date() },
      ])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-cream" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
        <button onClick={() => router.back()} aria-label="Back" className="text-charcoal/60">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <AminaAvatar size={36} />
          <div>
            <p className="font-semibold text-charcoal text-sm">Amina</p>
            <p className="text-charcoal/40 text-xs">Faith companion</p>
          </div>
        </div>
        <button aria-label="More options" className="text-charcoal/40">
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="mr-2 mt-1">
                <AminaAvatar size={28} />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' ? 'text-white rounded-tr-sm bg-rose-amina' : 'bg-ivory text-charcoal rounded-tl-sm'
              }`}
            >
              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'font-amina-voice text-[16px]' : 'text-sm'}`}>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-charcoal/30'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-2">
              <AminaAvatar size={28} />
            </div>
            <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
            <p className="text-rose-amina text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-charcoal/40 text-xs mt-1">Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
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
      <div className="px-4 pb-6 pt-2" style={{ borderTop: '1px solid var(--amina-hairline)' }}>
        <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-ivory" style={{ border: '1px solid var(--amina-border)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center disabled:opacity-40"
          >
            <ArrowUp size={16} strokeWidth={2} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-charcoal/30 mt-2">
          Amina can make mistakes. Please review important information.
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh bg-cream">
          <div className="flex flex-col items-center gap-3">
            <AminaIcon size={40} className="animate-pulse" />
            <p className="text-charcoal/40 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  )
}
