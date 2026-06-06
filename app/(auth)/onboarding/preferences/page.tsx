'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const frequencies = ['Daily', 'A few times a week', 'Weekly']
const topics = [
  { id: 'faith', label: 'Faith & Belief', icon: '🌙' },
  { id: 'peace', label: 'Inner Peace', icon: '🌿' },
  { id: 'relationships', label: 'Relationships', icon: '👥' },
  { id: 'purpose', label: 'Purpose & Growth', icon: '🌱' },
  { id: 'gratitude', label: 'Gratitude', icon: '🤍' },
  { id: 'patience', label: 'Patience', icon: '⏳' },
]
const addressOptions = ['Sister', 'My name', 'Friend']

export default function PreferencesPage() {
  const router = useRouter()
  const [frequency, setFrequency] = useState('Daily')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['faith'])
  const [address, setAddress] = useState('Sister')
  const [reminders, setReminders] = useState(true)

  function toggleTopic(id: string) {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    sessionStorage.setItem('onboarding_prefs', JSON.stringify({ frequency, selectedTopics, address, reminders }))
    router.push('/onboarding/complete')
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
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-rose-400' : 'bg-charcoal/15'}`} />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal">Let\'s personalize</h1>
        <h1 className="font-display text-3xl text-rose-600 mb-2">Amina for you</h1>
        <p className="text-charcoal/60 text-sm">This helps Amina understand your journey better.</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Reflection frequency */}
        <div className="bg-ivory rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📅</span>
            <p className="font-semibold text-charcoal text-sm">How often would you like daily reflections?</p>
          </div>
          <div className="flex gap-2">
            {frequencies.map(f => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 px-2 rounded-full text-xs font-medium transition-all ${
                  frequency === f ? 'bg-rose-400 text-white' : 'bg-cream text-charcoal/60 border border-charcoal/15'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="bg-ivory rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🤍</span>
            <div>
              <p className="font-semibold text-charcoal text-sm">What topics matter most to you?</p>
              <p className="text-charcoal/50 text-xs">You can choose more than one</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topics.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all ${
                  selectedTopics.includes(t.id)
                    ? 'border-rose-400 bg-rose-50 text-charcoal'
                    : 'border-charcoal/10 bg-cream text-charcoal/60'
                }`}
              >
                <span>{t.icon}</span>
                <span className="font-medium text-xs">{t.label}</span>
                {selectedTopics.includes(t.id) && <span className="ml-auto text-rose-500 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Address preference */}
        <div className="bg-ivory rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">👤</span>
            <p className="font-semibold text-charcoal text-sm">How would you like Amina to address you?</p>
          </div>
          <select
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-cream border border-charcoal/15 rounded-xl px-4 py-3 text-charcoal text-sm"
          >
            {addressOptions.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Reminders */}
        <div className="bg-ivory rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <p className="font-semibold text-charcoal text-sm">Would you like gentle reminders?</p>
            <p className="text-charcoal/50 text-xs">We\'ll remind you to reflect and grow.</p>
          </div>
          <button
            onClick={() => setReminders(!reminders)}
            className={`w-12 h-6 rounded-full transition-all relative ${
              reminders ? 'bg-olive' : 'bg-charcoal/20'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              reminders ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleContinue} className="btn-primary w-full mt-6">
        Continue →
      </button>
    </div>
  )
}
