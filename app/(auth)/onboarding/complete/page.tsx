'use client'

import { useRouter } from 'next/navigation'

const FEATURES = [
  { icon: '💬', title: 'Start a Conversation', desc: 'Talk to Amina about anything on your heart.' },
  { icon: '🌙', title: 'Daily Reflection', desc: 'Take a moment to reflect and grow closer to Allah.' },
  { icon: '📖', title: 'Guidance Library', desc: 'Explore articles and reflections for your journey.' },
  { icon: '🔖', title: 'Saved Reflections', desc: 'Keep your favorite conversations and notes.' },
]

export default function CompletePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-dvh bg-cream px-6 py-12">
      {/* Celebration header */}
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-5xl text-gold mb-4">🌙✨</span>
        <h2 className="font-display text-4xl text-charcoal">You’re all set!</h2>
        <p className="text-charcoal/50 text-base mt-1">Welcome to your space.</p>
        <p className="text-charcoal/50 text-sm mt-2 leading-relaxed">
          Amina is ready to walk this journey with you.<br />
          Let’s begin with intention.
        </p>
      </div>

      {/* Feature list */}
      <div className="card mb-6">
        <p className="text-charcoal/50 text-sm mb-4">Here’s what you can do:</p>
        <div className="flex flex-col gap-1">
          {FEATURES.map((f, i) => (
            <button
              key={i}
              className="flex items-center gap-4 py-3 border-b border-charcoal/5 last:border-0 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-rose-amina/10 flex items-center justify-center text-lg flex-shrink-0">
                {f.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">{f.title}</p>
                <p className="text-charcoal/40 text-xs mt-0.5">{f.desc}</p>
              </div>
              <span className="text-charcoal/30">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily quote card */}
      <div className="relative rounded-2xl overflow-hidden bg-ivory border border-gold/20 p-5 mb-8">
        <div className="absolute right-3 top-3">
          <span className="text-rose-amina">❤️</span>
        </div>
        <p className="font-display text-xl text-charcoal italic leading-snug mb-2">
          “Indeed, with hardship comes ease.”
        </p>
        <p className="text-charcoal/40 text-xs">— Qur’an 94:6</p>
      </div>

      <button
        onClick={() => router.push('/home')}
        className="w-full py-4 rounded-full bg-olive text-white font-medium text-base flex items-center justify-center gap-2"
      >
        Go to Home <span>→</span>
      </button>
    </div>
  )
}
