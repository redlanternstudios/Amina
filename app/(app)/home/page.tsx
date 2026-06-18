'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StreakCounter } from '@/components/amina/StreakCounter'
import { useSession } from '@/lib/supabase/use-session'

const QUICK_CHIPS = [
  { id: 'reflect', icon: '❤️', label: 'Reflect' },
  { id: 'guidance', icon: '🌙', label: 'Guidance' },
  { id: 'learn', icon: '📖', label: 'Learn' },
  { id: 'grow', icon: '🌿', label: 'Grow' },
]

const RECENT_CONVERSATIONS = [
  { id: '1', title: 'Finding Peace in Uncertainty', time: 'Today', color: '#C9796A', progress: 70 },
  { id: '2', title: 'Building a Stronger Connection with Allah', time: 'Yesterday', color: '#8E9878', progress: 45 },
  { id: '3', title: 'Letting Go & Trusting Allah', time: '2 days ago', color: '#D7BA82', progress: 30 },
]

export default function HomePage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const session = useSession()
  const accessToken = session?.access_token ?? ''

  function handleSend() {
    if (!message.trim()) return
    router.push(`/chat/new?q=${encodeURIComponent(message)}`)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory">
          <span className="text-charcoal/60 text-lg">☰</span>
        </button>
        <h1 className="font-display text-2xl text-charcoal italic absolute left-1/2 -translate-x-1/2">
          Amina
        </h1>
        <button
          onClick={() => setShowNotifications(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory relative">
          <span className="text-charcoal/60 text-lg">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-amina" />
        </button>
      </div>

      {/* Arch hero + greeting */}
      <div className="relative px-4 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-ivory min-h-[160px] flex flex-col justify-end p-5">
          {/* Arch bg visual */}
          <div className="absolute inset-0 flex items-center justify-end opacity-20">
            <div className="w-32 h-40 rounded-t-full border-4 border-gold mr-4" />
          </div>
          <h2 className="font-display text-2xl text-charcoal">
            Assalamu alaykum, <span className="text-rose-amina">Sister</span>
          </h2>
          <p className="text-charcoal/50 text-sm mt-1">How can I support you today?</p>

          {/* Quick chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => router.push(`/chat/new?topic=${chip.id}`)}
                className="chip flex-shrink-0 text-xs"
              >
                <span>{chip.icon}</span> {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Streak Counter — wired to /api/streak via Supabase session token */}
      <div className="px-4 mb-4">
        <StreakCounter accessToken={accessToken} />
      </div>

      {/* Amina chat card */}
      <div className="px-4 mb-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-amina flex items-center justify-center">
                <span className="text-white text-lg">🌙</span>
              </div>
              <div>
                <p className="font-semibold text-rose-amina text-sm">Amina</p>
                <p className="text-charcoal/40 text-xs">Your companion for faith, reflection, and growth.</p>
              </div>
            </div>
            <button className="text-charcoal/30 text-lg">…</button>
          </div>

          {/* Opening message */}
          <div className="bg-cream rounded-2xl p-3 mb-3">
            <p className="text-charcoal text-sm leading-relaxed">
              Salam, Sister 🌸<br />
              I'm so happy you're here.<br />
              What's on your heart today?
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-cream rounded-full px-4 py-2.5 border border-charcoal/10">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center"
            >
              <span className="text-white text-sm">↑</span>
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mt-2 px-1">
            <button className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center text-charcoal/40">
              📎
            </button>
            <button className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center text-charcoal/40">
              🎤
            </button>
            <div className="flex-1" />
            <button className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center text-charcoal/40">
              ✨
            </button>
          </div>
        </div>
      </div>

      {/* Continue Your Journey */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Continue Your Journey</p>
          <button className="text-olive text-xs">View all →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {RECENT_CONVERSATIONS.map(conv => (
            <button
              key={conv.id}
              onClick={() => router.push(`/chat/${conv.id}`)}
              className="flex-shrink-0 w-44 card text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: conv.color + '20' }}>
                <span className="text-lg">📖</span>
              </div>
              <p className="font-semibold text-charcoal text-xs leading-snug mb-1">{conv.title}</p>
              <p className="text-charcoal/40 text-xs mb-2">Last chat • {conv.time}</p>
              <div className="h-1 rounded-full bg-charcoal/10">
                <div className="h-1 rounded-full" style={{ width: `${conv.progress}%`, backgroundColor: conv.color }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Reflection */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Daily Reflection</p>
          <button className="text-olive text-xs">View all →</button>
        </div>
        <div className="card flex gap-4 items-center">
          <div className="w-20 h-20 rounded-xl bg-ivory flex items-center justify-center text-4xl flex-shrink-0">
            📚
          </div>
          <div className="flex-1">
            <p className="text-rose-amina text-xs font-semibold mb-1">Today's Reflection</p>
            <p className="font-display text-lg text-charcoal leading-snug">
              And He is with you wherever you are.
            </p>
            <p className="text-charcoal/40 text-xs mt-1">— Quran 57:4</p>
            <button className="flex items-center gap-1 text-rose-amina text-xs mt-2">
              <span>❤️</span> Reflect on this
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Notifications bottom sheet stub */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          <div className="relative bg-cream rounded-t-3xl w-full max-w-lg px-6 pt-6 pb-10 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal/50"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center py-10">
              <span className="text-4xl mb-4">🌙</span>
              <p className="text-charcoal text-center font-medium">
                Notifications coming soon inshallah 🌙
              </p>
              <p className="text-charcoal/40 text-sm text-center mt-2">
                We&apos;re working on something special for you.
              </p>
            </div>
          </div>
        </div>
      )}
  )
}
