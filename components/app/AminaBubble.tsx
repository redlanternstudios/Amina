'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { X, ArrowUp, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Amina3DCharacter from '@/components/brand/Amina3DCharacter'
import { useChrome, type ChatMessage } from './ChromeContext'

const BUBBLE_HIDDEN_PATHS = ['/home']

export default function AminaBubble() {
  const { bubbleOpen, openBubble, closeBubble, messages, setMessages } = useChrome()
  const pathname = usePathname()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Draggable launcher state
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)
  const launcherRef = useRef<HTMLButtonElement>(null)

  const isHidden = BUBBLE_HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // Default position: bottom-right above bottom nav
  useEffect(() => {
    if (pos === null) {
      setPos({ x: window.innerWidth - 72, y: window.innerHeight - 130 })
    }
  }, [pos])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (bubbleOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, bubbleOpen, loading])

  // --- Drag handlers ---
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (bubbleOpen) return
    dragging.current = true
    hasDragged.current = false
    const rect = launcherRef.current!.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    launcherRef.current!.setPointerCapture(e.pointerId)
  }, [bubbleOpen])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) hasDragged.current = true
    const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 56)
    const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 56)
    setPos({ x: newX, y: newY })
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    if (!hasDragged.current) openBubble()
  }, [openBubble])

  // --- Send ---
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
        body: JSON.stringify({
          messages: next
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data?.content ?? "I'm having a little trouble responding right now, sister. Please try again.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: "I'm having a little trouble connecting, sister. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (isHidden || pos === null) return null

  return (
    <>
      {/* Floating logo launcher — draggable, hidden while panel is open */}
      {!bubbleOpen && (
        <button
          ref={launcherRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-label="Chat with Amina"
          className="fixed z-[55] w-14 h-14 rounded-full overflow-hidden select-none touch-none bg-gradient-to-b from-[#EDD9C8] to-[#F2ECE4]"
          style={{
            left: pos.x,
            top: pos.y,
            boxShadow: '0 6px 28px rgba(140,80,60,0.36)',
            cursor: 'grab',
          }}
        >
          <Amina3DCharacter variant="avatar" size={56} className="w-full h-full" />
        </button>
      )}

      {/* Scrim */}
      <div
        onClick={closeBubble}
        aria-hidden
        className="fixed inset-0 z-[80] bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: bubbleOpen ? 1 : 0, pointerEvents: bubbleOpen ? 'auto' : 'none' }}
      />

      {/* Slide-up panel */}
      <div
        role="dialog"
        aria-label="Amina chat"
        aria-modal="true"
        className="fixed left-0 right-0 bottom-0 z-[90] mx-auto w-full max-w-md flex flex-col bg-cream rounded-t-3xl"
        style={{
          height: '80dvh',
          boxShadow: '0 -8px 40px rgba(60,40,30,0.18)',
          transform: bubbleOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          visibility: bubbleOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--amina-hairline)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-b from-[#EDD9C8] to-[#F2ECE4] flex-shrink-0">
              <Amina3DCharacter variant="avatar" size={40} />
            </div>
            <div>
              <p className="font-amina-voice italic text-[18px] leading-tight text-charcoal">Amina</p>
              <p className="text-[11px] text-charcoal/50">Here to walk with you</p>
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
              className={`max-w-[85%] px-4 py-2.5 leading-relaxed rounded-2xl ${
                m.role === 'user'
                  ? 'self-end rounded-br-md text-ivory text-[15px]'
                  : 'self-start rounded-bl-md text-charcoal text-[16px] font-amina-voice'
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
              className="self-start rounded-2xl rounded-bl-md px-4 py-3 text-charcoal/50 text-sm flex items-center gap-1.5"
              style={{ background: 'var(--amina-ivory)', border: '1px solid var(--amina-hairline)' }}
            >
              <Sparkles size={14} className="animate-pulse" />
              Amina is reflecting…
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
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
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
