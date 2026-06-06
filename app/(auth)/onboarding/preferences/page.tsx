'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingShell from '@/components/onboarding/OnboardingShell'

const CADENCES = ['Daily', 'A few times a week', 'Weekly']
const TOPICS = [
  { id: 'faith', label: 'Faith & Belief' },
  { id: 'peace', label: 'Inner Peace' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'purpose', label: 'Purpose & Growth' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'patience', label: 'Patience' },
]
const ADDRESS_OPTIONS = ['Sister', 'My name', 'Friend']

export default function PreferencesPage() {
  const router = useRouter()
  const [cadence, setCadence] = useState('Daily')
  const [topics, setTopics] = useState<string[]>(['faith'])
  const [address, setAddress] = useState('Sister')
  const [reminders, setReminders] = useState(true)

  function toggleTopic(id: string) {
    setTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ob_prefs', JSON.stringify({ cadence, topics, address, reminders }))
    }
    router.push('/onboarding/complete')
  }

  return (
    <OnboardingShell step={3} totalSteps={4} onBack={() => router.back()}>
      <div className="flex-1 flex flex-col gap-5">
        <div>
          <h2 className="font-display text-3xl text-charcoal mb-1">Let’s personalize</h2>
          <h2 className="font-display text-3xl italic mb-2">
            <span className="text-rose-amina">Amina</span> for you
          </h2>
          <p className="text-charcoal/50 text-sm">This helps Amina understand your journey better.</p>
        </div>

        {/* Reflection cadence */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-amina">📅</span>
            <p className="font-semibold text-charcoal text-sm">How often would you like daily reflections?</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CADENCES.map(c => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`chip text-xs ${
                  cadence === c ? 'chip-active' : ''
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-amina">❤️</span>
            <div>
              <p className="font-semibold text-charcoal text-sm">What topics matter most to you?</p>
              <p className="text-charcoal/40 text-xs">You can choose more than one</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`chip text-xs ${
                  topics.includes(t.id) ? 'chip-active' : ''
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Address preference */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-amina">👤</span>
            <p className="font-semibold text-charcoal text-sm">How would you like Amina to address you?</p>
          </div>
          <select
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border border-charcoal/10 rounded-xl px-4 py-2.5 bg-cream text-charcoal text-sm appearance-none"
          >
            {ADDRESS_OPTIONS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-rose-amina">🔔</span>
              <div>
                <p className="font-semibold text-charcoal text-sm">Would you like gentle reminders?</p>
                <p className="text-charcoal/40 text-xs">We’ll remind you to reflect and grow.</p>
              </div>
            </div>
            <button
              onClick={() => setReminders(r => !r)}
              className={`w-12 h-6 rounded-full transition-colors ${
                reminders ? 'bg-olive' : 'bg-charcoal/20'
              } relative`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                reminders ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleContinue} className="btn-primary w-full mt-4">
        Continue <span>→</span>
      </button>
    </OnboardingShell>
  )
}
