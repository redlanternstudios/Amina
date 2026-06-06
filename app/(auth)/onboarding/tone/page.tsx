'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const tones = [
  {
    id: 'gentle',
    label: 'Gentle & Nurturing',
    desc: 'Warm, soft, and compassionate support.',
    emoji: '🕯️',
  },
  {
    id: 'wise',
    label: 'Wise & Thoughtful',
    desc: 'Insightful, reflective, and deep conversations.',
    emoji: '📖',
  },
  {
    id: 'encouraging',
    label: 'Encouraging & Uplifting',
    desc: 'Motivating and positive support to help you grow.',
    emoji: '🌿',
  },
]

export default function TonePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    sessionStorage.setItem('onboarding_tone', selected)
    router.push('/onboarding/preferences')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col px-6 py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center mb-6">
        <span className="text-charcoal text-lg">←</span>
      </button>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-rose-400' : 'bg-charcoal/15'}`} />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal">How would you like</h1>
        <h1 className="font-display text-3xl text-rose-600 mb-2">Amina to support you?</h1>
        <p className="text-charcoal/60 text-sm">You can change this anytime in your settings.</p>
      </div>

      {/* Tone options */}
      <div className="space-y-3 flex-1">
        {tones.map(tone => (
          <button
            key={tone.id}
            onClick={() => setSelected(tone.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              selected === tone.id
                ? 'border-rose-400 bg-rose-50'
                : 'border-charcoal/10 bg-ivory'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">
              {tone.emoji}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-charcoal text-sm">{tone.label}</p>
              <p className="text-charcoal/60 text-xs mt-0.5">{tone.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected === tone.id ? 'border-rose-500 bg-rose-500' : 'border-charcoal/30'
            }`}>
              {selected === tone.id && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-3 bg-ivory rounded-2xl p-4 mt-4">
        <span className="text-2xl">🛡️</span>
        <p className="text-charcoal/60 text-xs">Your conversations are private and secure. Amina is here for you, always.</p>
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`btn-primary w-full mt-6 ${
          !selected ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      >
        Continue →
      </button>
      <button onClick={() => router.push('/onboarding/preferences')} className="text-center text-sm text-charcoal/50 mt-3">
        Skip for now
      </button>
    </div>
  )
}
