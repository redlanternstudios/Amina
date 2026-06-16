'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import FaithReactions from '@/components/circle/FaithReactions'

interface PostProfile {
  display_name?: string
  avatar_url?: string
}

interface Reaction {
  reaction: string
  user_id: string
}

interface Post {
  id: string
  circle_id: string
  user_id: string
  content: string
  created_at: string
  circle_profiles?: PostProfile
  circle_reactions?: Reaction[]
}

export default function CirclePostsPage() {
  const params = useParams()
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
  }, [])

  const loadPosts = useCallback(async () => {
    const id = params.id as string
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/circles/${id}/posts`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to load posts')
      }
      const data: Post[] = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { loadPosts() }, [loadPosts])

  async function createPost() {
    if (!newPost.trim() || submitting) return
    setSubmitting(true)
    try {
      const response = await fetch(`/api/circles/${params.id as string}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost.trim() }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create post')
      }
      const data: Post = await response.json()
      setPosts(prev => [data, ...prev])
      setNewPost('')
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="border rounded-lg p-3 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-charcoal/10" />
              <div className="h-3 bg-charcoal/10 rounded w-24" />
            </div>
            <div className="h-12 bg-charcoal/10 rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <span className="text-3xl mb-2" role="img" aria-hidden="true">⚠️</span>
        <p className="font-semibold text-red-600 text-sm">Failed to load posts</p>
        <p className="text-charcoal/50 text-xs mt-1 max-w-[260px]">{error}</p>
        <button onClick={loadPosts} className="mt-3 border border-rose-amina text-rose-amina text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80">Try again</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Post composer */}
      <div className="flex gap-2">
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Share something..."
          rows={2}
          className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <button
          onClick={createPost}
          disabled={!newPost.trim() || submitting}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm self-end disabled:opacity-50 hover:bg-emerald-600"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-3xl mb-2" role="img" aria-hidden="true">📝</span>
          <p className="text-charcoal/50 text-sm">No posts yet. Be the first!</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CircleAvatar
                name={post.circle_profiles?.display_name || 'User'}
                avatarUrl={post.circle_profiles?.avatar_url}
                size="sm"
              />
              <p className="text-sm font-medium">{post.circle_profiles?.display_name || 'User'}</p>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm mb-2 whitespace-pre-wrap">{post.content}</p>
            <FaithReactions
              targetId={post.id}
              targetType="post"
              existingReactions={post.circle_reactions || []}
              currentUserId={userId || undefined}
              compact
            />
          </div>
        ))
      )}
    </div>
  )
}
