'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const CATEGORIES = ['All', 'Faith & Belief', 'Heart & Mind', 'Relationships', 'Life']

const TOPICS = [
  { icon: '🌙', label: 'Strengthen Your Iman', count: 18, color: 'bg-rose-100' },
  { icon: '🌿', label: 'Inner Peace & Contentment', count: 22, color: 'bg-green-100' },
  { icon: '🤍', label: 'Healing the Heart', count: 15, color: 'bg-amber-100' },
  { icon: '👥', label: 'Family & Relationships', count: 20, color: 'bg-blue-100' },
]

const POPULAR_QUESTIONS = [
  { icon: '💬', q: 'How do I find peace when I feel overwhelmed?', cat: 'Faith & Belief' },
  { icon: '🌿', q: 'How can I improve my connection with Allah?', cat: 'Faith & Belief' },
  { icon: '🤍', q: 'How do I let go of the past and move forward?', cat: 'Heart & Mind' },
]

export default function GuidancePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header hero */}
      <div className="px-4 pt-12 pb-4 relative overflow-hidden bg-cream">
        <div className="flex items-center justify-between mb-4">
          <button className="w-9 h-9 flex items-center justify-center">
            <span className="text-charcoal text-lg">☰</span>
          </button>
          <div className="font-display text-xl text-charcoal">Amina</div>
          <button className="w-9 h-9 flex items-center justify-center">
            <span className="text-charcoal/50">🔍</span>
          </button>
        </div>
        <h1 className="font-display text-3xl text-charcoal mb-1">Guidance</h1>
        <p className="text-charcoal/60 text-sm">Explore answers, wisdom, and reminders for life's journey.</p>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat ? 'bg-rose-400 text-white' : 'bg-ivory text-charcoal/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-24">
        {/* Featured Guidance */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Featured Guidance</p>
            <button className="text-olive text-sm">View all →</button>
          </div>
          <div className="bg-ivory rounded-2xl overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <span className="text-4xl">📖</span>
            </div>
            <div className="p-4">
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-wide mb-1">FEATURED</p>
              <p className="font-display text-xl text-charcoal mb-2">Finding Strength in Tawakkul</p>
              <p className="text-charcoal/60 text-sm mb-4">Trusting Allah brings peace to the heart and clarity to the path.</p>
              <button className="btn-primary text-sm px-5 py-2">Read Article →</button>
            </div>
          </div>
        </div>

        {/* Browse by topic */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Browse by topic</p>
            <button className="text-olive text-sm">View all →</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map(t => (
              <div key={t.label} className="bg-ivory rounded-2xl p-4">
                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-2xl mb-3`}>
                  {t.icon}
                </div>
                <p className="font-semibold text-charcoal text-sm leading-snug mb-1">{t.label}</p>
                <p className="text-rose-500 text-xs">{t.count} articles →</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-charcoal">Popular Questions</p>
            <button className="text-olive text-sm">View all →</button>
          </div>
          <div className="space-y-2">
            {POPULAR_QUESTIONS.map((q, i) => (
              <div key={i} className="bg-ivory rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg flex-shrink-0">
                  {q.icon}
                </div>
                <div className="flex-1">
                  <p className="text-charcoal text-sm font-medium">{q.q}</p>
                  <p className="text-charcoal/40 text-xs mt-0.5">Answer • {q.cat}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className="text-charcoal/30">›</span>
                  <span className="text-charcoal/30">🔖</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
