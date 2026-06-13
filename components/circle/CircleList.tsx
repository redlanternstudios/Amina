'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CircleCard from './CircleCard'
import type { Circle, MyCircle } from './types'

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="space-y-2.5" aria-label="Loading circles">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-ivory rounded-2xl p-3.5 flex items-center gap-3 animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-charcoal/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-charcoal/10 rounded w-1/3" />
            <div className="h-2.5 bg-charcoal/10 rounded w-2/3" />
          </div>
          <div className="h-6 w-16 bg-charcoal/10 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string
  title: string
  body: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-3xl mb-2" role="img" aria-hidden="true">
        {icon}
      </span>
      <p className="font-semibold text-charcoal text-sm">{title}</p>
      <p className="text-charcoal/50 text-xs mt-1 max-w-[220px]">{body}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 bg-rose-amina text-white text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80"
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-3xl mb-2" role="img" aria-hidden="true">
        ⚠️
      </span>
      <p className="font-semibold text-red-600 text-sm">Failed to load circles</p>
      <p className="text-charcoal/50 text-xs mt-1 max-w-[260px]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 border border-rose-amina text-rose-amina text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80"
        >
          Try again
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CircleList — main component
// ---------------------------------------------------------------------------

type ListMode = 'my' | 'discover'

interface CircleListProps {
  mode: ListMode
  onCircleClick?: (circleId: string) => void
  onJoin?: (circleId: string) => void
  onJoinSuccess?: (circleId: string) => void
  emptyIcon?: string
  emptyTitle?: string
  emptyBody?: string
  emptyAction?: string
  onEmptyAction?: () => void
}

export default function CircleList({
  mode,
  onCircleClick,
  onJoin,
  onJoinSuccess,
  emptyIcon = '🌸',
  emptyTitle = 'No circles yet',
  emptyBody = 'Circles will appear here.',
  emptyAction,
  onEmptyAction,
}: CircleListProps) {
  const [circles, setCircles] = useState<(Circle | MyCircle)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCircles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please sign in to view circles.')
        return
      }

      if (mode === 'discover') {
        // Fetch my circle IDs first to exclude them
        const { data: memberships } = await supabase
          .from('circle_memberships')
          .select('circle_id')
          .eq('user_id', user.id)
          .eq('status', 'active')

        const joinedIds = memberships?.map((m) => m.circle_id) ?? []

        let query = supabase
          .from('circles')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20)

        if (joinedIds.length > 0) {
          query = query.not('id', 'in', `(${joinedIds.join(',')})`)
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setCircles((data as Circle[]) ?? [])
      } else {
        // My circles
        const { data: memberships, error: membershipError } = await supabase
          .from('circle_memberships')
          .select(
            `role, joined_at, circles!inner(id, name, description, avatar_url, is_public, creator_id, created_at)`
          )
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('joined_at', { ascending: false })
          .limit(10)

        if (membershipError) {
          setError(membershipError.message)
          return
        }

        const mapped: MyCircle[] = (memberships ?? []).map((m: any) => ({
          id: m.circles.id,
          name: m.circles.name,
          description: m.circles.description,
          avatar_url: m.circles.avatar_url,
          is_public: m.circles.is_public,
          creator_id: m.circles.creator_id,
          created_at: m.circles.created_at,
          role: m.role,
          last_message_at: m.joined_at ?? null,
          unread: false,
        }))

        setCircles(mapped)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    fetchCircles()
  }, [fetchCircles])

  // --- Loading ---
  if (loading) return <LoadingSkeleton />

  // --- Error ---
  if (error) return <ErrorState message={error} onRetry={fetchCircles} />

  // --- Empty ---
  if (circles.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        body={emptyBody}
        action={emptyAction}
        onAction={onEmptyAction}
      />
    )
  }

  // --- Data ---
  async function handleJoin(circleId: string) {
    try {
      await onJoin?.(circleId)
      onJoinSuccess?.(circleId)
    } catch {
      // Parent handles error
    }
  }

  return (
    <div className="space-y-2.5" role="list" aria-label={`${mode === 'my' ? 'My' : 'Discover'} circles`}>
      {circles.map((circle) => (
        <div key={circle.id} role="listitem">
          <CircleCard
            circle={circle}
            variant={mode === 'discover' ? 'discover' : 'member'}
            onJoin={handleJoin}
            onClick={onCircleClick}
          />
        </div>
      ))}
    </div>
  )
}
