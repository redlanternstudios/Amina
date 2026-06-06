'use client'

import { useRouter } from 'next/navigation'

const features = [
  { icon: '💬', label: 'Start a Conversation', desc: 'Talk to Amina about anything on your heart.', href: '/home' },
  { icon: '🌙', label: 'Daily Reflection', desc: 'Take a moment to reflect and grow closer to Allah.', href: '/reflections' },
  { icon: '📖', label: 'Guidance Library', desc: 'Explore articles and reflections for your journey.', href: '/guidance' },
  { icon: '🔖', label: 'Saved Reflections', desc: 'Keep your favorite conversations and notes.', href: '/reflections' },
]

export default function CompletePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-cream flex flex-col px-6 py-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="text-5xl mb-4">🌙✨</div>
        <h1 className="font-display text-3xl text-charcoal">You\'re all set!</h1>
        <p className="font-display text-xl text-rose-600 mb-3">Welcome to your space.</p>
        <p className="text-charcoal/60 text-sm leading-relaxed max-w-xs">
          Amina is ready to walk this journey with you. Let\'s begin with intention.
        </p>
      </div>

      {/* What you can do */}
      <div className="bg-ivory rounded-2xl p-5 mb-6">
        <p className="font-semibold text-charcoal text-sm mb-4">Here\'s what you can do:</p>
        <div className="space-y-3">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => router.push(f.href)}
              className="w-full flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg flex-shrink-0">
                {f.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{f.label}</p>
                <p className="text-charcoal/60 text-xs">{f.desc}</p>
              </div>
              <span className="text-charcoal/30 text-sm">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quran quote card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 p-5 mb-8">
        <button className="absolute top-3 right-3 text-rose-300 text-lg">🤍</button>
        <p className="font-display text-lg text-charcoal/80 leading-relaxed mb-2">
          "Indeed, with hardship comes ease."
        </p>
        <p className="text-charcoal/50 text-xs">— Qur\'an 94:6</p>
      </div>

      {/* Go to Home */}
      <button
        onClick={() => router.push('/home')}
        className="btn-secondary w-full"
      >
        Go to Home →
      </button>
    </div>
  )
}
