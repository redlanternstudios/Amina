'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_CHIPS = [
  { label: 'Help me reflect', prompt: 'I need help reflecting on something.' },
  { label: 'Give me a reminder', prompt: 'Give me an Islamic reminder for today.' },
  { label: "Make du'a for me", prompt: "Please make du'a for me." },
  { label: 'Quranic guidance', prompt: 'I need Quranic guidance on something.' },
]

function ChatInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const greeting = `Salam, sister 🌸\nI'm so happy you're here.\nWhat's on your heart today?`

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
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-cream border-b border-charcoal/10">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <span className="text-charcoal">←</span>
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-400 flex items-center justify-center">
            <span className="text-white text-sm">🌙</span>
          </div>
          <div>
            <p className="font-semibold text-charcoal text-sm">Amina</p>
            <p className="text-charcoal/50 text-xs">Your companion for faith, reflection, and growth.</p>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center">
          <span className="text-charcoal/50">•••</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Amina greeting */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">🌙</span>
          </div>
          <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
            <p className="text-charcoal text-sm leading-relaxed whitespace-pre-line">{greeting}</p>
          </div>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🌙</span>
              </div>
            )}
            <div className={`rounded-2xl px-4 py-3 max-w-xs ${
              msg.role === 'user'
                ? 'bg-rose-400 text-white rounded-tr-sm'
                : 'bg-ivory text-charcoal rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-charcoal/40'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">🌙</span>
            </div>
            <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-2 pt-2 bg-cream border-t border-charcoal/10">
        <div className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-charcoal/40"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center disabled:opacity-40"
          >
            <span className="text-white text-sm">↑</span>
          </button>
        </div>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 mt-2">
          <div className="flex gap-3">
            <button className="w-8 h-8 flex items-center justify-center text-charcoal/40">📎</button>
            <button className="w-8 h-8 flex items-center justify-center text-charcoal/40">🎤</button>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-charcoal/40">✨</button>
        </div>
        {/* Quick chips */}
        {messages.length === 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.prompt)}
                className="flex-shrink-0 bg-ivory border border-charcoal/15 rounded-full px-3 py-1.5 text-xs text-charcoal/70 font-medium"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-charcoal/30 mt-2">Amina can make mistakes. Please review important information.</p>
      </div>

      <BottomNav />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-cream">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatInner />
    </Suspense>
  )
}
