'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ArrowUp } from 'lucide-react'
import FaithReactions from '@/components/circle/FaithReactions'
import CircleAvatar from '@/components/circle/CircleAvatar'

type Comment = {
  id: string
  postId: string
  circleId: string
  authorId: string
  parentCommentId: string | null
  body: string
  isDeleted: boolean
  displayHandle: string
  createdAt: string
  isOwn: boolean
  replies: Comment[]
}

type PostDetail = {
  id: string
  content: string
  is_anonymous: boolean
  display_handle: string
  is_mine: boolean
  created_at: string
  reactions?: Array<{ reaction: string; user_id: string }>
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

function CommentCard({ comment, currentUserId, onReply, onDelete, depth = 0 }: {
  comment: Comment
  currentUserId?: string
  onReply: (id: string, handle: string) => void
  onDelete: (id: string) => void
  depth?: number
}) {
  return (
    <div className={`${depth > 0 ? 'ml-4 pl-3 border-l-2 border-[var(--amina-hairline)]' : ''}`}>
      <article className={`flex gap-3 ${depth > 0 ? 'py-2' : 'py-3'}`}>
        <CircleAvatar name={comment.displayHandle} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--amina-soft-charcoal)]">
            {comment.displayHandle}
          </p>
          <p className="text-sm text-[var(--amina-soft-charcoal)]/80 mt-0.5 whitespace-pre-wrap">
            {comment.body}
          </p>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-[var(--amina-soft-charcoal)]/40">{timeAgo(comment.createdAt)}</span>
            {!comment.isDeleted && (
              <button className="text-xs text-[var(--amina-soft-charcoal)]/40 hover:text-[var(--amina-soft-charcoal)]/60" onClick={() => onReply(comment.id, comment.displayHandle)}>Reply</button>
            )}
            {comment.isOwn && (
              <button className="text-xs text-red-400/60 hover:text-red-400" onClick={() => onDelete(comment.id)}>Delete</button>
            )}
          </div>
          {comment.replies?.map(reply => (
            <CommentCard key={reply.id} comment={reply} currentUserId={currentUserId} onReply={onReply} onDelete={onDelete} depth={1} />
          ))}
        </div>
      </article>
    </div>
  )
}

export default function PostDetailPage() {
  const { id: circleId, postId } = useParams<{ id: string; postId: string }>()
  const router = useRouter()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [circle, setCircle] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; handle: string } | null>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
      if (match) {
        const blob = JSON.parse(decodeURIComponent(match[1]))
        setCurrentUserId(blob?.user?.id)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetch(`/api/circles/${circleId}`, { headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(d => {
        if (d.circle) setCircle(d.circle)
        const found = (d.posts ?? []).find((p: PostDetail) => p.id === postId)
        if (found) setPost(found)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [circleId, postId])

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/circles/${circleId}/posts/${postId}/comments?limit=20`)
    return res.json()
  }, [circleId, postId])

  useEffect(() => {
    if (!circleId || !postId) return
    fetchComments().then(data => {
      setComments(data.comments ?? [])
      setLoadingComments(false)
    })
  }, [circleId, postId, fetchComments])

  const handleSendComment = async () => {
    const text = commentText.trim()
    if (!text || sending) return
    setSending(true)
    const body: any = { body: text }
    if (replyTo) body.parentCommentId = replyTo.id
    try {
      const res = await fetch(`/api/circles/${circleId}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.comment) {
        if (data.comment.parentCommentId) {
          setComments(prev => prev.map(c => c.id === data.comment.parentCommentId ? { ...c, replies: [...c.replies, data.comment] } : c))
        } else {
          setComments(prev => [data.comment, ...prev])
        }
        setCommentText('')
        setReplyTo(null)
      }
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/circles/${circleId}/posts/${postId}/comments/${commentId}`, { method: 'PATCH' })
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, body: '[removed]', isDeleted: true } : c))
    } catch { /* ignore */ }
  }

  const handleReply = (id: string, handle: string) => {
    setReplyTo({ id, handle })
    setTimeout(() => composerRef.current?.focus(), 100)
  }

  if (loading) {
    return <div className="flex flex-col min-h-dvh items-center justify-center bg-[var(--amina-soft-cream)]"><div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'var(--amina-rose-selected)' }} /></div>
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center bg-[var(--amina-soft-cream)] px-8 text-center">
        <p className="font-display italic text-lg text-[var(--amina-soft-charcoal)] mb-3">Post not found</p>
        <button onClick={() => router.back()} className="btn-primary">Go back</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--amina-soft-cream)]">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0 border-b border-[var(--amina-hairline)]">
        <button onClick={() => router.back()} aria-label="Back" className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}>
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
        <p className="font-display italic text-lg text-[var(--amina-soft-charcoal)] flex-1 truncate">{circle?.name ?? 'Post'}</p>
      </div>

      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-[var(--amina-hairline)]">
        <div className="rounded-2xl p-4" style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0" style={{ background: 'var(--amina-rose-selected)', color: 'var(--amina-primary-action)' }}>
                {post.display_handle.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--amina-soft-charcoal)] leading-none">{post.display_handle}</p>
                <p className="text-[11px] mt-0.5 text-[var(--amina-soft-charcoal)]/30">{timeAgo(post.created_at)}</p>
              </div>
            </div>
          </div>
          <p className="text-[14px] leading-relaxed text-[var(--amina-soft-charcoal)] mb-3 whitespace-pre-wrap">{post.content}</p>
          {currentUserId && (
            <FaithReactions targetId={post.id} targetType="post" circleId={circleId} existingReactions={post.reactions} currentUserId={currentUserId} compact={true} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-xs font-semibold text-[var(--amina-soft-charcoal)]/50 uppercase tracking-wider mb-2 mt-2">Comments ({comments.length})</p>
        {loadingComments ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-pulse" style={{ background: 'var(--amina-rose-selected)' }} /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12"><p className="text-sm text-[var(--amina-soft-charcoal)]/50">No reflections yet. Be the first to respond.</p></div>
        ) : (
          <div className="divide-y divide-[var(--amina-hairline)]">
            {comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} currentUserId={currentUserId} onReply={handleReply} onDelete={handleDeleteComment} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] border-t border-[var(--amina-hairline)]" style={{ background: 'var(--amina-soft-cream)' }}>
        {replyTo && (
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-xs text-[var(--amina-soft-charcoal)]/50">Replying to <span className="font-medium">{replyTo.handle}</span></p>
            <button onClick={() => setReplyTo(null)} className="text-xs text-[var(--amina-primary-action)]">Cancel</button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-3xl px-4 py-2" style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}>
          <textarea ref={composerRef} value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }} rows={1} placeholder={replyTo ? 'Write a reply...' : 'Add a reflection...'} className="flex-1 resize-none bg-transparent outline-none text-[15px] text-[var(--amina-soft-charcoal)] placeholder:text-[var(--amina-soft-charcoal)]/38 max-h-28 py-1.5 leading-relaxed" />
          <button onClick={handleSendComment} disabled={!commentText.trim() || sending} aria-label="Send comment" className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40" style={{ background: 'var(--amina-primary-action)' }}>
            <ArrowUp size={18} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
