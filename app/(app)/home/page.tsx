'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ArrowUp, Paperclip, Mic, Sparkles, MoreHorizontal, Heart, Moon, BookOpen, Leaf } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/app/AppHeader'
import AminaIcon from '@/components/brand/AminaIcon'

const QUICK_CHIPS = [
  { id: 'reflect', icon: Heart, label: 'Reflect', q: 'I need help reflecting on something.' },
  { id: 'guidance', icon: Moon, label: 'Guidance', q: 'I need some Islamic guidance today.' },
  { id: 'learn', icon: BookOpen, label: 'Learn', q: 'Teach me something from the Quran or Sunnah.' },
  { id: 'grow', icon: Leaf, label: 'Grow', q: 'Help me grow in my faith and character.' },
]

const RECENT_CONVERSATIONS = [
  { id: '1', title: 'Finding Peace in Uncertainty', time: 'Today', color: 'var(--amina-dusty-rose)', progress: 70 },
  { id: '2', title: 'Building a Stronger Connection with Allah', time: 'Yesterday', color: 'var(--amina-soft-olive)', progress: 45 },
  { id: '3', title: 'Letting Go & Trusting Allah', time: '2 days ago', color: 'var(--amina-muted-gold)', progress: 30 },
]

export default function HomePage() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  function startChat(text: string) {
    if (!text.trim()) return
    const id = crypto.randomUUID()
    router.push(`/chat/${id}?q=${encodeURIComponent(text.trim())}`)
  }

  function handleSend() {
    startChat(message)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-28">
      <AppHeader
        brand
        right={
          <button aria-label="Notifications" className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory relative text-charcoal/70" style={{ border: '1px solid var(--amina-hairline)' }}>
            <Bell size={18} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-amina" />
          </button>
        }
      />

      {/* Arch hero + greeting */}
      <div className="relative px-4 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-ivory min-h-[160px] flex flex-col justify-end p-5" style={{ border: '1px solid var(--amina-hairline)' }}>
          {/* Arch motif */}
          <div className="absolute inset-0 flex items-center justify-end opacity-20">
            <div className="w-32 h-40 rounded-t-full mr-4" style={{ border: '3px solid var(--amina-muted-gold)' }} />
          </div>
          <h2 className="font-display text-3xl text-charcoal leading-tight">
            Assalamu alaykum, <span className="text-rose-amina">Sister</span>
          </h2>
          <p className="text-charcoal/50 text-sm mt-1">How can I support you today?</p>

          {/* Quick chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
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
      <div className="px-4 mb-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center" style={{ border: '1px solid var(--amina-hairline)' }}>
                <AminaIcon size={22} />
              </div>
              <div>
                <p className="font-semibold text-rose-amina text-sm">Amina</p>
                <p className="text-charcoal/40 text-xs">Your companion for faith, reflection, and growth.</p>
              </div>
            </div>
            <button aria-label="More options" className="text-charcoal/30">
              <MoreHorizontal size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Opening message */}
          <div className="bg-cream rounded-2xl p-3 mb-3">
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
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
            />
            <button onClick={handleSend} aria-label="Send" className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center">
              <ArrowUp size={16} strokeWidth={2} className="text-white" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mt-2 px-1 text-charcoal/40">
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

      {/* Continue Your Journey */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Continue Your Journey</p>
          <button className="btn-tertiary">View all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {RECENT_CONVERSATIONS.map(conv => (
            <button key={conv.id} onClick={() => router.push(`/chat/${conv.id}`)} className="flex-shrink-0 w-44 card text-left">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--amina-warm-highlight)' }}>
                <BookOpen size={18} strokeWidth={1.5} className="text-olive" />
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
          <button className="btn-tertiary">View all</button>
        </div>
        <div className="card flex gap-4 items-center">
          <div className="w-20 h-20 rounded-2xl bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
            <BookOpen size={32} strokeWidth={1.25} className="text-olive" />
          </div>
          <div className="flex-1">
            <p className="text-rose-amina text-xs font-semibold mb-1">Today&apos;s Reflection</p>
            <p className="font-display text-xl text-charcoal leading-snug">And He is with you wherever you are.</p>
            <p className="text-charcoal/40 text-xs mt-1">— Quran 57:4</p>
            <button className="flex items-center gap-1 text-rose-amina text-xs mt-2">
              <Heart size={14} strokeWidth={1.5} /> Reflect on this
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
