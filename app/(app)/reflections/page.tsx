'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const FILTERS = ['All Reflections', 'By Topic', 'By Date', 'Favorites']

const SAMPLE_REFLECTIONS = [
  { id: '1', title: 'Finding Peace in Uncertainty', summary: "Amina helped me remember that Allah's plan is greater than my worries.", tag: 'Faith & Trust', date: 'Today, 10:32 AM', favorited: false },
  { id: '2', title: 'Dealing with Guilt and Self-Blame', summary: "I learned that Allah's mercy is greater than my mistakes. I can always turn back to Him.", tag: 'Self Growth', date: 'May 10, 2025', favorited: false },
  { id: '3', title: 'Building a Consistent Prayer Habit', summary: 'We talked about starting small and being consistent, not perfect.', tag: 'Worship', date: 'May 8, 2025', favorited: false },
  { id: '4', title: 'Patience in Difficult Seasons', summary: 'A reminder that this is temporary and Allah is with me through it all.', tag: 'Patience', date: 'May 5, 2025', favorited: false },
]

export default function ReflectionsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All Reflections')
  const [reflections, setReflections] = useState(SAMPLE_REFLECTIONS)
  const [search, setSearch] = useState('')

  function toggleFavorite(id: string) {
    setReflections(prev => prev.map(r => r.id === id ? { ...r, favorited: !r.favorited } : r))
  }

  const filtered = reflections.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    if (activeFilter === 'Favorites') return r.favorited
    return true
  })

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-cream">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-charcoal">← Back</button>
        </div>
        <h1 className="font-display text-2xl text-charcoal">Reflections</h1>
        <p className="text-charcoal/50 text-sm">Your personal space for growth and clarity.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f ? 'bg-rose-400 text-white' : 'bg-ivory text-charcoal/60'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-ivory rounded-xl px-4 py-2">
          <span className="text-charcoal/30">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your reflections..."
            className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-charcoal/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📝</span>
            <p className="font-semibold text-charcoal">No reflections yet</p>
            <p className="text-charcoal/50 text-sm mt-1">Start a conversation with Amina to save your first reflection.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-ivory rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal text-sm">{r.title}</p>
                  <p className="text-charcoal/60 text-xs mt-1 leading-relaxed">{r.summary}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-cream text-charcoal/60 text-xs px-2 py-0.5 rounded-full">{r.tag}</span>
                    <span className="text-charcoal/40 text-xs">{r.date}</span>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(r.id)} className="flex-shrink-0 mt-0.5">
                  <span className={r.favorited ? 'text-rose-400' : 'text-charcoal/20'}>♥</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
