'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, ArrowUp, Paperclip, Mic, Sparkles, Heart, Bell, HandHeart, BookOpen } from 'lucide-react'
import AminaIcon from '@/components/brand/AminaIcon'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_CHIPS = [
  { label: 'Help me reflect', icon: Heart, prompt: 'I need help reflecting on something.' },
  { label: 'Give me a reminder', icon: Bell, prompt: 'Give me an Islamic reminder for today.' },
  { label: "Make du'a for me", icon: HandHeart, prompt: "Please make du'a for me." },
  { label: 'Quranic guidance', icon: BookOpen, prompt: 'I need Quranic guidance on something.' },
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const greeting = `Salam, sister.\nI'm so happy you're here.\nWhat's on your heart today?`

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    setError(null)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      })
      if (res.status === 429) throw new Error('rate_limit')
      if (!res.ok) throw new Error('api_error')
      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: any) {
      if (e.message === 'rate_limit') {
        setError('Amina is resting for a moment. Please try again shortly.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-cream" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
        <button onClick={() => router.back()} aria-label="Back" className="text-secondary">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <AminaAvatar size={36} />
          <div>
            <p className="font-semibold text-charcoal text-sm">Amina</p>
            <p className="text-muted text-xs">Your companion for faith, reflection, and growth.</p>
          </div>
        </div>
        <button aria-label="More options" className="text-muted">
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Amina greeting */}
        <div className="flex items-start gap-3">
          <AminaAvatar size={32} />
          <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
            <p className="text-charcoal text-sm leading-relaxed whitespace-pre-line">{greeting}</p>
          </div>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
            {msg.role === 'assistant' && <AminaAvatar size={32} />}
            <div
              className={`rounded-2xl px-4 py-3 max-w-xs ${
                msg.role === 'user' ? 'text-white rounded-tr-sm bg-rose-amina' : 'bg-ivory text-charcoal rounded-tl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-muted'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <AminaAvatar size={32} />
            <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--amina-rose-selected)' }}>
            <p className="text-rose-amina text-sm">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-6 pt-2 bg-cream" style={{ borderTop: '1px solid var(--amina-hairline)' }}>
        <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-ivory" style={{ border: '1px solid var(--amina-border)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-muted"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 bg-rose-amina"
          >
            <ArrowUp size={16} strokeWidth={2} className="text-white" />
          </button>
        </div>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 mt-2 text-muted">
          <div className="flex gap-3">
            <button aria-label="Attach file"><Paperclip size={18} strokeWidth={1.5} /></button>
            <button aria-label="Voice input"><Mic size={18} strokeWidth={1.5} /></button>
          </div>
          <button aria-label="Suggestions"><Sparkles size={18} strokeWidth={1.5} /></button>
        </div>
        {/* Quick chips */}
        {messages.length === 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {QUICK_CHIPS.map(chip => {
              const Icon = chip.icon
              return (
                <button key={chip.label} onClick={() => sendMessage(chip.prompt)} className="chip flex-shrink-0 text-xs">
                  <Icon size={14} strokeWidth={1.5} className="text-olive" /> {chip.label}
                </button>
              )
            })}
          </div>
        )}
        <p className="text-center text-xs text-muted mt-2">Amina can make mistakes. Please review important information.</p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh bg-cream">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--amina-primary-action)', borderTopColor: 'transparent' }} />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  )
}
