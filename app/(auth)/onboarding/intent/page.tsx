'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const options = [
  { id: 'guidance', icon: '🤍', label: 'Seek Guidance', desc: 'I want advice and clarity for life\'s challenges.' },
  { id: 'faith', icon: '🌿', label: 'Grow in Faith', desc: 'I want to deepen my faith and understanding.' },
  { id: 'reflect', icon: '✏️', label: 'Daily Reflection', desc: 'I want a space to reflect and journal.' },
  { id: 'support', icon: '👥', label: 'Emotional Support', desc: 'I need a listening ear and encouragement.' },
  { id: 'other', icon: '···', label: 'Other', desc: 'Something else.' },
]

export default function IntentPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    // Store in sessionStorage for onboarding flow
    sessionStorage.setItem('onboarding_intent', selected)
    router.push('/onboarding/tone')
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
          <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? 'bg-rose-400' : 'bg-charcoal/15'}`} />
        ))}
      </div>

      {/* Header */}
      <div className="mb-2">
        <h1 className="font-display text-3xl text-charcoal">What brings you to</h1>
        <h1 className="font-display text-3xl text-rose-600 mb-3">Amina?</h1>
        <p className="text-charcoal/60 text-sm">This helps Amina personalize your experience.</p>
      </div>

      {/* Options */}
      <div className="mt-6 space-y-3 flex-1">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              selected === opt.id
                ? 'border-rose-400 bg-rose-50'
                : 'border-charcoal/10 bg-ivory'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg flex-shrink-0">
              {opt.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-charcoal text-sm">{opt.label}</p>
              <p className="text-charcoal/60 text-xs mt-0.5">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected === opt.id ? 'border-rose-500 bg-rose-500' : 'border-charcoal/30'
            }`}>
              {selected === opt.id && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
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
    </div>
  )
}
