'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const FAITH_REACTIONS = [
  { key: 'ameen', label: '🤲 Ameen', arabic: 'آمين' },
  { key: 'subhanallah', label: '🌙 SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { key: 'alhamdulillah', label: '🌿 Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { key: 'allahuakbar', label: '📿 Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ' },
  { key: 'bismillah', label: '✨ Bismillah', arabic: 'بِسْمِ ٱللَّٰهِ' },
  { key: 'mashallah', label: '🌸 MashaAllah', arabic: 'مَا شَاءَ ٱللَّٰهُ' },
]

interface Props {
  /** @deprecated Use targetId + targetType instead */
  messageId?: string
  /** @deprecated Use targetId + targetType instead */
  postId?: string
  targetId?: string
  targetType?: 'message' | 'post'
  existingReactions?: { reaction_type: string; user_id: string }[]
  currentUserId?: string
}

export default function FaithReactions({
  messageId,
  postId,
  targetId,
  targetType,
  existingReactions = [],
  currentUserId,
}: Props) {
  // Return null if no target is specified
  const hasTarget = !!(messageId || postId || targetId)
  if (!hasTarget) return null

  const [reactions, setReactions] = useState(existingReactions)
  const supabase = createClient()

  // Resolve the actual target identifier from either new or legacy props
  const resolvedMessageId = targetType === 'message' ? targetId : messageId
  const resolvedPostId = targetType === 'post' ? targetId : postId

  async function toggleReaction(key: string) {
    if (!currentUserId) return

    const existing = reactions.find(r => r.reaction_type === key && r.user_id === currentUserId)
    if (existing) {
      const deleteFilter: Record<string, string> = { reaction_type: key, user_id: currentUserId }
      if (resolvedMessageId) deleteFilter.message_id = resolvedMessageId
      if (resolvedPostId) deleteFilter.post_id = resolvedPostId

      await supabase.from('circle_message_reactions').delete().match(deleteFilter)
      setReactions(prev => prev.filter(r => !(r.reaction_type === key && r.user_id === currentUserId)))
    } else {
      const insertPayload: Record<string, any> = { reaction_type: key, user_id: currentUserId }
      if (resolvedMessageId) insertPayload.message_id = resolvedMessageId
      if (resolvedPostId) insertPayload.post_id = resolvedPostId

      await supabase.from('circle_message_reactions').insert(insertPayload)
      setReactions(prev => [...prev, { reaction_type: key, user_id: currentUserId! }])
    }
  }

  function countFor(key: string) {
    return reactions.filter(r => r.reaction_type === key).length
  }

  function hasReacted(key: string) {
    return currentUserId ? reactions.some(r => r.reaction_type === key && r.user_id === currentUserId) : false
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {FAITH_REACTIONS.map(r => {
        const count = countFor(r.key)
        const reacted = hasReacted(r.key)
        if (count === 0 && !reacted && r.key !== 'ameen') return null
        return (
          <button
            key={r.key}
            onClick={() => toggleReaction(r.key)}
            disabled={!currentUserId}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              reacted
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {r.label} {count > 0 && <span className="ml-0.5 font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
