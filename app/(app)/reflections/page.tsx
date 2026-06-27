'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Heart, NotebookPen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppHeader from '@/components/app/AppHeader'

interface Reflection {
  id: string
  title: string
  summary: string | null
  tag: string | null
  favorited: boolean
  created_at: string
}

const FILTERS = ['All', 'Favorites']

function timeLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReflectionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showSheet, setShowSheet] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newTag, setNewTag] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReflections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setShowSheet(false)
      }
    }
    if (showSheet) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSheet])

  async function loadReflections() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('id, title, summary, tag, favorited, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setReflections(data ?? [])
    } catch {
      setReflections([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleFavorite(id: string, current: boolean) {
    setReflections(prev => prev.map(r => r.id === id ? { ...r, favorited: !current } : r))
    await supabase.from('reflections').update({ favorited: !current }).eq('id', id)
  }

  async function submitReflection() {
    if (!newTitle.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert({
          title: newTitle.trim(),
          summary: newSummary.trim() || null,
          tag: newTag.trim() || null,
          favorited: false,
        })
        .select()
      if (error) throw error
      if (data && data[0]) {
        setReflections(prev => [data[0], ...prev])
        setNewTitle('')
        setNewSummary('')
        setNewTag('')
        setShowSheet(false)
      }
    } catch (error) {
      console.error('[v0] Error creating reflection:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = reflections.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    if (activeFilter === 'Favorites') return r.favorited
    return true
  })

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <AppHeader 
        title="Reflections"
        right={
          <button
            onClick={() => setShowSheet(true)}
            className="w-9 h-9 rounded-full bg-rose-amina flex items-center justify-center flex-shrink-0"
            aria-label="Add reflection"
          >
            <span className="text-white text-sm font-bold">+</span>
          </button>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-2">
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
        <div
          className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2.5"
          style={{ border: '1px solid var(--amina-border)' }}
        >
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
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--amina-muted-gold)', animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <NotebookPen size={36} strokeWidth={1.25} className="text-olive mb-3" />
            <p className="font-semibold text-charcoal">
              {activeFilter === 'Favorites' ? 'No favorites yet' : 'No reflections yet'}
            </p>
            <p className="text-muted text-sm mt-1">
              {activeFilter === 'Favorites'
                ? 'Heart a reflection to save it here.'
                : 'Create your first reflection to capture your spiritual journey.'}
            </p>
            {activeFilter !== 'Favorites' && (
              <button
                onClick={() => setShowSheet(true)}
                className="btn-primary mt-4"
              >
                Add Reflection
              </button>
            )}
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal text-sm">{r.title}</p>
                  {r.summary && (
                    <p className="text-secondary text-xs mt-1 leading-relaxed">{r.summary}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {r.tag && (
                      <span
                        className="text-secondary text-xs px-2.5 py-0.5 rounded-full"
                        style={{ background: 'var(--amina-cream)', border: '1px solid var(--amina-hairline)' }}
                      >
                        {r.tag}
                      </span>
                    )}
                    <span className="text-muted text-xs">{timeLabel(r.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(r.id, r.favorited)}
                  aria-label={r.favorited ? 'Remove from favorites' : 'Add to favorites'}
                  className="flex-shrink-0 mt-0.5"
                >
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

      {/* Add Reflection Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowSheet(false)}>
          <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 bg-cream rounded-t-3xl p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl text-charcoal">New Reflection</h2>
              <button onClick={() => setShowSheet(false)} className="text-charcoal/40 text-lg">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Title</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What's on your heart?"
                  className="w-full bg-ivory rounded-xl p-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
                  maxLength={100}
                />
                <span className="text-xs text-charcoal/40 mt-1">{newTitle.length}/100</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Reflection (optional)</label>
                <textarea
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Share your thoughts, feelings, or insights..."
                  className="w-full bg-ivory rounded-xl p-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none resize-none h-24"
                  maxLength={500}
                />
                <span className="text-xs text-charcoal/40">{newSummary.length}/500</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Tag (optional)</label>
                <input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="e.g., Gratitude, Learning, Faith..."
                  className="w-full bg-ivory rounded-xl p-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
                  maxLength={20}
                />
              </div>

              <button
                onClick={submitReflection}
                disabled={!newTitle.trim() || submitting}
                className="w-full px-6 py-3 bg-rose-amina text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
