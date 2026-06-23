'use client'

import { ChevronLeft } from 'lucide-react'

interface Props {
  step: number
  totalSteps: number
  onBack: () => void
  children: React.ReactNode
}

export default function OnboardingShell({ step, totalSteps, onBack, children }: Props) {
  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Progress header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onBack} aria-label="Back" className="w-8 h-8 flex items-center justify-center text-charcoal/60">
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{ backgroundColor: i < step ? 'var(--amina-primary-action)' : 'var(--amina-border)' }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">{children}</div>
    </div>
  )
}
