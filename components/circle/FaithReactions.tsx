'use client'

import { useState, useCallback, useEffect } from 'react'

const FAITH_REACTIONS = [
  { key: 'ameen', emoji: '🥲', label: 'Ameen', arabic: 'آمين' },
  { key: 'subhanallah', emoji: '🌙', label: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّهِ' },
  { key: 'alhamdulillah', emoji: '🌿', label: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّهِ' },
  { key: 'mashallah', emoji: '🌸', label: 'MashaAllah', arabic: 'مَا شَاءَ ٱللَّهُ' },
  { key: 'heart', emoji: '❤️', label: 'Heart', arabic: '' },
]

interface ExistingReaction {
  reaction: string
  user_id: string
}

interface Props {
  targetId: string
  targetType: 'message' | 'post'
  circleId?: string
  existingReactions?: ExistingReaction[]
  currentUserId?: string
  compact?: boolean
}

export default function FaithReactions({
  targetId,
  targetType,
  circleId,
  existingReactions = [],
  currentUserId,
  compact = true,
}: Props) {
  const [reactions, setReactions] = useState<ExistingReaction[]>(existingReactions)

  // Sync when existingReactions changes (e.g., on page load)
  useEffect(() => {
    setReactions(existingReactions)
  }, [existingReactions])

  const toggleReaction = useCallback(async (key: string) => {
    if (!targetId || !currentUserId) return

    const existing = reactions.find(r => r.reaction === key && r.user_id === currentUserId)
    // Use /api/circles/:circleId/reactions (with 's') — no legacy /api/reactions fallback
    if (!circleId) return
    const apiEndpoint = `/api/circles/${circleId}/reactions`

    if (existing) {
      // Optimistic remove
      setReactions(prev => prev.filter(r => !(r.reaction === key && r.user_id === currentUserId)))
      try {
        const res = await fetch(apiEndpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: targetId, target_id: targetId, target_type: targetType, reaction: key }),
        })
        if (!res.ok) {
          // Rollback on failure
          setReactions(prev => [...prev, { reaction: key, user_id: currentUserId }])
        }
      } catch {
        // Rollback on failure
        setReactions(prev => [...prev, { reaction: key, user_id: currentUserId }])
      }
    } else {
      // Optimistic add
      setReactions(prev => [...prev, { reaction: key, user_id: currentUserId }])
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: targetId, target_id: targetId, target_type: targetType, reaction: key }),
        })
        if (!res.ok) {
          // Rollback on failure
          setReactions(prev => prev.filter(r => !(r.reaction === key && r.user_id === currentUserId)))
        }
      } catch {
        // Rollback on failure
        setReactions(prev => prev.filter(r => !(r.reaction === key && r.user_id === currentUserId)))
      }
    }
  }, [targetId, targetType, circleId, currentUserId, reactions])

  if (!currentUserId) return null

  const countFor = (key: string) => reactions.filter(r => r.reaction === key).length
  const hasReacted = (key: string) => currentUserId ? reactions.some(r => r.reaction === key && r.user_id === currentUserId) : false

  return (
    <div className="flex flex-wrap gap-1 mt-1.5" role="group" aria-label="Reactions">
      {FAITH_REACTIONS.map(r => {
        const count = countFor(r.key)
        const active = hasReacted(r.key)

        // Compact mode: always show all 5 reactions (emoji + count if > 0)
        if (compact) {
          return (
            <button
              key={r.key}
              onClick={() => toggleReaction(r.key)}
              className={`text-xs px-1.5 py-0.5 rounded-full transition-colors flex items-center gap-0.5 ${
                active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={r.label}
              aria-label={`${r.emoji} ${r.label}${count > 0 ? ` (${count})` : ''}`}
            >
              <span>{r.emoji}</span>
              {count > 0 && <span className="text-[11px] font-medium ml-0.5">{count}</span>}
            </button>
          )
        }

        // Standard mode — hide when count=0 (backward compatible)
        if (count === 0) return null

        return (
          <button
            key={r.key}
            onClick={() => toggleReaction(r.key)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {r.emoji} {r.label} <span className="ml-0.5 font-medium">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
