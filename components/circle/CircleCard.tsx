'use client'

import { useState } from 'react'
import CircleAvatar from './CircleAvatar'
import type { Circle, MyCircle } from './types'

interface CircleCardProps {
  circle: Circle | MyCircle
  variant?: 'member' | 'discover'
  onJoin?: (circleId: string) => void
  onClick?: (circleId: string) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function isMyCircle(c: Circle | MyCircle): c is MyCircle {
  return 'role' in c
}

export default function CircleCard({ circle, variant = 'member', onJoin, onClick }: CircleCardProps) {
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const unread = isMyCircle(circle) && circle.unread
  const lastMsgAt = isMyCircle(circle) ? circle.last_message_at : null

  async function handleJoin() {
    setJoining(true)
    try {
      await onJoin?.(circle.id)
      setJoined(true)
    } finally {
      setJoining(false)
    }
  }

  if (variant === 'discover') {
    return (
      <div className="bg-ivory rounded-2xl p-3.5 flex items-center gap-3">
        <CircleAvatar name={circle.name} avatarUrl={circle.avatar_url} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal text-sm truncate">{circle.name}</p>
          {circle.description && (
            <p className="text-charcoal/50 text-xs mt-0.5 truncate">{circle.description}</p>
          )}
        </div>
        <button
          onClick={handleJoin}
          disabled={joined || joining}
          className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
            joined
              ? 'bg-charcoal/10 text-charcoal/40'
              : 'bg-rose-amina text-white active:opacity-80'
          } disabled:opacity-60`}
        >
          {joining ? 'Joining...' : joined ? 'Requested' : 'Join'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => onClick?.(circle.id)}
      className="w-full bg-ivory rounded-2xl p-3.5 flex items-center gap-3 text-left active:opacity-80"
    >
      <div className="relative">
        <CircleAvatar name={circle.name} avatarUrl={circle.avatar_url} size="md" />
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-amina rounded-full border-2 border-cream" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-charcoal text-sm truncate flex items-center gap-2">
          {circle.name}
          {circle.is_public && (
            <span className="text-[10px] text-charcoal/30 font-normal">Public</span>
          )}
        </p>
        {circle.description && (
          <p className="text-charcoal/50 text-xs mt-0.5 truncate">{circle.description}</p>
        )}
        {lastMsgAt && (
          <p className="text-charcoal/30 text-xs mt-0.5">Last message {timeAgo(lastMsgAt)}</p>
        )}
      </div>
      <span className="text-charcoal/20 flex-shrink-0">›</span>
    </button>
  )
}
