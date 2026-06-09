'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowRight, Check, CalendarDays, Heart, User, Bell, Moon, Leaf, Users, Sprout, Hourglass } from 'lucide-react'

const frequencies = ['Daily', 'A few times a week', 'Weekly']
const topics = [
  { id: 'faith', label: 'Faith & Belief', icon: Moon },
  { id: 'peace', label: 'Inner Peace', icon: Leaf },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'purpose', label: 'Purpose & Growth', icon: Sprout },
  { id: 'gratitude', label: 'Gratitude', icon: Heart },
  { id: 'patience', label: 'Patience', icon: Hourglass },
]
const addressOptions = ['Sister', 'My name', 'Friend']

export default function PreferencesPage() {
  const router = useRouter()
  const [frequency, setFrequency] = useState('Daily')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['faith'])
  const [address, setAddress] = useState('Sister')
  const [reminders, setReminders] = useState(true)

  function toggleTopic(id: string) {
    setSelectedTopics(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]))
  }

  function handleContinue() {
    sessionStorage.setItem('onboarding_prefs', JSON.stringify({ frequency, selectedTopics, address, reminders }))
    router.push('/onboarding/complete')
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-8">
      <button onClick={() => router.back()} aria-label="Back" className="w-8 h-8 flex items-center justify-center mb-6 text-charcoal">
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i <= 3 ? 'var(--amina-primary-action)' : 'var(--amina-border)' }} />
        ))}
      </div>

      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal">Let&apos;s personalize</h1>
        <h1 className="font-display text-3xl text-rose-amina mb-2">Amina for you</h1>
        <p className="text-charcoal/60 text-sm">This helps Amina understand your journey better.</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Reflection frequency */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <CalendarDays size={20} strokeWidth={1.5} className="text-olive" />
            <p className="font-semibold text-charcoal text-sm">How often would you like daily reflections?</p>
          </div>
          <div className="flex gap-2">
            {frequencies.map(f => {
              const active = frequency === f
              return (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="flex-1 py-2 px-2 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: active ? 'var(--amina-primary-action)' : 'var(--amina-soft-cream)',
                    color: active ? '#fff' : 'var(--amina-secondary-text)',
                    border: active ? 'none' : '1px solid var(--amina-border)',
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={20} strokeWidth={1.5} className="text-olive" />
            <div>
              <p className="font-semibold text-charcoal text-sm">What topics matter most to you?</p>
              <p className="text-charcoal/50 text-xs">You can choose more than one</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topics.map(t => {
              const Icon = t.icon
              const active = selectedTopics.includes(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm text-left transition-all"
                  style={{
                    border: active ? '2px solid var(--amina-primary-action)' : '1px solid var(--amina-hairline)',
                    backgroundColor: active ? 'var(--amina-rose-selected)' : 'var(--amina-soft-cream)',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} className="text-olive" />
                  <span className="font-medium text-xs text-charcoal">{t.label}</span>
                  {active && <Check size={14} strokeWidth={2.5} className="ml-auto text-rose-amina" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Address preference */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <User size={20} strokeWidth={1.5} className="text-olive" />
            <p className="font-semibold text-charcoal text-sm">How would you like Amina to address you?</p>
          </div>
          <select
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-cream rounded-xl px-4 py-3 text-charcoal text-sm outline-none"
            style={{ border: '1px solid var(--amina-border)' }}
          >
            {addressOptions.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Reminders */}
        <div className="card flex items-center gap-3">
          <Bell size={20} strokeWidth={1.5} className="text-olive" />
          <div className="flex-1">
            <p className="font-semibold text-charcoal text-sm">Would you like gentle reminders?</p>
            <p className="text-charcoal/50 text-xs">We&apos;ll remind you to reflect and grow.</p>
          </div>
          <button
            onClick={() => setReminders(!reminders)}
            aria-label="Toggle reminders"
            className="w-12 h-6 rounded-full transition-all relative"
            style={{ backgroundColor: reminders ? 'var(--amina-soft-olive)' : 'var(--amina-border)' }}
          >
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: reminders ? 26 : 2 }} />
          </button>
        </div>
      </div>

      <button onClick={handleContinue} className="btn-primary w-full mt-6">
        Continue <ArrowRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}
