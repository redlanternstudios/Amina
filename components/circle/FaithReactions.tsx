'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export const FAITH_REACTIONS = [
  { key: 'ameen', label: '🤲 Ameen', arabic: 'آمين' },
  { key: 'subhanallah', label: '🌙 SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { key: 'alhamdulillah', label: '🌿 Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { key: 'mashallah', label: '🌸 MashaAllah', arabic: 'مَا شَاءَ ٱللَّٰهُ' },
  { key: 'heart', label: '❤️ Heart', arabic: '' },
]

interface Reaction {
  id?: string
  user_id: string
  reaction: string
}

interface Props {
  targetId: string
  targetType: 'message' | 'post'
  existingReactions?: Reaction[]
  currentUserId?: string
}

export default function FaithReactions({targetId,targetType,existingReactions=[],currentUserId}: Props) {
  if (!currentUserId) return null

  const [reactions, setReactions] = useState<Reaction[]>(existingReactions)
  const supabase = createClient()

  const toggleReaction = useCallback(async (reactionKey: string) => {
    if (!currentUserId) return
    const existing = reactions.find(r => r.reaction === reactionKey && r.user_id === currentUserId)

    if (existing) {
      const { error } = await supabase.from('circle_reactions').delete()
        .eq('user_id', currentUserId).eq('target_id', targetId).eq('target_type', targetType).eq('reaction', reactionKey)
      if (!error) setReactions(prev => prev.filter(r => !(r.reaction === reactionKey && r.user_id === currentUserId)))
    } else {
      const { error } = await supabase.from('circle_reactions').insert({
        user_id: currentUserId, target_id: targetId, target_type: targetType, reaction: reactionKey,
      })
      if (!error) setReactions(prev => [...prev, { user_id: currentUserId!, reaction: reactionKey }])
    }
  }, [currentUserId, targetId, targetType, reactions, supabase])

  function countFor(key: string) { return reactions.filter(r => r.reaction === key).length }
  function hasReacted(key: string) { return reactions.some(r => r.reaction === key && r.user_id === currentUserId) }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {FAITH_REACTIONS.map(r => {
        const count = countFor(r.key)
        const reacted = hasReacted(r.key)
        return (
          <button key={r.key} onClick={() => toggleReaction(r.key)} disabled={!currentUserId}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${reacted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} disabled:opacity-50`}>
            {r.label} {count > 0 && <span className="ml-0.5 font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
