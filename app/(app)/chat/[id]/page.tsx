'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_CHIPS = [
  { id: 'reflect', label: '🧘 Help me reflect' },
  { id: 'reminder', label: '🔔 Give me a reminder' },
  { id: 'dua', label: '🤲 Make du‘a for me' },
  { id: 'quran', label: '📖 Quranic guidance' },
]

function ChatInner() {
  const router = useRouter()
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'As-salamu alaykum, sister \u2665\ufe0f\nHow can I support you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-cream border-b border-charcoal/5">
        <button onClick={() => router.back()} className="text-charcoal/60 text-2xl">‹</button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-full bg-rose-amina flex items-center justify-center">
            <span className="text-white">🌙</span>
          </div>
          <div>
            <p className="font-semibold text-charcoal text-sm">Amina</p>
            <p className="text-charcoal/40 text-xs">Faith companion</p>
          </div>
        </div>
        <button className="text-charcoal/40">…</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${ msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-rose-amina flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-white text-xs">🌙</span>
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-rose-amina text-white rounded-tr-sm'
                : 'bg-ivory text-charcoal rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-white/60' : 'text-charcoal/30'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-rose-amina flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-xs">🌙</span>
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
          <div className="bg-rose-amina/10 border border-rose-amina/20 rounded-xl px-4 py-3 text-center">
            <p className="text-rose-amina text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-charcoal/40 text-xs mt-1">Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => sendMessage(chip.label.replace(/^[\S]+ /, ''))}
              className="chip flex-shrink-0 text-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 border-t border-charcoal/5">
        <div className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2.5 border border-charcoal/10">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Message Amina..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center disabled:opacity-40"
          >
            <span className="text-white text-sm">↑</span>
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-dvh bg-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">🌙</span>
          <p className="text-charcoal/40 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <ChatInner />
    </Suspense>
  )
}
