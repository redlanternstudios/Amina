'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Heart, NotebookPen } from 'lucide-react'
import AppHeader from '@/components/app/AppHeader'
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
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      <AppHeader title="Reflections" />

      {/* Search Bar */}
      <div className="px-4 py-4 sticky top-12 z-30 bg-cream/95 backdrop-blur">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reflections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            style={{
              background: activeFilter === filter ? 'var(--amina-warm-highlight)' : 'var(--amina-card-bg)',
              color: activeFilter === filter ? 'var(--amina-primary-action)' : 'var(--amina-muted-text)',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Reflections List */}
      <div className="flex-1 px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <NotebookPen size={32} className="text-muted mb-3 opacity-50" />
            <p className="text-sm text-muted">No reflections yet. Start a conversation with Amina.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(reflection => (
              <button
                key={reflection.id}
                onClick={() => router.push(`/reflections/${reflection.id}`)}
                className="w-full text-left p-4 rounded-lg transition-all"
                style={{ background: 'var(--amina-card-bg)', border: '1px solid var(--amina-hairline)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-charcoal flex-1">{reflection.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(reflection.id)
                    }}
                    className="flex-shrink-0 transition-colors"
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.5}
                      fill={reflection.favorited ? 'var(--amina-primary-action)' : 'none'}
                      style={{ color: reflection.favorited ? 'var(--amina-primary-action)' : 'var(--amina-muted-text)' }}
                    />
                  </button>
                </div>
                <p className="text-sm text-muted mb-3 line-clamp-2">{reflection.summary}</p>
                <div className="flex items-center justify-between text-xs text-muted/70">
                  <span className="px-2 py-1 rounded-full bg-charcoal/5">{reflection.tag}</span>
                  <span>{reflection.date}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
