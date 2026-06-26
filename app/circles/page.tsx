'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import { Spinner } from '@/components/ui/spinner'
import { Search, Plus, Users, ArrowLeft } from 'lucide-react'

interface Circle {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  is_public: boolean
  creator_id: string
  created_at: string
  member_count: number
  tags: string[] | null
}

export default function CirclesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Get current user
  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled) setCurrentUserId(user?.id ?? null)
    }

    loadUser()
    return () => { cancelled = true }
  }, [supabase])

  // Fetch circles
  const fetchCircles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/circles?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)

      setCircles(data.circles ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load circles')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    fetchCircles()
  }, [fetchCircles])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="font-display text-3xl text-charcoal">Circles</h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Discover and join circles in your community.
          </p>
        </div>

        <Link
          href="/circles/create"
          className="inline-flex items-center gap-2 rounded-full bg-rose-amina px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Circle
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search circles…"
          className="w-full rounded-xl border border-charcoal/10 bg-ivory py-2.5 pl-11 pr-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchCircles}
            className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && circles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="mb-4 h-12 w-12 text-charcoal/20" />
          <p className="text-lg font-medium text-charcoal/40">
            {debouncedSearch ? 'No circles match your search' : 'No circles yet'}
          </p>
          <p className="mt-1 text-sm text-charcoal/30">
            {debouncedSearch
              ? 'Try a different search term.'
              : 'Be the first to create a circle.'}
          </p>
        </div>
      )}

      {/* Circles grid */}
      {!loading && !error && circles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {circles.map((circle) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="group rounded-2xl border border-charcoal/10 bg-white p-5 transition-all hover:border-rose-amina/20 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <CircleAvatar
                  name={circle.name}
                  avatarUrl={circle.icon_url}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-charcoal group-hover:text-rose-amina transition-colors">
                    {circle.name}
                  </h3>
                  {circle.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-charcoal/50">
                      {circle.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-charcoal/40">
                    <Users className="h-3.5 w-3.5" />
                    <span>{circle.member_count ?? 0} member{(circle.member_count ?? 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
