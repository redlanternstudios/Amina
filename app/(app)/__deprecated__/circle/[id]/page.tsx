'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import FaithReactions from '@/components/circle/FaithReactions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'posts' | 'messages' | 'members'

interface CircleData {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  is_public: boolean
  creator_id: string
}

interface Member {
  id: string
  user_id: string
  role: string
  display_name: string
  avatar_url: string | null
}

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  circle_id: string
  profiles?: { display_name?: string; avatar_url?: string | null }
  reactions?: { reaction: string; user_id: string }[]
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function CircleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="bg-white border-b border-charcoal/10 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-charcoal/10 rounded-full" />
          <div className="w-10 h-10 bg-charcoal/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-charcoal/10 rounded w-1/3" />
            <div className="h-3 bg-charcoal/10 rounded w-1/5" />
          </div>
        </div>
        <div className="h-3 bg-charcoal/10 rounded w-2/3 ml-11" />
      </div>
      <div className="flex border-b border-charcoal/10 bg-white">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-10 bg-charcoal/5 mx-1 rounded" />
        ))}
      </div>
      <div className="px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-ivory rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-charcoal/10 rounded-full" />
              <div className="h-3 bg-charcoal/10 rounded w-1/4" />
            </div>
            <div className="h-3 bg-charcoal/10 rounded w-full" />
            <div className="h-3 bg-charcoal/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <span className="text-4xl mb-3" role="img" aria-hidden="true">⚠️</span>
      <p className="font-semibold text-red-600 text-sm mb-1">Something went wrong</p>
      <p className="text-charcoal/50 text-xs max-w-[240px] mb-4">{message}</p>
      <button onClick={onBack} className="bg-charcoal/10 text-charcoal/60 text-xs font-semibold px-4 py-1.5 rounded-full">
        Go back
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state per tab
// ---------------------------------------------------------------------------

function TabEmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3" role="img" aria-hidden="true">{icon}</p>
      <p className="text-charcoal/40 text-sm">{title}</p>
      <p className="text-charcoal/30 text-xs mt-1">{body}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main detail page component
// ---------------------------------------------------------------------------

export default function CircleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string

  const [circle, setCircle] = useState<CircleData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [userRole, setUserRole] = useState<string | null>(null)

  // -----------------------------------------------------------------------
  // Load circle data
  // -----------------------------------------------------------------------
  const loadCircle = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // Fetch circle
      const { data: c, error: cErr } = await supabase
        .from('circles')
        .select('*')
        .eq('id', circleId)
        .single()

      if (cErr) {
        if (cErr.code === 'PGRST116') {
          setError('Circle not found')
        } else {
          setError(cErr.message)
        }
        return
      }

      // Check membership for private circles
      const { data: membership } = await supabase
        .from('circle_memberships')
        .select('role')
        .eq('circle_id', circleId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!membership && c.is_public === false) {
        setError('You are not a member of this circle')
        return
      }

      setCircle(c)
      setUserRole(membership?.role || null)

      // Fetch members with circle_profiles (correct schema join)
      const { data: mems } = await supabase
        .from('circle_memberships')
        .select('id, user_id, role, circle_profiles!inner(display_name, avatar_url)')
        .eq('circle_id', circleId)
        .eq('status', 'active')

      if (mems) {
        setMembers(
          mems.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role,
            display_name: m.circle_profiles?.display_name || 'User',
            avatar_url: m.circle_profiles?.avatar_url || null,
          }))
        )
      }

      // Fetch posts with reactions
      const { data: postData } = await supabase
        .from('circle_posts')
        .select(`
          id, content, created_at, user_id, circle_id,
          circle_profiles!inner(display_name, avatar_url)
        `)
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (postData) {
        // Also fetch reactions for these posts
        const postIds = postData.map((p: any) => p.id)
        const { data: reactionData } = await supabase
          .from('circle_reactions')
          .select('user_id, reaction, target_id')
          .in('target_id', postIds)
          .eq('target_type', 'post')

        const reactionsMap: Record<string, { reaction: string; user_id: string }[]> = {}
        for (const r of reactionData ?? []) {
          if (!reactionsMap[r.target_id]) reactionsMap[r.target_id] = []
          reactionsMap[r.target_id].push({ reaction: r.reaction, user_id: r.user_id })
        }

        setPosts(
          postData.map((p: any) => ({
            id: p.id,
            content: p.content,
            created_at: p.created_at,
            user_id: p.user_id,
            circle_id: p.circle_id,
            profiles: {
              display_name: p.circle_profiles?.display_name,
              avatar_url: p.circle_profiles?.avatar_url,
            },
            reactions: reactionsMap[p.id] ?? [],
          }))
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [circleId, supabase, router])

  useEffect(() => {
    loadCircle()
  }, [loadCircle])

  // -----------------------------------------------------------------------
  // Render states
  // -----------------------------------------------------------------------

  if (loading) return <CircleDetailSkeleton />
  if (error) return <ErrorState message={error} onBack={() => router.back()} />
  if (!circle) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'messages', label: 'Messages' },
    { key: 'members', label: `Members (${members.length})` },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal/10 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-charcoal hover:text-rose-amina transition-colors text-xl leading-none">
            &larr;
          </button>
          <CircleAvatar name={circle.name} avatarUrl={circle.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg text-charcoal truncate">{circle.name}</h1>
            <p className="text-xs text-charcoal/40">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          {userRole && ['creator', 'admin'].includes(userRole) && (
            <button
              onClick={() => router.push(`/circle/${circleId}/settings`)}
              className="text-xs text-charcoal/40 hover:text-charcoal/70 px-2 py-1"
              aria-label="Circle settings"
            >
              ⚙️
            </button>
          )}
        </div>
        {circle.description && (
          <p className="text-sm text-charcoal/70 ml-11">{circle.description}</p>
        )}
        {circle.is_public && (
          <div className="ml-11 mt-1">
            <span className="text-[10px] bg-rose-100 text-rose-dark px-2 py-0.5 rounded-full font-medium">
              Public circle
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs font-medium text-center transition-all ${
              activeTab === tab.key
                ? 'text-rose-amina border-b-2 border-rose-amina'
                : 'text-charcoal/50 hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pb-24">
        {/* Posts tab */}
        {activeTab === 'posts' && (
          <div className="px-4 py-4 space-y-3">
            {posts.length === 0 ? (
              <TabEmptyState
                icon="📝"
                title="No posts yet"
                body="Posts from this circle will appear here."
              />
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-ivory rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleAvatar
                      name={post.profiles?.display_name || 'User'}
                      avatarUrl={post.profiles?.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {post.profiles?.display_name || 'User'}
                      </p>
                      <p className="text-[10px] text-charcoal/30">
                        {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal/80 whitespace-pre-wrap">{post.content}</p>
                  <FaithReactions
                    targetId={post.id}
                    targetType="post"
                    existingReactions={post.reactions}
                    currentUserId={currentUserId}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages tab -- inline chat preview */}
        {activeTab === 'messages' && (
          <InlineChat circleId={circleId} currentUserId={currentUserId} />
        )}

        {/* Members tab */}
        {activeTab === 'members' && (
          <div className="px-4 py-4 space-y-2">
            {members.length === 0 ? (
              <TabEmptyState
                icon="👥"
                title="No members yet"
                body="Invite others to join this circle."
              />
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 bg-ivory rounded-xl px-4 py-3">
                  <CircleAvatar name={member.display_name} avatarUrl={member.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{member.display_name}</p>
                  </div>
                  {member.role === 'creator' && (
                    <span className="text-[10px] bg-rose-100 text-rose-dark px-2 py-0.5 rounded-full font-medium">Creator</span>
                  )}
                  {member.role === 'admin' && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}


// ---------------------------------------------------------------------------
// InlineChat component — real-time preview for the detail page
// ---------------------------------------------------------------------------
function InlineChat({ circleId, currentUserId }: { circleId: string; currentUserId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from("circle_messages")
        .select("*, circle_profiles:user_id(display_name, avatar_url)")
        .eq("circle_id", circleId)
        .order("created_at", { ascending: false })
        .limit(20)
      if (mounted) {
        if (data) setMessages(data.reverse())
        setLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [circleId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel("inline-chat-" + circleId)
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "circle_messages", filter: "circle_id=eq." + circleId },
        (payload) => { setMessages((prev) => [...prev, payload.new as any]) }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [circleId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput("")
    const optimistic = { id: "opt-" + Date.now(), circle_id: circleId, user_id: currentUserId, content, created_at: new Date().toISOString(), circle_profiles: null }
    setMessages((prev) => [...prev, optimistic])
    try {
      const res = await fetch("/api/circles/" + circleId + "/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }),
      })
      if (!res.ok) setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally { setSending(false) }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full px-4 py-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {[1,2,3].map((i) => (
            <div key={i} className="flex gap-2 items-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-charcoal/10 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-charcoal/10 rounded w-20" />
                <div className="h-6 bg-charcoal/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/5">
        <h3 className="text-sm font-semibold text-charcoal">Chat</h3>
        <button onClick={() => router.push("/circle/" + circleId + "/chat")} className="text-xs text-rose-amina font-medium active:opacity-70">Full Chat →</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2" role="img" aria-hidden="true">💬</p>
            <p className="text-charcoal/40 text-sm">No messages yet</p>
            <p className="text-charcoal/30 text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 items-start">
              <CircleAvatar name={msg.circle_profiles?.display_name || "U"} avatarUrl={msg.circle_profiles?.avatar_url} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-charcoal">{msg.circle_profiles?.display_name || "User"}</span>
                  <span className="text-[10px] text-charcoal/30">{timeAgo(msg.created_at)}</span>
                </div>
                <p className="text-sm text-charcoal/80 mt-0.5 break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-charcoal/5 bg-ivory/50">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." maxLength={500}
          className="flex-1 rounded-full bg-white border border-charcoal/10 px-4 py-2 text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30" />
        <button type="submit" disabled={!input.trim() || sending}
          className="shrink-0 w-9 h-9 rounded-full bg-rose-amina text-white flex items-center justify-center disabled:opacity-40 active:opacity-80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
