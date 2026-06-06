'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDES = [
  {
    title: 'Welcome to',
    titleAccent: 'Amina',
    subtitle: 'A safe space for faith, reflection, and growth. You are seen, heard, and supported.',
    features: [
      { icon: '❤️', title: 'Faith Centered', desc: 'Grounded in Islamic values and teachings.' },
      { icon: '🌿', title: 'Reflect & Grow', desc: 'Daily reflections and guidance for your journey.' },
      { icon: '🔒', title: 'Private & Safe', desc: 'Your conversations are always private and secure.' },
    ],
  },
  {
    title: 'Your companion for',
    titleAccent: 'every moment',
    subtitle: 'Ask questions, seek guidance, and find peace — whenever you need it.',
    features: [
      { icon: '💬', title: 'AI Companion', desc: 'Thoughtful, faith-centered responses.' },
      { icon: '📖', title: 'Guidance Library', desc: 'Curated Islamic knowledge at your fingertips.' },
      { icon: '🤍', title: 'Daily Reflection', desc: 'Quranic reminders to ground your day.' },
    ],
  },
  {
    title: 'A sisterhood built on',
    titleAccent: 'trust',
    subtitle: 'Join a community of Muslim women walking this journey together.',
    features: [
      { icon: '🧕‍♀️', title: 'The Circle', desc: 'Sisters-only community for support.' },
      { icon: '🎤', title: 'Voice & Reminders', desc: 'Gentle nudges to keep you grounded.' },
      { icon: '⭐', title: 'Your Space', desc: 'Personalized for your journey, your pace.' },
    ],
  },
  {
    title: 'Ready to begin your',
    titleAccent: 'journey?',
    subtitle: "Let's personalize Amina for you — it takes less than a minute.",
    features: [
      { icon: '🌙', title: 'Set your intentions', desc: 'Tell Amina what matters most to you.' },
      { icon: '✨', title: 'Choose your style', desc: 'Pick how Amina speaks with you.' },
      { icon: '🏠', title: 'Arrive home', desc: 'Your personalized space awaits.' },
    ],
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  function next() {
    if (isLast) {
      router.push('/onboarding/intent')
    } else {
      setSlide(s => s + 1)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => router.push('/onboarding/intent')}
          className="text-olive text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        {/* Arch icon */}
        <div className="w-32 h-32 flex items-center justify-center mb-6">
          <span className="text-7xl">🌙</span>
        </div>

        <h2 className="font-display text-3xl text-charcoal text-center mb-1">
          {current.title}
        </h2>
        <h2 className="font-display text-4xl text-rose-amina text-center italic mb-4">
          {current.titleAccent}
        </h2>
        <p className="text-charcoal/60 text-center text-base leading-relaxed mb-8">
          {current.subtitle}
        </p>

        {/* Feature list card */}
        <div className="card w-full divide-y divide-charcoal/5">
          {current.features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-xl flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-charcoal text-sm">{f.title}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === slide ? 'w-6 bg-rose-amina' : 'w-2 bg-charcoal/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 flex flex-col gap-3 mt-6">
        <button onClick={next} className="btn-primary w-full">
          Continue <span>→</span>
        </button>
        {slide === 0 && (
          <p className="text-center text-sm text-charcoal/40">
            Already have an account?{' '}
            <a href="/login" className="text-rose-amina font-medium">Sign In</a>
          </p>
        )}
      </div>
    </div>
  )
}
