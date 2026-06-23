'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { Plus, X, ChevronLeft } from 'lucide-react'

type Dua = {
  id: string
  content: string
  is_answered: boolean
  ameen_count: number
  user_has_ameened: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function AmeenButton({ duaId, count, hasAmeened, onToggle }: {
  duaId: string
  count: number
  hasAmeened: boolean
  onToggle: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [optimisticCount, setOptimisticCount] = useState(count)
  const [optimisticActive, setOptimisticActive] = useState(hasAmeened)

  useEffect(() => {
    setOptimisticCount(count)
    setOptimisticActive(hasAmeened)
  }, [count, hasAmeened])

  const handleClick = async () => {
    if (loading) return
    setLoading(true)

    // Optimistic update
    setOptimisticActive(!optimisticActive)
    setOptimisticCount(prev => optimisticActive ? prev - 1 : prev + 1)

    try {
      const method = optimisticActive ? 'DELETE' : 'POST'
      const res = await fetch(`/api/dua-wall/${duaId}/ameen`, { method })
      const data = await res.json()
      if (data.ameen_count !== undefined) {
        setOptimisticCount(data.ameen_count)
      }
      onToggle(duaId)
    } catch {
      // Rollback
      setOptimisticActive(hasAmeened)
      setOptimisticCount(count)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
        optimisticActive
          ? 'bg-[#C9796A] text-white'
          : 'bg-[var(--amina-warm-ivory)] text-[var(--amina-soft-charcoal)] opacity-60 hover:opacity-100'
      }`}
    >
      <span>🤲</span>
      <span>Ameen</span>
      {optimisticCount > 0 && (
        <span className="font-medium">{optimisticCount}</span>
      )}
    </button>
  )
}

function DuaCard({ dua, isOwn, onToggleAmeen, onMarkFulfilled }: {
  dua: Dua
  isOwn: boolean
  onToggleAmeen: (id: string) => void
  onMarkFulfilled: (id: string) => void
}) {
  return (
    <article className="bg-[var(--amina-warm-ivory)] rounded-2xl p-4 shadow-[var(--amina-shadow-soft)]">
      <p className="text-xs text-[var(--amina-soft-charcoal)] opacity-40 mb-2">
        A sister from the community · {timeAgo(dua.created_at)}
      </p>
      <p className="text-sm text-[var(--amina-soft-charcoal)] leading-relaxed whitespace-pre-wrap">
        {dua.content}
      </p>
      {dua.is_answered && (
        <p className="text-xs text-[#8E9878] mt-2">✓ Answered — Alhamdulillah</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <AmeenButton
          duaId={dua.id}
          count={dua.ameen_count}
          hasAmeened={dua.user_has_ameened}
          onToggle={onToggleAmeen}
        />
        {isOwn && !dua.is_answered && (
          <button
            onClick={() => onMarkFulfilled(dua.id)}
            className="text-xs text-[#8E9878]/70 hover:text-[#8E9878]"
          >
            Mark as answered
          </button>
        )}
      </div>
    </article>
  )
}

export default function DuaWallPage() {
  const router = useRouter()
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [showSheet, setShowSheet] = useState(false)
  const [duaText, setDuaText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Get user ID from cookie
  useEffect(() => {
    try {
      const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
      if (match) {
        const blob = JSON.parse(decodeURIComponent(match[1]))
        setCurrentUserId(blob?.user?.id)
      }
    } catch { /* ignore */ }
  }, [])

  const fetchDuas = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: '20' })
    if (cursor) params.set('cursor', cursor)
    const res = await fetch(`/api/dua-wall?${params}`)
    const data = await res.json()
    return data
  }, [])

  useEffect(() => {
    fetchDuas().then(data => {
      setDuas(data.duas ?? [])
      setHasMore(data.nextCursor !== null)
      setLoading(false)
    })
  }, [fetchDuas])

  const loadMore = async () => {
    if (loadingMore || !hasMore || duas.length === 0) return
    setLoadingMore(true)
    const lastDua = duas[duas.length - 1]
    const data = await fetchDuas(lastDua.created_at)
    setDuas(prev => [...prev, ...(data.duas ?? [])])
    setHasMore(data.nextCursor !== null)
    setLoadingMore(false)
  }

  // Infinite scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore()
      }
    }, { rootMargin: '200px' })
    const sentinel = el.querySelector('#scroll-sentinel')
    if (sentinel) observer.observe(sentinel)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, duas.length])

  const handleToggleAmeen = (id: string) => {
    setDuas(prev => prev.map(d =>
      d.id === id ? { ...d, user_has_ameened: !d.user_has_ameened } : d
    ))
  }

  const handleMarkFulfilled = async (id: string) => {
    try {
      const res = await fetch(`/api/dua-wall/${id}/fulfilled`, { method: 'PATCH' })
      if (res.ok) {
        setDuas(prev => prev.map(d => d.id === id ? { ...d, is_answered: true } : d))
      }
    } catch { /* ignore */ }
  }

  const handleSubmitDua = async () => {
    const text = duaText.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/dua-wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await res.json()
      if (data.dua) {
        setDuas(prev => [{ ...data.dua, ameen_count: 0, user_has_ameened: false } as Dua, ...prev])
        setDuaText('')
        setShowSheet(false)
      } else {
        setError(data.error ?? 'Something went wrong')
      }
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--amina-soft-cream)]">
      {/* Header */}
      <div className="px-4 pt-14 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--amina-soft-charcoal)]">Du&apos;a Wall</h1>
          <p className="text-[var(--amina-soft-charcoal)] text-sm opacity-50 mt-1">
            Lift each other in prayer.
          </p>
        </div>
        <button
          onClick={() => setShowSheet(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-[var(--amina-shadow-button)]"
          style={{ background: 'var(--amina-primary-action)' }}
          aria-label="Make a Du'a"
        >
          <Plus size={22} strokeWidth={2} className="text-white" />
        </button>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'var(--amina-rose-selected)' }} />
          </div>
        ) : duas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-4xl">🤲</p>
            <p className="font-display italic text-xl text-[var(--amina-soft-charcoal)]">
              No du&apos;as yet
            </p>
            <p className="text-sm text-[var(--amina-soft-charcoal)] opacity-50 text-center max-w-xs">
              Be the first to lift your sisters in prayer.
            </p>
            <button
              onClick={() => setShowSheet(true)}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ background: 'var(--amina-primary-action)' }}
            >
              Make the first Du&apos;a
            </button>
          </div>
        ) : (
          <>
            {duas.map(dua => (
              <DuaCard
                key={dua.id}
                dua={dua}
                isOwn={currentUserId !== undefined}
                onToggleAmeen={handleToggleAmeen}
                onMarkFulfilled={handleMarkFulfilled}
              />
            ))}
            <div id="scroll-sentinel" className="h-4" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: 'var(--amina-rose-selected)' }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Du'a Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => { if (!submitting) { setShowSheet(false); setError('') } }}
          />
          {/* Sheet */}
          <div className="relative w-full bg-[var(--amina-soft-cream)] rounded-t-3xl p-6 pb-10 shadow-[var(--amina-shadow-nav)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display italic text-xl text-[var(--amina-soft-charcoal)]">
                Make a Du&apos;a
              </h2>
              <button
                onClick={() => { setShowSheet(false); setError('') }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--amina-warm-ivory)' }}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-sm text-[var(--amina-soft-charcoal)] opacity-50 mb-4">
              Your du&apos;a will be shared anonymously with the community.
            </p>

            <textarea
              value={duaText}
              onChange={e => setDuaText(e.target.value)}
              placeholder="Ya Allah..."
              rows={4}
              maxLength={280}
              className="w-full bg-[var(--amina-warm-ivory)] rounded-xl p-4 text-sm text-[var(--amina-soft-charcoal)] resize-none outline-none placeholder:opacity-40"
            />
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className={`text-xs ${duaText.length > 260 ? 'text-[#C9796A]' : 'text-[var(--amina-soft-charcoal)] opacity-40'}`}>
                {duaText.length}/280
              </span>
              {error && <span className="text-xs text-[#C9796A]">{error}</span>}
            </div>

            <button
              onClick={handleSubmitDua}
              disabled={!duaText.trim() || submitting}
              className="w-full py-3 rounded-full text-sm font-medium text-white disabled:opacity-40 transition-opacity"
              style={{ background: 'var(--amina-primary-action)' }}
            >
              {submitting ? 'Sharing...' : 'Share Du\'a 🤲'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
