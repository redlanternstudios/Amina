'use client'

import { useState } from 'react'
import FaithReactions from './FaithReactions'

interface AminaSystemPostCardProps {
  post: {
    id: string
    content: string
    created_at: string
  }
  circleId?: string
  currentUserId?: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AminaSystemPostCard({ post, circleId, currentUserId }: AminaSystemPostCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'var(--amina-warm-ivory)',
        border: '1px solid var(--amina-hairline)',
        borderLeft: '3px solid var(--amina-muted-gold)',
      }}
    >
      {/* Label */}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--amina-muted-gold)]">
        ✦ From Amina
      </span>

      {/* Avatar + Meta */}
      <div className="flex items-center gap-2.5 mt-2 mb-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
          style={{ background: 'var(--amina-primary-action)', color: 'white' }}
        >
          A
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--amina-soft-charcoal)] leading-none">Amina</p>
          <p className="text-[11px] mt-0.5 text-[var(--amina-soft-charcoal)]/30">
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content in italic for spiritual tone */}
      <p className="font-display italic text-[14px] leading-relaxed text-[var(--amina-soft-charcoal)] mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Faith reactions — wired same as regular posts */}
      {currentUserId && circleId && (
        <FaithReactions
          targetId={post.id}
          targetType="post"
          circleId={circleId}
          existingReactions={[]}
          currentUserId={currentUserId}
          compact={true}
        />
      )}
    </div>
  )
}
