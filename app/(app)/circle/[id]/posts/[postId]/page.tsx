'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import FaithReactions from '@/components/circle/FaithReactions'
import { CircleDetailSkeleton } from '@/components/circle/CircleDetailSkeleton'

interface Comment {
  id: string
  body: string
  is_deleted: boolean
  created_at: string
  author_id: string
  parent_comment_id: string | null
  author_profile: { display_handle: string | null; avatar_url: string | null } | null
  replies?: Comment[]
}

interface Post {
  id: string
  content: string
  author_id: string
  is_amina_post: boolean
  created_at: string
  comment_count: number
  reactions: { reaction: string; user_id: string }[]
  author_profile?: { display_handle: string | null; avatar_url: string | null }
}

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const circleId = params.id as string
  const postId = params.postId as string
  const supabase = createClient()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'circle_post_comments',
        filter: `post_id=eq.${postId}`,
      }, () => {
        loadComments(true)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId])

  const loadPost = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    const { data } = await supabase
      .from('circle_posts')
      .select(`
        *,
        author_profile:circle_profiles!author_id(display_handle, avatar_url),
        reactions:circle_reactions(reaction, user_id)
      `)
      .eq('id', postId)
      .single()

    if (data) setPost(data as unknown as Post)
    setLoading(false)
  }, [postId])

  const loadComments = useCallback(async (reset = false) => {
    if (reset) setNextCursor(null)

    const url = new URL(`/api/circles/${circleId}/posts/${postId}/comments`, window.location.origin)
    if (!reset && nextCursor) url.searchParams.set('cursor', nextCursor)
    url.searchParams.set('limit', '20')

    setLoadingMore(true)
    const res = await fetch(url.toString())
    if (res.ok) {
      const data = await res.json()
      if (reset) {
        setComments(data.comments)
      } else {
        setComments(prev => [...prev, ...data.comments])
      }
      setNextCursor(data.nextCursor)
    }
    setLoadingMore(false)
  }, [circleId, postId, nextCursor])

  useEffect(() => { loadPost(); loadComments(true) }, [loadPost, loadComments])

  const submitComment = async () => {
    if (!commentBody.trim() || submitting) return
    setSubmitting(true)
    const body = {
      body: commentBody.trim(),
      parentCommentId: replyTo?.id || undefined,
    }
    const res = await fetch(`/api/circles/${circleId}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setCommentBody('')
      setReplyTo(null)
      await loadComments(true)
    }
    setSubmitting(false)
  }

  const deleteComment = async (commentId: string) => {
    const res = await fetch(`/api/circles/${circleId}/posts/${postId}/comments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    if (res.ok) await loadComments(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitComment()
    }
  }

  if (loading) return <CircleDetailSkeleton />

  if (!post) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-charcoal/50">Post not found</p>
    </div>
  )

  const isAminaPost = post.is_amina_post || post.author_id === process.env.NEXT_PUBLIC_AMINA_SYSTEM_USER_ID

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 border-b border-charcoal/5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-charcoal">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="font-display text-sm italic">Back</span>
        </button>
      </header>

      {/* Post Card */}
      <article className={`mx-4 mt-4 rounded-2xl p-4 ${isAminaPost ? 'bg-ivory border-l-4 border-gold' : 'bg-ivory'}`}>
        {isAminaPost && (
          <span className="text-xs font-medium text-gold uppercase tracking-wide">✦ Amina</span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <CircleAvatar
            name={post.author_profile?.display_handle ?? 'A Sister'}
            size="sm"
          />
          <span className="text-xs font-medium text-charcoal">
            {post.author_profile?.display_handle ?? 'A Sister'}
          </span>
          <span className="text-xs text-charcoal/40">{timeAgo(post.created_at)}</span>
        </div>
        <p className={`mt-3 text-charcoal leading-relaxed ${isAminaPost ? 'font-display italic' : 'text-sm'}`}>
          {post.content}
        </p>
        <div className="mt-3">
          <FaithReactions
            targetId={post.id}
            targetType="post"
            circleId={circleId}
            existingReactions={post.reactions}
            currentUserId={currentUserId ?? undefined}
            compact={false}
          />
        </div>
      </article>

      {/* Comments Section */}
      <div className="flex-1 mx-4 mt-6">
        <h2 className="font-display text-lg text-charcoal mb-4">
          {post.comment_count > 0 ? `Comments (${post.comment_count})` : 'Reflections'}
        </h2>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-charcoal/40">No reflections yet. Be the first.</p>
          </div>
        )}

        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={setReplyTo}
              onDelete={deleteComment}
              replyTo={replyTo}
            />
          ))}
        </div>

        {nextCursor && (
          <button
            onClick={() => loadComments(false)}
            disabled={loadingMore}
            className="w-full py-3 text-sm text-charcoal/50 font-medium"
          >
            {loadingMore ? 'Loading...' : 'Load more reflections'}
          </button>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Comment Composer */}
      <div className="sticky bottom-0 bg-cream border-t border-charcoal/5 px-4 py-3">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-ivory rounded-xl">
            <p className="text-xs text-charcoal/50">
              Replying to <span className="font-medium text-charcoal/70">{replyTo.author_profile?.display_handle ?? 'A Sister'}</span>
            </p>
            <button onClick={() => setReplyTo(null)} className="text-xs text-charcoal/40">Cancel</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <CircleAvatar name={currentUserId ?? 'U'} size="sm" />
          <input
            type="text"
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a reflection..."
            className="flex-1 bg-ivory rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
            maxLength={1000}
          />
          <button
            onClick={submitComment}
            disabled={!commentBody.trim() || submitting}
            className="w-10 h-10 rounded-full bg-[#C9796A] flex items-center justify-center disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1.5 8L14.5 1.5L8 14.5L6.5 9.5L1.5 8Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function CommentCard({
  comment, currentUserId, onReply, onDelete, replyTo
}: {
  comment: Comment
  currentUserId: string | null
  onReply: (c: Comment | null) => void
  onDelete: (id: string) => void
  replyTo: Comment | null
}) {
  return (
    <article className="flex gap-3">
      <CircleAvatar name={comment.author_profile?.display_handle ?? 'A Sister'} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-charcoal">
          {comment.author_profile?.display_handle ?? 'A Sister'}
        </p>
        <p className="text-sm text-charcoal/80 mt-0.5">
          {comment.is_deleted ? '[removed]' : comment.body}
        </p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-charcoal/40">{timeAgo(comment.created_at)}</span>
          <button
            className="text-xs text-charcoal/40 hover:text-charcoal/70"
            onClick={() => onReply(replyTo?.id === comment.id ? null : comment)}
          >
            {replyTo?.id === comment.id ? 'Cancel' : 'Reply'}
          </button>
          {comment.author_id === currentUserId && !comment.is_deleted && (
            <button
              className="text-xs text-red-400/60"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </button>
          )}
        </div>
        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-4 pl-3 border-l border-charcoal/10 space-y-3">
            {comment.replies.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                replyTo={replyTo}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
