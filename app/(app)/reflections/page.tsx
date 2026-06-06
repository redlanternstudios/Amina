'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FILTERS = ['All Reflections', 'By Topic', 'By Date', 'Favorites']

const REFLECTIONS = [
  { id: '1', title: 'Finding Peace in Uncertainty', excerpt: 'Amina helped me remember that Allah’s plan is greater than my worries.', tags: ['Faith & Trust'], date: 'Today, 10:32 AM', fav: true },
  { id: '2', title: 'Dealing with Guilt and Self-Blame', excerpt: 'I learned that Allah’s mercy is greater than my mistakes. I can always turn back to Him.', tags: ['Self Growth'], date: 'May 10, 2025', fav: false },
  { id: '3', title: 'Building a Consistent Prayer Habit', excerpt: 'We talked about starting small and being consistent, not perfect.', tags: ['Worship'], date: 'May 8, 2025', fav: false },
  { id: '4', title: 'Patience in Difficult Seasons', excerpt: 'A reminder that this is temporary and Allah is with me through it all.', tags: ['Patience'], date: 'May 5, 2025', fav: false },
]

export default function ReflectionsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All Reflections')
  const [search, setSearch] = useState('')

  const filtered = REFLECTIONS.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.excerpt.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={() => router.back()} className="text-charcoal/60 text-2xl">‹</button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-xl text-charcoal">Reflections</h1>
          <p className="text-charcoal/40 text-xs">Your personal space for growth and clarity.</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`chip flex-shrink-0 text-xs ${ activeFilter === f ? 'chip-active' : '' }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2.5 border border-charcoal/10">
          <span className="text-charcoal/30 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your reflections..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📝</span>
            <p className="text-charcoal/50 text-sm">No reflections yet.<br />Start a conversation with Amina.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal text-sm mb-1">{r.title}</p>
                  <p className="text-charcoal/50 text-xs leading-relaxed mb-2">{r.excerpt}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.tags.map(tag => (
                      <span key={tag} className="chip text-xs">{tag}</span>
                    ))}
                    <span className="text-charcoal/30 text-xs ml-auto">{r.date}</span>
                  </div>
                </div>
                <button className={r.fav ? 'text-rose-amina' : 'text-charcoal/20'}>
                  ❤️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
