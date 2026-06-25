'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import CircleDetailSkeleton from '@/components/circle/CircleDetailSkeleton'

interface Dua {
  id: string
  content: string
  is_answered: boolean
  ameen_count: number
  user_has_ameened: boolean
  created_at: string
}

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export default function DuaWallPage() {
  const supabase = createClientComponentClient()
  const [duas, setDuas] = useState<Dua[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [newDuaContent, setNewDuaContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
    loadDuas(true)
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

  const loadDuas = async (reset = false) => {
    if (reset) setNextCursor(null)
    const url = new URL('/api/dua-wall', window.location.origin)
    if (!reset && nextCursor) url.searchParams.set('cursor', nextCursor)
    url.searchParams.set('limit', '20')

    setLoadingMore(true)
    const res = await fetch(url.toString())
    if (res.ok) {
      const data = await res.json()
      if (reset) setDuas(data.duas)
      else setDuas(prev => [...prev, ...data.duas])
      setNextCursor(data.nextCursor)
    }
    setLoading(false)
    setLoadingMore(false)
  }

  const toggleAmeen = async (duaId: string) => {
    const dua = duas.find(d => d.id === duaId)
    if (!dua) return

    // Optimistic update
    setDuas(prev => prev.map(d =>
      d.id === duaId ? {
        ...d,
        ameen_count: d.user_has_ameened ? d.ameen_count - 1 : d.ameen_count + 1,
        user_has_ameened: !d.user_has_ameened,
      } : d
    ))

    const method = dua.user_has_ameened ? 'DELETE' : 'POST'
    const res = await fetch(`/api/dua-wall/${duaId}/ameen`, { method })
    if (!res.ok) {
      // Rollback
      setDuas(prev => prev.map(d =>
        d.id === duaId ? { ...dua } : d
      ))
    }
  }

  const markFulfilled = async (duaId: string) => {
    const res = await fetch(`/api/dua-wall/${duaId}/fulfilled`, {
      method: 'PATCH',
    })
    if (res.ok) {
      setDuas(prev => prev.map(d =>
        d.id === duaId ? { ...d, is_answered: true } : d
      ))
    }
  }

  const submitDua = async () => {
    if (!newDuaContent.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/dua-wall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newDuaContent.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setDuas(prev => [data.dua, ...prev])
      setNewDuaContent('')
      setShowSheet(false)
    }
    setSubmitting(false)
  }

  if (loading) return <CircleDetailSkeleton />

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-charcoal">Du'a Wall</h1>
            <p className="text-xs text-charcoal/50 mt-0.5">Lift each other in prayer.</p>
          </div>
          <button
            onClick={() => setShowSheet(true)}
            className="w-10 h-10 rounded-full bg-[#C9796A] flex items-center justify-center"
          >
            <span className="text-white text-lg">🤲</span>
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Amina weekly du'a */}
        <article className="bg-ivory rounded-2xl p-4 border-l-4 border-gold shadow-soft">
          <span className="text-xs font-medium text-gold uppercase tracking-wide">✦ From Amina</span>
          <p className="font-display italic text-sm text-charcoal mt-2 leading-relaxed">
            Rabbana hab lana min azwajina wa dhurriyatina qurrata a'yun — 
            Our Lord, grant us from among our spouses and offspring comfort to our eyes.
          </p>
          <p className="text-xs text-charcoal/40 mt-2">Surah Al-Furqan 25:74</p>
        </article>

        {/* Empty state */}
        {duas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-4xl">🤲</p>
            <p className="font-display italic text-xl text-charcoal">No du'as yet</p>
            <p className="text-sm text-charcoal/50 text-center max-w-xs">
              Be the first to lift your sisters in prayer.
            </p>
            <button
              onClick={() => setShowSheet(true)}
              className="px-6 py-3 bg-[#C9796A] text-white rounded-xl text-sm font-medium"
            >
              Make the first Du'a
            </button>
          </div>
        )}

        {/* Du'a feed */}
        {duas.map(dua => (
          <article key={dua.id} className="bg-ivory rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-charcoal/40 mb-2">
              A sister from the community · {timeAgo(dua.created_at)}
            </p>
            <p className="text-sm text-charcoal leading-relaxed">{dua.content}</p>
            {dua.is_answered && (
              <p className="text-xs text-[#8E9878] mt-2">✓ Answered — Alhamdulillah</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => toggleAmeen(dua.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                  dua.user_has_ameened
                    ? 'bg-[#C9796A] text-white'
                    : 'bg-transparent border border-charcoal/10 text-charcoal/60'
                }`}
              >
                <span>🤲</span>
                <span>Ameen</span>
                {dua.ameen_count > 0 && <span>· {dua.ameen_count}</span>}
              </button>
              {currentUserId && !dua.is_answered && (
                <button
                  onClick={() => markFulfilled(dua.id)}
                  className="text-xs text-[#8E9878]/70"
                >
                  Mark as answered
                </button>
              )}
            </div>
          </article>
        ))}

        {nextCursor && (
          <button
            onClick={() => loadDuas(false)}
            disabled={loadingMore}
            className="w-full py-3 text-sm text-charcoal/50 font-medium"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>

      {/* Post Du'a Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowSheet(false)}>
          <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 bg-cream rounded-t-3xl p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl text-charcoal">Make a Du'a</h2>
              <button onClick={() => setShowSheet(false)} className="text-charcoal/40 text-lg">×</button>
            </div>
            <p className="text-xs text-charcoal/50 mb-4">
              Your du'a will be shared anonymously with the community.
            </p>
            <textarea
              value={newDuaContent}
              onChange={e => setNewDuaContent(e.target.value)}
              placeholder="Ya Allah..."
              className="w-full bg-ivory rounded-xl p-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none resize-none h-24"
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-charcoal/40">{newDuaContent.length}/280</span>
              <button
                onClick={submitDua}
                disabled={!newDuaContent.trim() || submitting}
                className="px-6 py-3 bg-[#C9796A] text-white rounded-xl text-sm font-medium disabled:opacity-40"
              >
                Share Du'a 🤲
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
