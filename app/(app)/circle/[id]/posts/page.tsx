'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import FaithReactions from '@/components/circle/FaithReactions'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface Post {
  id: string
  circle_id: string
  user_id: string
  content: string
  media_url: string | null
  created_at: string
  circle_profiles?: { display_name?: string; avatar_url?: string }
}

export default function CirclePostsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      }
    })
  }, [router, supabase])

  useEffect(() => {
    let mounted = true

    async function fetchPosts() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('circle_posts')
        .select('*, circle_profiles!user_id(display_name, avatar_url)')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        if (mounted) setError(fetchError.message)
      } else if (mounted) {
        setPosts((data || []) as Post[])
      }
      if (mounted) setLoading(false)
    }

    fetchPosts()
    return () => { mounted = false }
  }, [circleId, supabase])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
  }

  async function createPost(e: FormEvent) {
    e.preventDefault()
    if (!newPost.trim() && !imageFile) return
    setPosting(true)
    setError(null)

    try {
      let media_url: string | undefined

      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `circle-posts/${circleId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('circle-media')
          .upload(fileName, imageFile)

        if (uploadError) throw new Error(uploadError.message)

        const { data: { publicUrl } } = supabase.storage
          .from('circle-media')
          .getPublicUrl(fileName)

        media_url = publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('circle_posts')
        .insert({
          circle_id: circleId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: newPost.trim(),
          media_url: media_url ?? null,
        })
        .select('*, circle_profiles!user_id(display_name, avatar_url)')
        .single()

      if (insertError) throw insertError
      if (data) {
        setPosts(prev => [data as Post, ...prev])
        setNewPost('')
        clearImage()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  async function toggleLike(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('circle_reactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', postId)
      .eq('target_type', 'post')
      .eq('reaction', 'heart')
      .single()

    if (existing) {
      await supabase.from('circle_reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('circle_reactions').insert({
        user_id: user.id,
        target_id: postId,
        target_type: 'post',
        reaction: 'heart',
      })
    }

    // Refetch this post to get updated reaction count
    const { data } = await supabase
      .from('circle_posts')
      .select('*, circle_profiles!user_id(display_name, avatar_url)')
      .eq('id', postId)
      .single()

    if (data) setPosts(prev => prev.map(p => p.id === postId ? data as Post : p))
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Loading posts…</p>
      </div>
    )
  }

  // ── Error state (no posts loaded) ──
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-red-500 text-lg font-medium">Could not load posts</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-emerald-600 underline hover:text-emerald-700"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* New Post Form */}
      <form onSubmit={createPost} className="space-y-3 rounded-lg border p-4">
        <textarea
          placeholder="Share something with the circle..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows={3}
          disabled={posting}
          className="w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
        />

        {imagePreview && (
          <div className="relative inline-block">
            <Image
              src={imagePreview}
              alt="Preview"
              width={200}
              height={160}
              className="rounded-md object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-muted-foreground hover:text-foreground">
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={posting}
            />
          </label>
          <button
            type="submit"
            disabled={posting || (!newPost.trim() && !imageFile)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      {/* Error inline */}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {/* Post List */}
      <div className="mt-8 space-y-6">
        {posts.length === 0 ? (
          <p className="pt-8 text-center text-muted-foreground">
            No posts yet. Be the first to share.
          </p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CircleAvatar
                  name={post.circle_profiles?.display_name || 'User'}
                  avatarUrl={post.circle_profiles?.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold">
                    {post.circle_profiles?.display_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm">{post.content}</p>
              {post.media_url && (
                <div className="mt-3 overflow-hidden rounded-md">
                  <Image
                    src={post.media_url}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="w-full object-cover"
                  />
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="text-xs text-gray-500 hover:text-red-500 mr-3"
                >
                  ❤️ {/* Like count would need a separate count query */}
                  <span className="ml-0.5">Like</span>
                </button>
                <FaithReactions targetId={post.id} targetType="post" currentUserId={undefined} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
