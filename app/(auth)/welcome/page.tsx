'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    icon: '🌙',
    title: 'Welcome to',
    titleAccent: 'Amina',
    subtitle: 'A safe space for faith, reflection, and growth. You are seen, heard, and supported.',
    features: [
      { icon: '🤍', label: 'Faith Centered', desc: 'Grounded in Islamic values and teachings.' },
      { icon: '🌿', label: 'Reflect & Grow', desc: 'Daily reflections and guidance for your journey.' },
      { icon: '🔒', label: 'Private & Safe', desc: 'Your conversations are always private and secure.' },
    ],
  },
  {
    icon: '🌙',
    title: 'Your companion',
    titleAccent: 'for every moment',
    subtitle: 'Ask questions, seek guidance, and find peace — whenever you need it.',
    features: [
      { icon: '💬', label: 'AI Companion', desc: 'Talk to Amina about anything on your heart.' },
      { icon: '📖', label: 'Guidance Library', desc: 'Curated Islamic knowledge and inspiration.' },
      { icon: '👥', label: 'The Circle', desc: 'A sisterhood of Muslim women supporting each other.' },
    ],
  },
  {
    icon: '🌙',
    title: 'Built with',
    titleAccent: 'love & intention',
    subtitle: 'Every feature is designed with Muslim women in mind — from your first question to your deepest reflection.',
    features: [
      { icon: '🕌', label: 'Faith-First Design', desc: 'Every response is rooted in Islamic values.' },
      { icon: '🛡️', label: 'Sisters Only', desc: 'A private, safe space created just for you.' },
      { icon: '✨', label: 'Always Growing', desc: 'New reflections, guidance, and features regularly.' },
    ],
  },
  {
    icon: '🌙',
    title: 'Ready to begin',
    titleAccent: 'your journey?',
    subtitle: 'Amina is here to walk beside you on your beautiful journey of faith, growth, and healing.',
    features: [
      { icon: '🤲', label: 'Start a Conversation', desc: 'Talk to Amina about anything on your heart.' },
      { icon: '📝', label: 'Daily Reflection', desc: 'Take a moment to reflect and grow closer to Allah.' },
      { icon: '🔖', label: 'Saved Reflections', desc: 'Keep your favorite conversations and notes.' },
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
    <div className="min-h-screen bg-cream flex flex-col px-6 py-8">
      {/* Skip */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push('/onboarding/intent')}
          className="text-olive text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Icon */}
      <div className="flex flex-col items-center text-center mt-4 mb-8">
        <div className="text-5xl mb-6">{slide.icon}</div>
        <h1 className="font-display text-3xl text-charcoal">{slide.title}</h1>
        <h1 className="font-display text-3xl text-rose-700 mb-4">{slide.titleAccent}</h1>
        <p className="text-charcoal/70 text-base leading-relaxed max-w-xs">{slide.subtitle}</p>
      </div>

      {/* Features card */}
      <div className="bg-ivory rounded-2xl p-5 mb-8 space-y-4">
        {slide.features.map((f, i) => (
          <div key={i} className={i < slide.features.length - 1 ? 'pb-4 border-b border-charcoal/10' : ''}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-charcoal text-sm">{f.label}</p>
                <p className="text-charcoal/60 text-sm">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot pagination */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-rose-400 w-4' : 'bg-charcoal/20'
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <button onClick={next} className="btn-primary w-full mb-4">
        {isLast ? 'Get Started' : 'Continue'} →
      </button>
      <p className="text-center text-sm text-charcoal/50">
        Already have an account?{' '}
        <button onClick={() => router.push('/sign-in')} className="text-rose-500 font-medium">
          Sign In
        </button>
      </p>
    </div>
  )
}
