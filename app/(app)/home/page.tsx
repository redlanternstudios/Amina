'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ArrowUp, Paperclip, Mic, Sparkles, MoreHorizontal, Heart, Moon, BookOpen, Leaf } from 'lucide-react'
import AppHeader from '@/components/app/AppHeader'
import AminaIcon from '@/components/brand/AminaIcon'
import { listConversations, type DBConversation } from '@/lib/supabase/chat'

const QUICK_CHIPS = [
  { id: 'reflect', icon: Heart, label: 'Reflect', q: 'I need help reflecting on something.' },
  { id: 'guidance', icon: Moon, label: 'Guidance', q: 'I need some Islamic guidance today.' },
  { id: 'learn', icon: BookOpen, label: 'Learn', q: 'Teach me something from the Quran or Sunnah.' },
  { id: 'grow', icon: Leaf, label: 'Grow', q: 'Help me grow in my faith and character.' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs === 1 ? '1h ago' : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function HomePage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [conversations, setConversations] = useState<DBConversation[]>([])

  useEffect(() => {
    listConversations()
      .then(data => setConversations(data.slice(0, 5)))
      .catch(() => {})
  }, [])

  function startChat(text: string) {
    if (!text.trim()) return
    const id = crypto.randomUUID()
    router.push(`/chat/${id}?q=${encodeURIComponent(text.trim())}`)
  }

  function handleSend() {
    startChat(message)
  }

  return (
    <div className="flex flex-col bg-cream pb-20">
      <AppHeader
        brand
        right={
          <button
            onClick={() => setShowNotifications(true)}
            aria-label="Notifications"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory relative text-secondary"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <Bell size={18} strokeWidth={1.5} />
          </button>
        }
      />

      {/* Arch hero + greeting */}
      <div className="relative px-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-ivory flex flex-col justify-end p-4" style={{ border: '1px solid var(--amina-hairline)' }}>
          {/* Arch motif */}
          <div className="absolute inset-0 flex items-center justify-end opacity-20">
            <div className="w-32 h-40 rounded-t-full mr-4" style={{ border: '3px solid var(--amina-muted-gold)' }} />
          </div>
          <h2 className="font-display text-2xl text-charcoal leading-tight">
            Assalamu alaykum, <span className="text-rose-amina">Sister</span>
          </h2>
          <p className="text-muted text-xs mt-0.5">How can I support you today?</p>

          {/* Quick chips */}
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 -mx-1 px-1">
            {QUICK_CHIPS.map(chip => {
              const Icon = chip.icon
              return (
                <button key={chip.id} onClick={() => startChat(chip.q)} className="chip flex-shrink-0 text-xs">
                  <Icon size={14} strokeWidth={1.5} className="text-olive" /> {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Amina chat card */}
      <div className="px-4 mb-3">
        <div className="card">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center" style={{ border: '1px solid var(--amina-hairline)' }}>
                <AminaIcon size={22} />
              </div>
              <div>
                <p className="font-semibold text-rose-amina text-sm">Amina</p>
                <p className="text-muted text-xs">Your companion for faith, reflection, and growth.</p>
              </div>
            </div>
            <button aria-label="More options" className="text-muted">
              <MoreHorizontal size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Opening message */}
          <div className="bg-cream rounded-2xl p-3 mb-2.5">
            <p className="text-charcoal text-sm leading-relaxed">
              Salam, Sister.<br />
              I&apos;m so happy you&apos;re here.<br />
              What&apos;s on your heart today?
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-cream rounded-full px-4 py-2.5" style={{ border: '1px solid var(--amina-border)' }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-muted outline-none"
            />
            <button onClick={handleSend} aria-label="Send" className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center">
              <ArrowUp size={16} strokeWidth={2} className="text-white" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mt-2 px-1 text-muted">
            <button aria-label="Attach file" className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center">
              <Paperclip size={16} strokeWidth={1.5} />
            </button>
            <button aria-label="Voice input" className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center">
              <Mic size={16} strokeWidth={1.5} />
            </button>
            <div className="flex-1" />
            <button aria-label="Suggestions" className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Your Conversations */}
      {conversations.length > 0 && (
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A8A8A' }}>Your Conversations</p>
          </div>
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--amina-ivory)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--amina-primary-action)' }}
                >
                  <AminaIcon size={20} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-charcoal truncate">{conv.title ?? 'Chat with Amina'}</p>
                  <p className="text-xs" style={{ color: '#8A8A8A' }}>Last chat • {timeAgo(conv.updated_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Daily Reflection */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-semibold text-charcoal text-sm">Daily Reflection</p>
          <button className="btn-tertiary">View all</button>
        </div>
        <div className="card flex gap-4 items-center">
          <div className="w-20 h-20 rounded-2xl bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
            <BookOpen size={32} strokeWidth={1.25} className="text-olive" />
          </div>
          <div className="flex-1">
            <p className="text-rose-amina text-xs font-semibold mb-1">Today&apos;s Reflection</p>
            <p className="font-display text-xl text-charcoal leading-snug">And He is with you wherever you are.</p>
            <p className="text-muted text-xs mt-1">— Quran 57:4</p>
            <button className="flex items-center gap-1 text-rose-amina text-xs mt-2">
              <Heart size={14} strokeWidth={1.5} /> Reflect on this
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Bottom Sheet */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0"
            onClick={() => setShowNotifications(false)}
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <div
            className="relative w-full rounded-t-3xl p-6"
            style={{ background: 'var(--amina-card-bg, #F7F2EE)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 rounded-full" style={{ background: 'var(--amina-border)' }} />
            </div>

            {/* Icon and title */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-3xl mb-3">🌙</div>
              <h2 className="text-lg font-semibold text-charcoal">Notifications coming soon</h2>
            </div>

            {/* Message */}
            <p className="text-center text-muted text-sm leading-relaxed mb-6">
              You&apos;ll be notified when sisters respond to your du&apos;as, and when Amina has a reflection waiting for you inshallah.
            </p>

            {/* Close button */}
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-3 rounded-lg font-medium transition-opacity"
              style={{ background: '#F7F2EE', color: '#07080D' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
