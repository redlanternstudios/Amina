'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from './CircleAvatar'
import type { Circle, CircleMember } from './types'

// ---------------------------------------------------------------------------
// Inner states: loading, loaded, error
// ---------------------------------------------------------------------------

interface LoadingViewProps {
  message?: string
}

function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex gap-1.5 mb-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-rose-300 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-charcoal/50 text-xs">{message}</p>
    </div>
  )
}

interface ErrorViewProps {
  message: string
  onClose: () => void
  onRetry?: () => void
}

function ErrorView({ message, onClose, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="text-3xl mb-2" role="img" aria-hidden="true">
        ⚠️
      </span>
      <p className="font-semibold text-red-600 text-sm mb-1">Something went wrong</p>
      <p className="text-charcoal/50 text-xs max-w-[240px]">{message}</p>
      <div className="flex gap-2 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="border border-rose-amina text-rose-amina text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80"
          >
            Try again
          </button>
        )}
        <button
          onClick={onClose}
          className="bg-charcoal/10 text-charcoal/60 text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// JoinCircleModal
// ---------------------------------------------------------------------------

interface JoinCircleModalProps {
  circleId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function JoinCircleModal({ circleId, open, onClose, onSuccess }: JoinCircleModalProps) {
  const [phase, setPhase] = useState<'loading' | 'confirm' | 'joining' | 'success' | 'error'>('loading')
  const [circle, setCircle] = useState<Circle | null>(null)
  const [members, setMembers] = useState<CircleMember[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')

  const loadCircleDetails = useCallback(async () => {
    setPhase('loading')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorMessage('Please sign in to join a circle.')
        setPhase('error')
        return
      }

      // Fetch circle info
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', circleId)
        .single()

      if (circleError || !circleData) {
        setErrorMessage(circleError?.message ?? 'Circle not found.')
        setPhase('error')
        return
      }

      setCircle(circleData)

      // Fetch member count / preview
      const { data: memberData } = await supabase
        .from('circle_memberships')
        .select('id, user_id, role, status, joined_at')
        .eq('circle_id', circleId)
        .eq('status', 'active')
        .limit(5)

      setMembers((memberData ?? []) as CircleMember[])
      setPhase('confirm')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load circle details.')
      setPhase('error')
    }
  }, [circleId])

  useEffect(() => {
    if (open) {
      loadCircleDetails()
    } else {
      // Reset state when modal closes
      setPhase('loading')
      setCircle(null)
      setMembers([])
      setErrorMessage('')
    }
  }, [open, loadCircleDetails])

  async function handleJoin() {
    setPhase('joining')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorMessage('Please sign in.')
        setPhase('error')
        return
      }

      const response = await fetch(`/api/circles/${circleId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error ?? 'Failed to join circle.')
        setPhase('error')
        return
      }

      setPhase('success')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1200)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please try again.')
      setPhase('error')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative bg-cream rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 pb-8 shadow-xl animate-slide-up">
        {/* Handle bar for mobile */}
        <div className="w-8 h-1 bg-charcoal/10 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-charcoal/5 text-charcoal/40 hover:text-charcoal/70 text-sm"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Phase: Loading */}
        {phase === 'loading' && <LoadingView message="Loading circle..." />}

        {/* Phase: Error */}
        {phase === 'error' && (
          <ErrorView message={errorMessage} onClose={onClose} onRetry={loadCircleDetails} />
        )}

        {/* Phase: Confirm */}
        {phase === 'confirm' && circle && (
          <div className="flex flex-col items-center text-center">
            <CircleAvatar name={circle.name} avatarUrl={circle.avatar_url} size="lg" />
            <h2 className="font-display text-lg text-charcoal mt-3">{circle.name}</h2>
            {circle.description && (
              <p className="text-charcoal/50 text-xs mt-1 max-w-[240px]">{circle.description}</p>
            )}

            <div className="flex items-center gap-3 mt-4 text-charcoal/40 text-xs">
              <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
              {circle.is_public && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Public</span>}
            </div>

            <button
              onClick={handleJoin}
              className="mt-6 w-full bg-rose-amina text-white text-sm font-semibold py-2.5 rounded-full active:opacity-80"
            >
              Join Circle
            </button>
            <button
              onClick={onClose}
              className="mt-2 text-charcoal/40 text-xs active:opacity-70"
            >
              Not now
            </button>
          </div>
        )}

        {/* Phase: Joining */}
        {phase === 'joining' && <LoadingView message="Joining circle..." />}

        {/* Phase: Success */}
        {phase === 'success' && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="text-4xl mb-2" role="img" aria-hidden="true">
              🎉
            </span>
            <p className="font-semibold text-emerald-600 text-sm">Joined successfully!</p>
            <p className="text-charcoal/50 text-xs mt-1">You're now a member of this circle.</p>
          </div>
        )}
      </div>
    </div>
  )
}
