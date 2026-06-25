'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowRight, Check, ShieldCheck, Candy, BookOpen, Leaf } from 'lucide-react'

const tones = [
  { id: 'gentle', label: 'Gentle & Nurturing', desc: 'Warm, soft, and compassionate support.', icon: Candy },
  { id: 'wise', label: 'Wise & Thoughtful', desc: 'Insightful, reflective, and deep conversations.', icon: BookOpen },
  { id: 'encouraging', label: 'Encouraging & Uplifting', desc: 'Motivating and positive support to help you grow.', icon: Leaf },
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
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-8">
      <button onClick={() => router.back()} aria-label="Back" className="w-8 h-8 flex items-center justify-center mb-6 text-charcoal">
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i <= 2 ? 'var(--amina-primary-action)' : 'var(--amina-border)' }} />
        ))}
      </div>

      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal">How would you like</h1>
        <h1 className="font-display text-3xl text-rose-amina mb-2">Amina to support you?</h1>
        <p className="text-charcoal/60 text-sm">You can change this anytime in your settings.</p>
      </div>

      {/* Tone options */}
      <div className="space-y-3 flex-1">
        {tones.map(tone => {
          const Icon = tone.icon
          const active = selected === tone.id
          return (
            <button
              key={tone.id}
              onClick={() => setSelected(tone.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                border: active ? '2px solid var(--amina-primary-action)' : '1px solid var(--amina-hairline)',
                backgroundColor: active ? 'var(--amina-rose-selected)' : 'var(--amina-warm-ivory)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                <Icon size={24} strokeWidth={1.5} className="text-olive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{tone.label}</p>
                <p className="text-charcoal/60 text-xs mt-0.5">{tone.desc}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: active ? 'none' : '2px solid rgba(44,41,38,0.3)',
                  backgroundColor: active ? 'var(--amina-primary-action)' : 'transparent',
                }}
              >
                {active && <Check size={12} strokeWidth={2.5} className="text-white" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-3 card mt-4">
        <ShieldCheck size={22} strokeWidth={1.5} className="text-olive flex-shrink-0" />
        <p className="text-charcoal/60 text-xs">Your conversations are private and secure. Amina is here for you, always.</p>
      </div>

      <button onClick={handleContinue} disabled={!selected} className={`btn-primary w-full mt-6 ${!selected ? 'opacity-40 cursor-not-allowed' : ''}`}>
        Continue <ArrowRight size={18} strokeWidth={1.75} />
      </button>
      <button onClick={() => router.push('/onboarding/preferences')} className="text-center text-sm text-charcoal/50 mt-3">
        Skip for now
      </button>
    </div>
  )
}
