'use client'

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
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-charcoal/60">
          ‹
        </button>
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < step ? 'bg-rose-amina' : 'bg-charcoal/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
        {children}
      </div>
    </div>
  )
}
