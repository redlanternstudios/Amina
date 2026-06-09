'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowRight, Check, Heart, Leaf, NotebookPen, Users, MoreHorizontal } from 'lucide-react'

const options = [
  { id: 'guidance', icon: Heart, label: 'Seek Guidance', desc: "I want advice and clarity for life's challenges." },
  { id: 'faith', icon: Leaf, label: 'Grow in Faith', desc: 'I want to deepen my faith and understanding.' },
  { id: 'reflect', icon: NotebookPen, label: 'Daily Reflection', desc: 'I want a space to reflect and journal.' },
  { id: 'support', icon: Users, label: 'Emotional Support', desc: 'I need a listening ear and encouragement.' },
  { id: 'other', icon: MoreHorizontal, label: 'Other', desc: 'Something else.' },
]

export default function IntentPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    sessionStorage.setItem('onboarding_intent', selected)
    router.push('/onboarding/tone')
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-8">
      <button onClick={() => router.back()} aria-label="Back" className="w-8 h-8 flex items-center justify-center mb-6 text-charcoal">
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i === 1 ? 'var(--amina-primary-action)' : 'var(--amina-border)' }} />
        ))}
      </div>

      <div className="mb-2">
        <h1 className="font-display text-3xl text-charcoal">What brings you to</h1>
        <h1 className="font-display text-3xl text-rose-amina mb-3">Amina?</h1>
        <p className="text-charcoal/60 text-sm">This helps Amina personalize your experience.</p>
      </div>

      {/* Options */}
      <div className="mt-6 space-y-3 flex-1">
        {options.map(opt => {
          const Icon = opt.icon
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                border: active ? '2px solid var(--amina-primary-action)' : '1px solid var(--amina-hairline)',
                backgroundColor: active ? 'var(--amina-rose-selected)' : 'var(--amina-warm-ivory)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--amina-hairline)' }}>
                <Icon size={18} strokeWidth={1.5} className="text-olive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{opt.label}</p>
                <p className="text-charcoal/60 text-xs mt-0.5">{opt.desc}</p>
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

      <button onClick={handleContinue} disabled={!selected} className={`btn-primary w-full mt-6 ${!selected ? 'opacity-40 cursor-not-allowed' : ''}`}>
        Continue <ArrowRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}
