'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Heart, Leaf, Lock, MessageCircle, BookOpen, Users,
  Building2, Shield, Sparkles, HandHeart, NotebookPen, Bookmark,
} from 'lucide-react'
import AminaIcon from '@/components/brand/AminaIcon'

const slides = [
  {
    title: 'Welcome to',
    titleAccent: 'Amina',
    subtitle: 'A safe space for faith, reflection, and growth. You are seen, heard, and supported.',
    features: [
      { icon: Heart, label: 'Faith Centered', desc: 'Grounded in Islamic values and teachings.' },
      { icon: Leaf, label: 'Reflect & Grow', desc: 'Daily reflections and guidance for your journey.' },
      { icon: Lock, label: 'Private & Safe', desc: 'Your conversations are always private and secure.' },
    ],
  },
  {
    title: 'Your companion',
    titleAccent: 'for every moment',
    subtitle: 'Ask questions, seek guidance, and find peace — whenever you need it.',
    features: [
      { icon: MessageCircle, label: 'AI Companion', desc: 'Talk to Amina about anything on your heart.' },
      { icon: BookOpen, label: 'Guidance Library', desc: 'Curated Islamic knowledge and inspiration.' },
      { icon: Users, label: 'The Circle', desc: 'A sisterhood of Muslim women supporting each other.' },
    ],
  },
  {
    title: 'Built with',
    titleAccent: 'love & intention',
    subtitle: 'Every feature is designed with Muslim women in mind — from your first question to your deepest reflection.',
    features: [
      { icon: Building2, label: 'Faith-First Design', desc: 'Every response is rooted in Islamic values.' },
      { icon: Shield, label: 'Sisters Only', desc: 'A private, safe space created just for you.' },
      { icon: Sparkles, label: 'Always Growing', desc: 'New reflections, guidance, and features regularly.' },
    ],
  },
  {
    title: 'Ready to begin',
    titleAccent: 'your journey?',
    subtitle: 'Amina is here to walk beside you on your beautiful journey of faith, growth, and healing.',
    features: [
      { icon: HandHeart, label: 'Start a Conversation', desc: 'Talk to Amina about anything on your heart.' },
      { icon: NotebookPen, label: 'Daily Reflection', desc: 'Take a moment to reflect and grow closer to Allah.' },
      { icon: Bookmark, label: 'Saved Reflections', desc: 'Keep your favorite conversations and notes.' },
    ],
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const slide = slides[current]
  const isLast = current === slides.length - 1

  function next() {
    if (isLast) {
      router.push('/onboarding/intent')
    } else {
      setCurrent(current + 1)
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-8">
      {/* Skip */}
      <div className="flex justify-end mb-4">
        <button onClick={() => router.push('/onboarding/intent')} className="text-olive text-sm font-medium">
          Skip
        </button>
      </div>

      {/* Icon */}
      <div className="flex flex-col items-center text-center mt-4 mb-8">
        <div className="mb-6">
          <AminaIcon size={56} />
        </div>
        <h1 className="font-display text-4xl text-charcoal leading-tight">{slide.title}</h1>
        <h1 className="font-display text-4xl text-rose-amina mb-4 leading-tight">{slide.titleAccent}</h1>
        <p className="text-charcoal/70 text-base leading-relaxed max-w-xs">{slide.subtitle}</p>
      </div>

      {/* Features card */}
      <div className="card mb-8 space-y-4">
        {slide.features.map((f, i) => {
          const Icon = f.icon
          return (
            <div key={i} className={i < slide.features.length - 1 ? 'pb-4' : ''} style={i < slide.features.length - 1 ? { borderBottom: '1px solid var(--amina-hairline)' } : undefined}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                  <Icon size={18} strokeWidth={1.5} className="text-olive" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">{f.label}</p>
                  <p className="text-charcoal/60 text-sm">{f.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot pagination */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === current ? 16 : 8,
              backgroundColor: i === current ? 'var(--amina-primary-action)' : 'var(--amina-border)',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <button onClick={next} className="btn-primary w-full mb-4">
        {isLast ? 'Get Started' : 'Continue'} <ArrowRight size={18} strokeWidth={1.75} />
      </button>
      <p className="text-center text-sm text-charcoal/50">
        Already have an account?{' '}
        <button onClick={() => router.push('/onboarding/intent')} className="text-rose-amina font-medium">
          Sign In
        </button>
      </p>
    </div>
  )
}
