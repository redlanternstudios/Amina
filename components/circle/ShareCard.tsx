'use client'

import { useState, useCallback } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

interface ShareCardProps {
  circleId: string
  postId: string
  postSnippet?: string
  triggerClassName?: string
}

export default function ShareCard({ circleId, postId, postSnippet, triggerClassName }: ShareCardProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/circles/${circleId}/posts/${postId}/share`)
      const data = await res.json()
      if (!data.share) return

      const { snippet, shareUrl } = data.share

      // Try native share API first (mobile)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'A reflection from The Circle',
            text: `"${snippet}" — A Sister from The Circle`,
            url: shareUrl,
          })
          return
        } catch {
          // User cancelled or desktop fallback
        }
      }

      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Final fallback: open share URL in new tab
        window.open(shareUrl, '_blank', 'noopener')
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [circleId, postId])

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={`flex items-center gap-1 text-xs text-[var(--amina-soft-charcoal)]/40 hover:text-[var(--amina-soft-charcoal)]/60 transition-colors ${triggerClassName ?? ''}`}
      aria-label="Share this post"
    >
      {copied ? (
        <>
          <Check size={14} strokeWidth={1.5} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Share2 size={14} strokeWidth={1.5} />
          <span>{loading ? '...' : 'Share'}</span>
        </>
      )}
    </button>
  )
}
