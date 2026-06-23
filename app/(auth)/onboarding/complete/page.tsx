'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Heart, MessageCircle, Moon, BookOpen, Bookmark } from 'lucide-react'
import AminaIcon from '@/components/brand/AminaIcon'

const features = [
  { icon: MessageCircle, label: 'Start a Conversation', desc: 'Talk to Amina about anything on your heart.', href: '/home' },
  { icon: Moon, label: 'Daily Reflection', desc: 'Take a moment to reflect and grow closer to Allah.', href: '/reflections' },
  { icon: BookOpen, label: 'Guidance Library', desc: 'Explore articles and reflections for your journey.', href: '/guidance' },
  { icon: Bookmark, label: 'Saved Reflections', desc: 'Keep your favorite conversations and notes.', href: '/reflections' },
]

export default function CompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <AminaIcon size={56} />
        </div>
        <h1 className="font-display text-3xl text-charcoal">You&apos;re all set!</h1>
        <p className="font-display text-2xl text-rose-amina mb-3">Welcome to your space.</p>
        <p className="text-charcoal/60 text-sm leading-relaxed max-w-xs">
          Amina is ready to walk this journey with you. Let&apos;s begin with intention.
        </p>
      </div>

      {/* What you can do */}
      <div className="card mb-6">
        <p className="font-semibold text-charcoal text-sm mb-4">Here&apos;s what you can do:</p>
        <div className="space-y-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <button key={i} onClick={() => router.push(f.href)} className="w-full flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                  <Icon size={18} strokeWidth={1.5} className="text-olive" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal text-sm">{f.label}</p>
                  <p className="text-charcoal/60 text-xs">{f.desc}</p>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="text-charcoal/30" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Quran quote card */}
      <div className="relative rounded-3xl overflow-hidden p-5 mb-8" style={{ backgroundColor: 'var(--amina-warm-highlight)' }}>
        <button aria-label="Save reflection" className="absolute top-3 right-3 text-rose-amina">
          <Heart size={18} strokeWidth={1.5} />
        </button>
        <p className="font-display text-xl text-charcoal/80 leading-relaxed mb-2">
          &ldquo;Indeed, with hardship comes ease.&rdquo;
        </p>
        <p className="text-charcoal/50 text-xs">— Qur&apos;an 94:6</p>
      </div>

      {/* Go to Home */}
      <button onClick={() => router.push('/home')} className="btn-primary w-full">
        Go to Home <ArrowRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}
