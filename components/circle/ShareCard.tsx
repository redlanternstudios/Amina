'use client'

import { useState } from 'react'

interface ShareCardProps {
  circleId: string
  postId: string
  postContent: string
  className?: string
}

export default function ShareCard({ circleId, postId, postContent, className = '' }: ShareCardProps) {
  const [generating, setGenerating] = useState(false)

  const snippet = postContent?.replace(/\s+/g, ' ').trim().slice(0, 120) ?? ''
  const maskedSnippet = snippet.length >= 120 ? snippet + '...' : snippet

  const handleShare = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/circles/${circleId}/posts/${postId}/share`)
      if (!res.ok) { setGenerating(false); return }
      const data = await res.json()

      // Try native share API first
      if (navigator.share && navigator.canShare) {
        // Create a canvas share card
        const cardHtml = `
          <div style="
            background: #F7F2EB;
            padding: 32px;
            border-radius: 16px;
            font-family: 'Inter', sans-serif;
            max-width: 340px;
          ">
            <div style="margin-bottom: 16px;">
              <span style="font-family: 'Canela', 'Newsreader', serif; font-style: italic; font-size: 11px; color: #D7BA82; text-transform: uppercase; letter-spacing: 1px;">✦ Amina</span>
            </div>
            <p style="
              font-family: 'Canela', 'Newsreader', serif;
              font-style: italic;
              font-size: 16px;
              color: #2C2926;
              line-height: 1.6;
              margin: 0 0 16px 0;
            ">"${maskedSnippet}"</p>
            <p style="
              font-size: 12px;
              color: #2C2926;
              opacity: 0.5;
              margin: 0 0 4px 0;
            ">— ${data.attribution}</p>
            <div style="height: 2px; background: #D7BA82; width: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; color: #2C2926; opacity: 0.3;">amina.app</p>
          </div>
        `

        const blob = new Blob([cardHtml], { type: 'text/html' })
        const file = new File([blob], 'reflection.html', { type: 'text/html' })

        await navigator.share({
          title: 'A reflection from The Circle',
          text: maskedSnippet,
          files: [file],
        }).catch(() => {
          // Fallback: share text only
          navigator.share({
            title: 'A reflection from The Circle',
            text: `"${maskedSnippet}" — ${data.attribution}`,
          })
        })
      } else {
        // Desktop fallback: copy link
        await navigator.clipboard.writeText(data.shareUrl)
        alert('Share link copied!')
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
    setGenerating(false)
  }

  return (
    <button
      onClick={handleShare}
      disabled={generating}
      className={`flex items-center gap-1.5 text-xs text-charcoal/50 font-medium disabled:opacity-40 ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10 4.5L6.5 2V5.5C3 5.5 1.5 7 1.5 10C2.5 8.5 4 8 6.5 8V11.5L10 9L13 6.75L10 4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
      <span>{generating ? '...' : 'Share'}</span>
    </button>
  )
}
