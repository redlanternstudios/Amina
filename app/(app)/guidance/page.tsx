'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔲' },
  { id: 'faith', label: 'Faith & Belief', icon: '🌙' },
  { id: 'heart', label: 'Heart & Mind', icon: '❤️' },
  { id: 'relationships', label: 'Relationships', icon: '👥' },
  { id: 'life', label: 'Life', icon: '🌿' },
]

const TOPICS = [
  { id: '1', title: 'Strengthen Your Iman', desc: 'Deepen your connection and faith.', count: 18, color: '#C9796A' },
  { id: '2', title: 'Inner Peace & Contentment', desc: 'Find calm in the remembrance of Allah.', count: 22, color: '#8E9878' },
  { id: '3', title: 'Healing the Heart', desc: 'Guidance for hurt, overwhelm, and worry.', count: 15, color: '#C9796A' },
  { id: '4', title: 'Family & Relationships', desc: 'Build stronger bonds with love and respect.', count: 20, color: '#8E9878' },
]

const QUESTIONS = [
  { id: '1', q: 'How do I find peace when I feel overwhelmed?', category: 'Faith & Belief' },
  { id: '2', q: 'How can I improve my connection with Allah?', category: 'Faith & Belief' },
  { id: '3', q: 'How do I let go of the past and move forward?', category: 'Heart & Mind' },
]

export default function GuidancePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory">
          <span className="text-charcoal/60 text-lg">☰</span>
        </button>
        <h1 className="font-display text-2xl text-charcoal italic absolute left-1/2 -translate-x-1/2">
          Amina
        </h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory">
          <span className="text-charcoal/60">🔍</span>
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-ivory min-h-[120px] flex flex-col justify-end p-5">
          <div className="absolute inset-0 flex items-center justify-end opacity-20">
            <div className="w-28 h-36 rounded-t-full border-4 border-gold mr-4" />
          </div>
          <h2 className="font-display text-3xl text-charcoal">Guidance</h2>
          <p className="text-charcoal/50 text-sm mt-1">Explore answers, wisdom, and reminders for life’s journey.</p>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`chip flex-shrink-0 text-xs ${ activeCategory === cat.id ? 'chip-active' : '' }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Featured */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Featured Guidance</p>
          <button className="text-olive text-xs">View all →</button>
        </div>
        <div className="card flex gap-4">
          <div className="w-24 h-24 rounded-xl bg-cream flex items-center justify-center text-4xl flex-shrink-0">
            📚
          </div>
          <div className="flex-1">
            <p className="text-rose-amina text-xs font-semibold mb-1">FEATURED</p>
            <p className="font-display text-lg text-charcoal leading-snug mb-1">Finding Strength in Tawakkul</p>
            <p className="text-charcoal/50 text-xs mb-3">Trusting Allah brings peace to the heart and clarity to the path.</p>
            <button className="btn-primary text-xs px-4 py-2">Read Article →</button>
          </div>
          <button className="text-charcoal/20 self-start">🔖</button>
        </div>
      </div>

      {/* Browse by topic */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Browse by topic</p>
          <button className="text-olive text-xs">View all →</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map(topic => (
            <div key={topic.id} className="card">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 text-xl"
                style={{ backgroundColor: topic.color + '20' }}>
                🌙
              </div>
              <p className="font-semibold text-charcoal text-xs leading-snug mb-1">{topic.title}</p>
              <p className="text-charcoal/40 text-xs mb-2">{topic.desc}</p>
              <p className="text-rose-amina text-xs">{topic.count} articles →</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular questions */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-charcoal text-sm">Popular Questions</p>
          <button className="text-olive text-xs">View all →</button>
        </div>
        <div className="flex flex-col gap-2">
          {QUESTIONS.map(q => (
            <button key={q.id} className="card flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-rose-amina/10 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-amina text-sm">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-charcoal text-xs font-medium">{q.q}</p>
                <p className="text-charcoal/40 text-xs">Answer • {q.category}</p>
              </div>
              <span className="text-charcoal/30">›</span>
              <button className="text-charcoal/20">🔖</button>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
