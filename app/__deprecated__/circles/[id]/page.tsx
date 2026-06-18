'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import CircleDetailSkeleton from '@/components/circle/CircleDetailSkeleton'
import FaithReactions from '@/components/circle/FaithReactions'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, MessageCircle, FileText, Users, Send, Plus, X } from 'lucide-react'

type Tab = 'posts' | 'messages' | 'members'

interface CircleData {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  is_public: boolean
  creator_id: string
  member_count: number
  created_at: string
}

interface Member {
  id: string
  user_id: string
  role: string
  display_name: string | null
  avatar_url: string | null
}

interface Post {
  id: string
  circle_id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  user_email?: string
  user_name?: string
}

interface Message {
  id: string
  circle_id: string
  user_id: string
  content: string
  created_at: string
  user_email?: string
  user_name?: string
}

export default function CircleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string

  const [circle, setCircle] = useState<CircleData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Post form state
  const [showPostForm, setShowPostForm] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)

  // Message form state
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Fetch circle + members
  useEffect(() => {
    let cancelled = false

    async function loadCircle() {
      setLoading(true)
      setError(null)

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!cancelled) setCurrentUserId(user?.id ?? null)

        // Fetch circle details via API
        const res = await fetch(`/api/circles/${circleId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
        if (cancelled) return

        setCircle(data.circle)

        // Fetch members
        const { data: memberData, error: memberError } = await supabase
          .from('circle_memberships')
          .select(`
            id,
            user_id,
            role,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('circle_id', circleId)

        if (!memberError && memberData) {
          const mapped: Member[] = memberData.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role,
            display_name: m.profiles?.display_name ?? null,
            avatar_url: m.profiles?.avatar_url ?? null,
          }))
          if (!cancelled) setMembers(mapped)

          // Check current user's role
          const currentMember = mapped.find((m) => m.user_id === user?.id)
          if (!cancelled) setUserRole(currentMember?.role ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load circle')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCircle()
    return () => { cancelled = true }
  }, [circleId, supabase])

  // Fetch posts
  useEffect(() => {
    if (activeTab !== 'posts') return
    let cancelled = false

    async function loadPosts() {
      try {
        const { data, error: postsError } = await supabase
          .from('circle_posts')
          .select('*')
          .eq('circle_id', circleId)
          .order('created_at', { ascending: false })

        if (!postsError && data && !cancelled) {
          setPosts(data as Post[])
        }
      } catch {
        // Silently handle - posts are secondary content
      }
    }

    loadPosts()
    return () => { cancelled = true }
  }, [activeTab, circleId, supabase])

  // Fetch messages
  useEffect(() => {
    if (activeTab !== 'messages') return
    let cancelled = false

    async function loadMessages() {
      try {
        const { data, error: msgError } = await supabase
          .from('circle_chat_messages')
          .select('*')
          .eq('circle_id', circleId)
          .order('created_at', { ascending: true })

        if (!msgError && data && !cancelled) {
          setMessages(data as Message[])
        }
      } catch {
        // Silently handle
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [activeTab, circleId, supabase])

  // Post a new message
  async function handleSendMessage() {
    if (!newMessage.trim() || sending || !currentUserId) return
    setSending(true)

    try {
      const { data, error: sendError } = await supabase
        .from('circle_chat_messages')
        .insert({
          circle_id: circleId,
          user_id: currentUserId,
          content: newMessage.trim(),
        })
        .select()
        .single()

      if (sendError) throw sendError

      if (data) {
        setMessages((prev) => [...prev, data as Message])
      }
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  // Create a post
  async function handleCreatePost() {
    if (!postTitle.trim() || posting || !currentUserId) return
    setPosting(true)

    try {
      const { data, error: postError } = await supabase
        .from('circle_posts')
        .insert({
          circle_id: circleId,
          user_id: currentUserId,
          title: postTitle.trim(),
          content: postContent.trim() || null,
        })
        .select()
        .single()

      if (postError) throw postError

      if (data) {
        setPosts((prev) => [data as Post, ...prev])
      }
      setShowPostForm(false)
      setPostTitle('')
      setPostContent('')
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setPosting(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'posts', label: 'Posts', icon: FileText },
    { key: 'messages', label: 'Messages', icon: MessageCircle },
    { key: 'members', label: 'Members', icon: Users },
  ]

  // --- Loading state ---
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <CircleDetailSkeleton />
      </div>
    )
  }

  // --- Error state ---
  if (error || !circle) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/circles"
          className="mb-4 inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to circles
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-700">{error || 'Circle not found'}</p>
        </div>
      </div>
    )
  }

  const isMember = userRole !== null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/circles"
        className="mb-4 inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to circles
      </Link>

      {/* Circle header */}
      <div className="mb-8 flex items-start gap-5">
        <CircleAvatar
          name={circle.name}
          avatarUrl={circle.icon_url}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl text-charcoal">{circle.name}</h1>
          {circle.description && (
            <p className="mt-2 text-sm text-charcoal/60 leading-relaxed">
              {circle.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-charcoal/40">
            <Users className="h-3.5 w-3.5" />
            <span>{circle.member_count ?? members.length} member{(circle.member_count ?? members.length) !== 1 ? 's' : ''}</span>
            {!isMember && (
              <span className="rounded-full bg-charcoal/5 px-2.5 py-0.5 text-charcoal/40">
                Not a member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-charcoal/10">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'border-rose-amina text-rose-amina'
                : 'border-transparent text-charcoal/40 hover:text-charcoal/60'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Create post button */}
          {isMember && !showPostForm && (
            <button
              onClick={() => setShowPostForm(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-charcoal/10 bg-white/50 px-5 py-4 text-sm text-charcoal/40 hover:text-charcoal/60 hover:border-charcoal/20 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Share something with the circle…
            </button>
          )}

          {/* Post form */}
          {showPostForm && (
            <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-charcoal">New Post</h3>
                <button
                  onClick={() => { setShowPostForm(false); setPostTitle(''); setPostContent('') }}
                  className="text-charcoal/30 hover:text-charcoal/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post title…"
                  className="w-full rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
                />
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What is on your mind? (optional)"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={!postTitle.trim() || posting}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-amina px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 active:opacity-80 transition-opacity"
                  >
                    {posting && <Spinner size="sm" className="border-white/30 border-t-white" />}
                    {posting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-charcoal/20" />
              <p className="text-sm text-charcoal/40">No posts yet.</p>
              {!isMember && (
                <p className="text-xs text-charcoal/30">Join the circle to start posting.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-charcoal/10 bg-white p-5 transition-all hover:border-charcoal/20"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-display text-base text-charcoal">{post.title}</h4>
                    <span className="text-xs text-charcoal/30">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {post.content && (
                    <p className="text-sm text-charcoal/60 leading-relaxed">{post.content}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-charcoal/30">
                      by {post.user_name || post.user_email || 'Unknown'}
                    </span>
                    <FaithReactions
                      targetId={post.id}
                      targetType="post"
                      currentUserId={currentUserId ?? undefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === 'messages' && (
        <div className="flex flex-col">
          {/* Messages list */}
          <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-charcoal/20" />
                <p className="text-sm text-charcoal/40">No messages yet.</p>
                {isMember && (
                  <p className="text-xs text-charcoal/30">Start the conversation!</p>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-4 ${
                    msg.user_id === currentUserId
                      ? 'border-rose-amina/20 bg-rose-amina/5 ml-12'
                      : 'border-charcoal/10 bg-white mr-12'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-charcoal/60">
                      {msg.user_name || msg.user_email || 'Unknown'}
                    </span>
                    <span className="text-xs text-charcoal/30">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal/80">{msg.content}</p>
                  <div className="mt-2">
                    <FaithReactions
                      targetId={msg.id}
                      targetType="message"
                      currentUserId={currentUserId ?? undefined}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          {isMember && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 rounded-xl border border-charcoal/10 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-amina text-white disabled:opacity-50 active:opacity-80 transition-opacity"
              >
                {sending ? (
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-charcoal/20" />
              <p className="text-sm text-charcoal/40">No members yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-2xl border border-charcoal/10 bg-white p-4"
                >
                  <CircleAvatar
                    name={member.display_name || 'Member'}
                    avatarUrl={member.avatar_url}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {member.display_name || 'Anonymous'}
                    </p>
                    <span className="text-xs text-charcoal/40 capitalize">
                      {member.role}
                    </span>
                  </div>
                  {member.user_id === circle.creator_id && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Creator
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
