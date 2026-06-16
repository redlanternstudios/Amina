'use client'

import { useRef, useEffect, useState } from 'react'
import { X, ArrowUp, Sparkles } from 'lucide-react'
import { useChrome, type ChatMessage } from './ChromeContext'
import AminaIcon from '@/components/brand/AminaIcon'

export default function AminaBubble() {
  const { bubbleOpen, openBubble, closeBubble, messages, setMessages } = useChrome()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bubbleOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, bubbleOpen, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send full conversation for context (strip the welcome system greeting id)
        body: JSON.stringify({
          messages: next
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const content =
        data?.content ||
        "I'm having a little trouble responding right now, sister. Please try again in a moment."
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            "I'm having a little trouble connecting right now, sister. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating launcher — hidden while panel is open */}
      {!bubbleOpen && (
        <button
          onClick={openBubble}
          aria-label="Chat with Amina"
          className="fixed right-4 bottom-28 z-[55] w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            background: 'var(--amina-primary-action)',
            boxShadow: '0 8px 24px rgba(180,90,90,0.35)',
          }}
        >
          <AminaIcon size={26} crescentColor="#ffffff" starColor="var(--amina-warm-highlight)" />
        </button>
      )}

      {/* Scrim */}
      <div
        onClick={closeBubble}
        aria-hidden={!bubbleOpen}
        className={`fixed inset-0 z-[80] bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          bubbleOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-up panel */}
      <div
        role="dialog"
        aria-label="Amina chat"
        aria-hidden={!bubbleOpen}
        className={`fixed left-0 right-0 bottom-0 z-[90] mx-auto w-full max-w-md flex flex-col bg-cream rounded-t-3xl transition-transform duration-300 ease-out ${
          bubbleOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '80dvh', boxShadow: 'var(--amina-shadow-nav)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--amina-hairline)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--amina-ivory)', border: '1px solid var(--amina-hairline)' }}
            >
              <AminaIcon size={20} />
            </span>
            <div>
              <p className="font-amina-voice italic text-xl leading-none text-charcoal">Amina</p>
              <p className="font-amina-voice text-[11px] text-charcoal/50">Here to walk with you</p>
            </div>
          </div>
          <button
            onClick={closeBubble}
            aria-label="Close chat"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/60"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] px-4 py-2.5 leading-relaxed ${
                m.role === 'user'
                  ? 'self-end rounded-2xl rounded-br-md text-ivory text-[15px]'
                  : 'self-start rounded-2xl rounded-bl-md text-charcoal text-[16px] font-amina-voice'
              }`}
              style={
                m.role === 'user'
                  ? { background: 'var(--amina-primary-action)' }
                  : { background: 'var(--amina-ivory)', border: '1px solid var(--amina-hairline)' }
              }
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div
              className="self-start rounded-2xl rounded-bl-md px-4 py-3 text-charcoal/50 text-sm flex items-center gap-1"
              style={{ background: 'var(--amina-ivory)', border: '1px solid var(--amina-hairline)' }}
            >
              <Sparkles size={14} className="animate-pulse" /> Amina is reflecting…
            </div>
          )}
        </div>

        {/* Composer */}
        <div
          className="flex-shrink-0 px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
          style={{ borderTop: '1px solid var(--amina-hairline)' }}
        >
          <div
            className="flex items-end gap-2 rounded-3xl bg-ivory px-3 py-2"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={1}
              placeholder="Share what's on your heart…"
              className="flex-1 resize-none bg-transparent outline-none text-[15px] text-charcoal placeholder:text-charcoal/40 max-h-28 py-1.5"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ background: 'var(--amina-primary-action)' }}
            >
              <ArrowUp size={18} strokeWidth={2} className="text-ivory" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
