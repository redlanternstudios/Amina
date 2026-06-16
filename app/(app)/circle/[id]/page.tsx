'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Heart, ArrowUp, MoreHorizontal } from 'lucide-react'

type Post = {
  id: string
  content: string
  is_anonymous: boolean
  display_handle: string
  has_reacted: boolean
  is_mine: boolean
  created_at: string
}

type Circle = {
  id: string
  name: string
  intention: string
  topic_tag: string
  invite_code: string
}

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function PostBubble({
  post,
  onReact,
}: {
  post: Post
  onReact: (id: string) => void
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--amina-warm-ivory)',
        border: '1px solid var(--amina-hairline)',
      }}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
            style={{
              background: 'var(--amina-rose-selected)',
              color: 'var(--amina-primary-action)',
              boxShadow: '0 0 0 2px var(--amina-primary-action)',
            }}
          >
            S
          </div>
          <div>
            <p className="text-[13px] font-semibold text-charcoal leading-none">
              {post.display_handle}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(44,41,38,0.3)' }}>
              {timeLabel(post.created_at)}
            </p>
          </div>
        </div>
        <button aria-label="Post options" style={{ color: 'rgba(44,41,38,0.3)' }}>
          <MoreHorizontal size={17} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <p className="text-[14px] leading-relaxed text-charcoal mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Heart — no count ever */}
      <div className="flex justify-end">
        <button
          onClick={() => onReact(post.id)}
          aria-label={post.has_reacted ? 'Remove reaction' : 'React with heart'}
          className="p-1.5 rounded-full transition-all active:scale-90"
          style={{ color: post.has_reacted ? 'var(--amina-primary-action)' : 'rgba(44,41,38,0.3)' }}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={post.has_reacted ? 'currentColor' : 'none'}
          />
        </button>
      </div>
    </div>
  )
}

export default function CircleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [postText, setPostText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/circles/${id}`)
      .then(r => r.json())
      .then(d => {
        setCircle(d.circle)
        setPosts(d.posts ?? [])
        setMemberCount(d.member_count ?? 0)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [loading, posts.length])

  async function handleReact(postId: string) {
    // Optimistic toggle
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, has_reacted: !p.has_reacted } : p)
    )
    await fetch(`/api/circles/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    })
  }

  async function handlePost() {
    const text = postText.trim()
    if (!text || sending) return
    setSending(true)
    setPostText('')
    try {
      const res = await fetch(`/api/circles/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, is_anonymous: true }),
      })
      const data = await res.json()
      if (data.post) {
        setPosts(prev => [...prev, data.post])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center" style={{ background: 'var(--amina-soft-cream)' }}>
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{ background: 'var(--amina-rose-selected)' }}
        />
      </div>
    )
  }

  if (!circle) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-8 text-center" style={{ background: 'var(--amina-soft-cream)' }}>
        <p className="font-display italic text-[20px] text-charcoal mb-3">You are not a member of this circle.</p>
        <button onClick={() => router.push('/circle')} className="btn-primary">Back to circles</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--amina-hairline)' }}
      >
        <button
          onClick={() => router.push('/circle')}
          aria-label="Back to circles"
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display italic text-[18px] text-charcoal leading-tight truncate">
            {circle.name}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.45)' }}>
            {memberCount} sister{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button aria-label="Circle options" style={{ color: 'rgba(44,41,38,0.4)' }}>
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Pinned intention — always visible */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: 'rgba(215,186,130,0.15)',
          borderLeft: '3px solid var(--amina-muted-gold)',
          borderBottom: '1px solid var(--amina-hairline)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(44,41,38,0.4)' }}>
          Our Intention
        </p>
        <p className="font-display italic text-[16px] text-charcoal leading-snug">
          {circle.intention}
        </p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-display italic text-[18px] text-charcoal mb-2">Be the first to share, sister.</p>
            <p className="text-[14px]" style={{ color: 'rgba(44,41,38,0.5)' }}>
              This circle is waiting for its first words.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostBubble key={post.id} post={post} onReact={handleReact} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer — sticky bottom */}
      <div
        className="flex-shrink-0 px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        style={{ borderTop: '1px solid var(--amina-hairline)', background: 'var(--amina-soft-cream)' }}
      >
        <div
          className="flex items-end gap-2 rounded-3xl px-4 py-2"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <textarea
            value={postText}
            onChange={e => setPostText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
            rows={1}
            placeholder="Share with the sisters..."
            className="flex-1 resize-none bg-transparent outline-none text-[15px] text-charcoal placeholder:text-[rgba(44,41,38,0.38)] max-h-28 py-1.5 leading-relaxed"
          />
          <button
            onClick={handlePost}
            disabled={!postText.trim() || sending}
            aria-label="Post"
            className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ background: 'var(--amina-primary-action)' }}
          >
            <ArrowUp size={18} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
