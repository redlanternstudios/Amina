'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingShell from '@/components/onboarding/OnboardingShell'

const OPTIONS = [
  { id: 'guidance', icon: '❤️', title: 'Seek Guidance', desc: 'I want advice and clarity for life’s challenges.' },
  { id: 'faith', icon: '🌿', title: 'Grow in Faith', desc: 'I want to deepen my faith and understanding.' },
  { id: 'reflection', icon: '✏️', title: 'Daily Reflection', desc: 'I want a space to reflect and journal.' },
  { id: 'support', icon: '👥', title: 'Emotional Support', desc: 'I need a listening ear and encouragement.' },
  { id: 'other', icon: '•••', title: 'Other', desc: 'Something else.' },
]

export default function IntentPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ob_intent', selected)
    }
    router.push('/onboarding/tone')
  }

  return (
    <OnboardingShell step={1} totalSteps={4} onBack={() => router.push('/welcome')}>
      <div className="flex-1 flex flex-col">
        {/* Header illustration */}
        <div className="flex justify-end mb-4">
          <div className="w-24 h-24 flex items-center justify-center">
            <span className="text-5xl">🌙✨</span>
          </div>
        </div>

        <h2 className="font-display text-3xl text-charcoal mb-1">
          What brings you to
        </h2>
        <h2 className="font-display text-3xl italic mb-2">
          <span className="text-rose-amina">Amina</span>?
        </h2>
        <p className="text-charcoal/50 text-sm mb-6">
          This helps Amina personalize your experience.
        </p>

        <div className="flex flex-col gap-3">
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                selected === opt.id
                  ? 'border-rose-amina bg-rose-amina/5'
                  : 'border-charcoal/10 bg-ivory'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-xl flex-shrink-0">
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{opt.title}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === opt.id ? 'border-rose-amina bg-rose-amina' : 'border-charcoal/20'
              }`}>
                {selected === opt.id && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="btn-primary w-full disabled:opacity-40"
      >
        Continue <span>→</span>
      </button>
    </OnboardingShell>
  )
}
