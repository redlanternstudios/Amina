'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface InviteMembersModalProps {
  circleId: string
  circleName: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface UserSearchResult {
  id: string
  display_name: string
  avatar_url?: string | null
}

type Phase = 'form' | 'searching' | 'submitting' | 'success' | 'error'

function LoadingDots({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex gap-1.5 mb-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
      {label && <p className="text-charcoal/50 text-xs">{label}</p>}
    </div>
  )
}

export default function InviteMembersModal({ circleId, circleName, open, onClose, onSuccess }: InviteMembersModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [selected, setSelected] = useState<UserSearchResult | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [errorMessage, setErrorMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setQuery('')
    setResults([])
    setSelected(null)
    setPhase('form')
    setErrorMessage('')
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Debounced user search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const supabase = createClient()
        // Search circle_profiles by display_name (case-insensitive)
        const { data } = await supabase
          .from('circle_profiles')
          .select('id, display_name, avatar_url')
          .ilike('display_name', `%${query.trim()}%`)
          .limit(10)

        setResults((data as UserSearchResult[]) || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleInvite() {
    if (!selected) return
    setPhase('submitting')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/circles/${circleId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selected.id }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error ?? 'Failed to send invite')
      }

      setPhase('success')
      setTimeout(() => {
        onSuccess?.()
        reset()
        onClose()
      }, 1200)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please try again.')
      setPhase('error')
    }
  }

  function handleClose() { reset(); onClose() }
  function handleRetry() { setPhase('form'); setErrorMessage('') }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-cream rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 pb-8 shadow-xl animate-slide-up">
        <div className="w-8 h-1 bg-charcoal/10 rounded-full mx-auto mb-4 sm:hidden" />
        <button onClick={handleClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-charcoal/5 text-charcoal/40 hover:text-charcoal/70 text-sm" aria-label="Close">✕</button>

        <div className="mb-5 text-center">
          <h2 className="font-display text-lg text-charcoal">Invite to Circle</h2>
          <p className="text-charcoal/50 text-xs mt-1">{circleName}</p>
        </div>

        {phase === 'form' && (
          <div className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 text-xs">Searching...</span>
              )}
            </div>

            {/* Search results */}
            {query.trim().length >= 2 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {results.length === 0 && !searching && (
                  <p className="text-center text-charcoal/30 text-xs py-4">No users found</p>
                )}
                {results.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelected(user)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                      selected?.id === user.id
                        ? 'bg-rose-50 border border-rose-200'
                        : 'hover:bg-charcoal/5 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-rose-500 font-medium">{user.display_name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <span className="text-sm text-charcoal font-medium">{user.display_name}</span>
                    {selected?.id === user.id && <span className="ml-auto text-rose-500 text-xs">Selected</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Selected user summary + action */}
            {selected && (
              <div className="bg-ivory rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm flex-shrink-0">
                  {selected.avatar_url ? (
                    <img src={selected.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-rose-500 font-medium">{selected.display_name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{selected.display_name}</p>
                  <p className="text-xs text-charcoal/40">Will receive an invite notification</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-charcoal/30 hover:text-charcoal/60 text-sm">✕</button>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleClose} className="flex-1 rounded-full border border-charcoal/10 px-4 py-2.5 text-sm font-medium text-charcoal/60 active:opacity-80">Cancel</button>
              <button onClick={handleInvite} disabled={!selected} className="flex-1 rounded-full bg-rose-amina px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:opacity-80">Send Invite</button>
            </div>
          </div>
        )}

        {phase === 'submitting' && <LoadingDots label="Sending invite..." />}

        {phase === 'success' && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="text-4xl mb-2" role="img" aria-hidden="true">✨</span>
            <p className="font-semibold text-emerald-600 text-sm">Invite sent!</p>
            <p className="text-charcoal/50 text-xs mt-1">They'll see the invite when they log in.</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="text-3xl mb-2" role="img" aria-hidden="true">⚠️</span>
            <p className="font-semibold text-red-600 text-sm mb-1">Failed to send invite</p>
            <p className="text-charcoal/50 text-xs max-w-[260px]">{errorMessage}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={handleRetry} className="border border-rose-amina text-rose-amina text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80">Try again</button>
              <button onClick={handleClose} className="bg-charcoal/10 text-charcoal/60 text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
