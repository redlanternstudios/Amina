'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'
import CircleCard from '@/components/circle/CircleCard'
import type { Circle, MyCircle } from '@/components/circle/types'

// ---------------------------------------------------------------------------
// Search input component
// ---------------------------------------------------------------------------
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 text-sm" aria-hidden="true">
        🔍
      </span>
      <input
        type="text"
        placeholder="Search circles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-charcoal/10 bg-ivory pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-rose-amina/30"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-semibold text-charcoal text-sm">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 text-charcoal/30 font-normal">({count})</span>
        )}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main circles list page
// ---------------------------------------------------------------------------

type Tab = 'my' | 'discover' | 'requests' | 'activity'

interface ActivityItem {
  id: string
  type: 'message' | 'join' | 'reflection'
  actor_name: string
  circle_name: string
  preview?: string
  created_at: string
}

interface PendingInvite {
  id: string
  circle_id: string
  role: string
  joined_at: string | null
  circles: {
    id: string
    name: string
    description: string | null
    avatar_url: string | null
    creator_id: string
  }
}

export default function CirclesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('my')
  const [searchQuery, setSearchQuery] = useState('')
  const [myCircles, setMyCircles] = useState<MyCircle[]>([])
  const [discoverCircles, setDiscoverCircles] = useState<Circle[]>([])
  const [requestCount, setRequestCount] = useState(0)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const mySectionRef = useRef<HTMLDivElement>(null)
  const discoverSectionRef = useRef<HTMLDivElement>(null)
  const requestsSectionRef = useRef<HTMLDivElement>(null)
  const activitySectionRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // -----------------------------------------------------------------------
  // Data loading
  // -----------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. My circles (active memberships)
      const { data: memberships } = await supabase
        .from('circle_memberships')
        .select(`
          role, joined_at,
          circles!inner(id, name, description, avatar_url, is_public, creator_id, created_at)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })
        .limit(10)

      const mapped: MyCircle[] = (memberships ?? []).map((m: any) => ({
        id: m.circles.id,
        name: m.circles.name,
        description: m.circles.description,
        avatar_url: m.circles.avatar_url,
        is_public: m.circles.is_public,
        creator_id: m.circles.creator_id,
        created_at: m.circles.created_at,
        role: m.role,
        last_message_at: null,
        unread: false,
      }))

      setMyCircles(mapped)

      // 2. Discover circles
      const joinedIds = mapped.map((c) => c.id).filter(Boolean)
      let discoverQuery = supabase
        .from('circles')
        .select('id, name, description, avatar_url, is_public, creator_id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (joinedIds.length > 0) {
        discoverQuery = discoverQuery.not('id', 'in', `(${joinedIds.join(',')})`)
      }

      const { data: discoverData } = await discoverQuery
      setDiscoverCircles((discoverData as Circle[]) ?? [])

      // 3. Pending invites (user's own)
      const { data: myInvites } = await supabase
        .from('circle_memberships')
        .select(`
          id, circle_id, role, joined_at,
          circles!inner(id, name, description, avatar_url, creator_id)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')

      const typedInvites = (myInvites as unknown as PendingInvite[]) || []
      setPendingInvites(typedInvites)
      // Also load a separate count via the API badge
      const { count } = await supabase
        .from('circle_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')
      setRequestCount(count ?? 0)

      // 4. Recent activity — load from messages
      const { data: recentMessages } = await supabase
        .from('circle_messages')
        .select(`
          id, content, created_at,
          circle_id,
          circles(name),
          circle_profiles!inner(display_name)
        `)
        .in('circle_id', joinedIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentMessages) {
        const mappedActivity: ActivityItem[] = recentMessages.map((m: any) => ({
          id: `msg-${m.id}`,
          type: 'message',
          actor_name: m.circle_profiles?.display_name ?? 'Someone',
          circle_name: m.circles?.name ?? 'Unknown',
          preview: m.content?.slice(0, 80) ?? '',
          created_at: m.created_at,
        }))
        setActivity(mappedActivity)
      }
    } catch (err) {
      console.error('Failed to load circles:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  // -----------------------------------------------------------------------
  // Tab scrolling
  // -----------------------------------------------------------------------
  function scrollToTab(tab: Tab) {
    setActiveTab(tab)
    const refs: Record<Tab, React.RefObject<HTMLDivElement | null>> = {
      my: mySectionRef,
      discover: discoverSectionRef,
      requests: requestsSectionRef,
      activity: activitySectionRef,
    }
    refs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // -----------------------------------------------------------------------
  // Join handler
  // -----------------------------------------------------------------------
  async function handleJoin(circleId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('circle_memberships')
      .select('status')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .single()

    if (existing) return

    const { data: circle } = await supabase
      .from('circles')
      .select('is_public')
      .eq('id', circleId)
      .single()

    await supabase.from('circle_memberships').insert({
      circle_id: circleId,
      user_id: user.id,
      role: 'member',
      status: circle?.is_public ? 'active' : 'pending',
      joined_at: new Date().toISOString(),
    })

    loadData()
  }

  // -----------------------------------------------------------------------
  // Search filter
  // -----------------------------------------------------------------------
  const filteredMy = searchQuery
    ? myCircles.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myCircles

  const filteredDiscover = searchQuery
    ? discoverCircles.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : discoverCircles

  // -----------------------------------------------------------------------
  // Tabs config
  // -----------------------------------------------------------------------
  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'my', label: 'My Circles' },
    { key: 'discover', label: 'Discover' },
    { key: 'requests', label: 'Requests', badge: requestCount > 0 ? requestCount : undefined },
    { key: 'activity', label: 'Activity' },
  ]

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-0 bg-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-display text-2xl text-charcoal">Circles</h1>
            <p className="text-charcoal/50 text-xs">Connect, support, and grow together in faith.</p>
          </div>
          <button
            onClick={() => router.push('/circles/create')}
            className="w-9 h-9 bg-rose-amina rounded-full flex items-center justify-center shadow-sm active:opacity-80"
            aria-label="Create circle"
          >
            <span className="text-white text-xl leading-none">+</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-3 overflow-x-auto border-b border-charcoal/8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollToTab(tab.key)}
              className={`flex-shrink-0 px-4 pb-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-rose-amina text-rose-amina'
                  : 'border-transparent text-charcoal/50'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-1 bg-rose-amina text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="py-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {loading ? (
          <LoadingDots />
        ) : (
          <>
            {/* My Circles */}
            <div ref={mySectionRef} className="pt-2">
              <SectionHeader title="My Circles" count={myCircles.length} />
              {filteredMy.length === 0 && !searchQuery ? (
                <EmptyState
                  icon="🕌"
                  title="No circles yet"
                  body="Join a circle to connect with sisters."
                  action="Discover circles"
                  onAction={() => scrollToTab('discover')}
                />
              ) : filteredMy.length === 0 && searchQuery ? (
                <EmptyState
                  icon="🔍"
                  title="No matches"
                  body="Try a different search term."
                />
              ) : (
                <div className="space-y-2.5">
                  {filteredMy.map((c) => (
                    <CircleCard
                      key={c.id}
                      circle={c}
                      variant="member"
                      onClick={(id) => router.push(`/circles/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Discover */}
            <div ref={discoverSectionRef} className="pt-7">
              <SectionHeader title="Discover Circles" count={discoverCircles.length} />
              {filteredDiscover.length === 0 && !searchQuery ? (
                <EmptyState
                  icon="🌸"
                  title="Check back soon"
                  body="New circles are added by the community."
                />
              ) : filteredDiscover.length === 0 && searchQuery ? (
                <EmptyState
                  icon="🔍"
                  title="No matches"
                  body="Try a different search term."
                />
              ) : (
                <div className="space-y-2.5">
                  {filteredDiscover.map((c) => (
                    <CircleCard
                      key={c.id}
                      circle={c}
                      variant="discover"
                      onJoin={handleJoin}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Requests indicator */}
            {requestCount > 0 && (
              <div ref={requestsSectionRef} className="pt-7">
                <SectionHeader title="Pending Requests" count={requestCount} />
                <div className="bg-ivory rounded-2xl p-4 text-center">
                  <p className="text-charcoal/50 text-xs">
                    You have {requestCount} pending request{requestCount > 1 ? 's' : ''}.
                    Manage them from the circle settings.
                  </p>
                </div>
              </div>
            )}

            {/* Activity */}
            <div ref={activitySectionRef} className="pt-7">
              <SectionHeader title="Recent Activity" />
              {activity.length === 0 ? (
                <EmptyState
                  icon="🔔"
                  title="Activity will appear here"
                  body="Messages, joins, and reflections from your circles."
                />
              ) : (
                <div className="space-y-2">
                  {activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActivityRow({ item }: { item: ActivityItem }) {
  const icons: Record<string, string> = {
    message: '💬',
    join: '🌸',
    reflection: '✨',
  }
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-charcoal/5 last:border-0">
      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
        {icons[item.type] ?? '🔔'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-charcoal text-xs leading-relaxed">
          <span className="font-semibold">{item.actor_name}</span>
          {item.type === 'message' && ' sent a message in '}
          {item.type === 'join' && ' joined '}
          {item.type === 'reflection' && ' shared a reflection in '}
          <span className="font-medium">{item.circle_name}</span>
        </p>
        {item.preview && (
          <p className="text-charcoal/50 text-xs mt-0.5 truncate italic">
            &ldquo;{item.preview}&rdquo;
          </p>
        )}
        <p className="text-charcoal/30 text-xs mt-0.5">{timeAgo(item.created_at)}</p>
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string
  title: string
  body: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-3xl mb-2" role="img" aria-hidden="true">{icon}</span>
      <p className="font-semibold text-charcoal text-sm">{title}</p>
      <p className="text-charcoal/50 text-xs mt-1 max-w-[220px]">{body}</p>
      {action && onAction && (
        <button onClick={onAction} className="mt-3 bg-rose-amina text-white text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80">
          {action}
        </button>
      )}
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex justify-center py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
