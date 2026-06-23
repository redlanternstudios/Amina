'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ArrowUp, MoreHorizontal, MessageCircle } from 'lucide-react'
import FaithReactions from '@/components/circle/FaithReactions'
import AminaSystemPostCard from '@/components/circle/AminaSystemPostCard'
import ShareCard from '@/components/circle/ShareCard'

type Post = {
  id: string
  content: string
  is_anonymous: boolean
  display_handle: string
  is_mine: boolean
  created_at: string
  reactions?: Array<{ reaction: string; user_id: string }>
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
  return `${Math.floor(hrs / 24)}d ago`
}

function PostBubble({ post, userId, circleId, router }: { post: Post; userId?: string; circleId?: string; router: any }) {
  const [reactions, setReactions] = useState(post.reactions ?? [])
  const isAminaPost = post.display_handle === 'Amina'

  if (isAminaPost) {
    return (
      <AminaSystemPostCard post={post} circleId={circleId} currentUserId={userId} />
    )
  }

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-shadow hover:shadow-md"
      style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
      onClick={() => router.push('/circle/' + circleId + '/posts/' + post.id)}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
            style={{ background: 'var(--amina-rose-selected)', color: 'var(--amina-primary-action)' }}
          >
            {post.display_handle.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-charcoal leading-none">{post.display_handle}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(44,41,38,0.3)' }}>
              {timeLabel(post.created_at)}
            </p>
          </div>
        </div>
        <button aria-label="Post options" style={{ color: 'rgba(44,41,38,0.3)' }} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={17} strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-[14px] leading-relaxed text-charcoal mb-3 whitespace-pre-wrap">{post.content}</p>
      {userId && circleId && (
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <FaithReactions
            targetId={post.id}
            targetType="post"
            circleId={circleId}
            existingReactions={reactions}
            currentUserId={userId}
            compact={true}
          />
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); router.push('/circle/' + circleId + '/posts/' + post.id) }} className="flex items-center gap-1 text-xs" style={{ color: 'rgba(44,41,38,0.3)' }}>
              <MessageCircle size={14} strokeWidth={1.5} />
              <span>Reply</span>
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <ShareCard circleId={circleId} postId={post.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Read the Supabase JWT directly from the auth cookie blob. */
function getTokenFromCookie(): string {
  try {
    const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
    if (!match) return ''
    const blob = JSON.parse(decodeURIComponent(match[1]))
    return blob?.access_token ?? ''
  } catch {
    return ''
  }
}

export default function CircleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notMember, setNotMember] = useState(false)
  const [postText, setPostText] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  const authHeaders = useCallback(
    (): Record<string, string> => {
      const token = getTokenFromCookie()
      return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    },
    []
  )

  useEffect(() => {
    // Extract user ID from token
    try {
      const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
      if (match) {
        const blob = JSON.parse(decodeURIComponent(match[1]))
        setCurrentUserId(blob?.user?.id)
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetch(`/api/circles/${id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.error === 'Not a member' || d.error === 'Unauthorized') { setNotMember(true); return }
        setCircle(d.circle)
        setPosts(d.posts ?? [])
        setMemberCount(d.member_count ?? 0)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [loading, posts.length])



  async function handlePost() {
    const text = postText.trim()
    if (!text || sending) return
    setSending(true)
    setPostText('')
    try {
      const res = await fetch(`/api/circles/${id}/posts`, {
        method: 'POST',
        headers: authHeaders(),
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
        <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: 'var(--amina-rose-selected)' }} />
      </div>
    )
  }

  if (notMember) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-8 text-center" style={{ background: 'var(--amina-soft-cream)' }}>
        <p className="font-display italic text-[20px] text-charcoal mb-3">You are not a member of this circle.</p>
        <button onClick={() => router.push('/circle/join')} className="btn-primary">Join a circle</button>
      </div>
    )
  }

  if (!circle) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-8 text-center" style={{ background: 'var(--amina-soft-cream)' }}>
        <p className="font-display italic text-[20px] text-charcoal mb-3">Circle not found.</p>
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
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display italic text-[18px] text-charcoal leading-tight truncate">{circle.name}</p>
          <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.45)' }}>
            {memberCount} sister{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => router.push(`/circle/${id}/chat`)}
          aria-label="Circle chat"
          style={{ color: 'rgba(44,41,38,0.4)' }}
        >
          <MessageCircle size={20} strokeWidth={1.5} />
        </button>
        <button aria-label="Circle options" style={{ color: 'rgba(44,41,38,0.4)' }}>
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Pinned intention */}
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
        <p className="font-display italic text-[16px] text-charcoal leading-snug">{circle.intention}</p>
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
          posts.map(post => <PostBubble key={post.id} post={post} userId={currentUserId} circleId={id} router={router} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
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
