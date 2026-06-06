'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingShell from '@/components/onboarding/OnboardingShell'

const TONES = [
  {
    id: 'gentle',
    title: 'Gentle & Nurturing',
    desc: 'Warm, soft, and compassionate support.',
    emoji: '🪭',
  },
  {
    id: 'wise',
    title: 'Wise & Thoughtful',
    desc: 'Insightful, reflective, and deep conversations.',
    emoji: '📚',
  },
  {
    id: 'encouraging',
    title: 'Encouraging & Uplifting',
    desc: 'Motivating and positive support to help you grow.',
    emoji: '✨',
  },
]

export default function TonePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ob_tone', selected)
    }
    router.push('/onboarding/preferences')
  }

  return (
    <OnboardingShell step={2} totalSteps={4} onBack={() => router.back()}>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end mb-4">
          <span className="text-5xl">🌙✨</span>
        </div>

        <h2 className="font-display text-3xl text-charcoal mb-1">
          How would you like
        </h2>
        <h2 className="font-display text-3xl mb-2">
          <span className="text-rose-amina italic">Amina</span>{' '}to support you?
        </h2>
        <p className="text-charcoal/50 text-sm mb-6">
          You can change this anytime in your settings.
        </p>

        <div className="flex flex-col gap-3">
          {TONES.map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelected(tone.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                selected === tone.id
                  ? 'border-rose-amina bg-rose-amina/5'
                  : 'border-charcoal/10 bg-ivory'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">
                {tone.emoji}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{tone.title}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{tone.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === tone.id ? 'border-rose-amina bg-rose-amina' : 'border-charcoal/20'
              }`}>
                {selected === tone.id && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Privacy note */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-ivory border border-charcoal/5">
          <span className="text-olive text-lg">🔒</span>
          <p className="text-xs text-charcoal/50">
            Your conversations are private and secure. Amina is here for you, always.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="btn-primary w-full disabled:opacity-40"
        >
          Continue <span>→</span>
        </button>
        <button
          onClick={() => router.push('/onboarding/preferences')}
          className="text-center text-sm text-charcoal/40 py-2"
        >
          Skip for now
        </button>
      </div>
    </OnboardingShell>
  )
}
