'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, Heart, NotebookPen } from 'lucide-react'
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
    setReflections(prev => prev.map(r => (r.id === id ? { ...r, favorited: !r.favorited } : r)))
  }

  const filtered = reflections.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    if (activeFilter === 'Favorites') return r.favorited
    return true
  })

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-28">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} aria-label="Back" className="flex items-center gap-1 text-charcoal text-sm">
            <ChevronLeft size={18} strokeWidth={1.5} /> Back
          </button>
        </div>
        <h1 className="font-display text-3xl text-charcoal">Reflections</h1>
        <p className="text-muted text-sm">Your personal space for growth and clarity.</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`chip flex-shrink-0 ${activeFilter === f ? 'chip-active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2.5" style={{ border: '1px solid var(--amina-border)' }}>
          <Search size={16} strokeWidth={1.5} className="text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your reflections..."
            className="flex-1 bg-transparent text-charcoal text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <NotebookPen size={36} strokeWidth={1.25} className="text-olive mb-3" />
            <p className="font-semibold text-charcoal">No reflections yet</p>
            <p className="text-muted text-sm mt-1">Start a conversation with Amina to save your first reflection.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal text-sm">{r.title}</p>
                  <p className="text-secondary text-xs mt-1 leading-relaxed">{r.summary}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-cream text-secondary text-xs px-2.5 py-0.5 rounded-full" style={{ border: '1px solid var(--amina-hairline)' }}>{r.tag}</span>
                    <span className="text-muted text-xs">{r.date}</span>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(r.id)} aria-label={r.favorited ? 'Remove from favorites' : 'Add to favorites'} className="flex-shrink-0 mt-0.5">
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                    className={r.favorited ? 'text-rose-amina' : 'text-muted'}
                    fill={r.favorited ? 'var(--amina-primary-action)' : 'none'}
                  />
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
