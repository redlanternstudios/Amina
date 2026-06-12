'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Circle {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  is_private: boolean
  member_count: number | null
}

interface MyCircle extends Circle {
  role: string
  last_message_at: string | null
  unread: boolean
}

interface ActivityItem {
  id: string
  type: 'message' | 'join' | 'reflection'
  actor_name: string
  circle_name: string
  circle_id: string
  preview: string | null
  created_at: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CirclePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'my' | 'discover' | 'requests' | 'activity'>('my')

  const [myCircles, setMyCircles] = useState<MyCircle[]>([])
  const [discoverCircles, setDiscoverCircles] = useState<Circle[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [requestCount, setRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const myCirclesRef = useRef<HTMLDivElement>(null)
  const discoverRef = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // My Circles — order by membership join time (circles has no updated_at)
      const { data: memberships } = await supabase
        .from('circle_memberships')
        .select('role, joined_at, circles(id, name, description, icon_url, is_private, member_count)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })
        .limit(10)

      if (memberships) {
        setMyCircles(memberships.map((m: any) => ({
          ...m.circles,
          role: m.role,
          last_message_at: m.joined_at ?? null,
          unread: false,
        })))

        const joinedIds = memberships.map((m: any) => m.circles?.id).filter(Boolean)

        // Discover — public circles the user hasn't joined
        let query = supabase
          .from('circles')
          .select('id, name, description, icon_url, is_private, member_count')
          .eq('is_private', false)
          .limit(6)

        if (joinedIds.length > 0) {
          query = query.not('id', 'in', `(${joinedIds.join(',')})`)
        }
        const { data: discover } = await query
        setDiscoverCircles(discover ?? [])
      }

      // Pending requests count
      const { count } = await supabase
        .from('circle_join_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')
      setRequestCount(count ?? 0)

      setLoading(false)
    }
    load()
  }, [])

  function scrollToSection(section: typeof activeSection) {
    setActiveSection(section)
    const refs = { my: myCirclesRef, discover: discoverRef, activity: activityRef, requests: discoverRef }
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-0 bg-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-display text-2xl text-charcoal">Circle</h1>
            <p className="text-charcoal/50 text-xs">Connect, support, and grow together in faith.</p>
          </div>
          <button
            onClick={() => router.push('/circle/create')}
            className="w-9 h-9 bg-rose-amina rounded-full flex items-center justify-center shadow-sm active:opacity-80"
          >
            <span className="text-white text-xl leading-none">+</span>
          </button>
        </div>

        {/* Tab anchors */}
        <div className="flex gap-0 mt-3 overflow-x-auto border-b border-charcoal/8">
          {([
            { key: 'my', label: 'My Circles' },
            { key: 'discover', label: 'Discover' },
            { key: 'requests', label: `Requests${requestCount > 0 ? ` (${requestCount})` : ''}` },
            { key: 'activity', label: 'Activity' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => scrollToSection(tab.key)}
              className={`flex-shrink-0 px-4 pb-2.5 text-xs font-medium border-b-2 transition-all ${
                activeSection === tab.key
                  ? 'border-rose-amina text-rose-amina'
                  : 'border-transparent text-charcoal/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">

        {loading ? (
          <LoadingDots />
        ) : (
          <>
            {/* ── MY CIRCLES ─────────────────────────────────────────────── */}
            <div ref={myCirclesRef} className="pt-5">
              <SectionHeader
                title="My Circles"
                onViewAll={() => {}}
              />

              {myCircles.length === 0 ? (
                <EmptyState
                  icon="🕌"
                  title="No circles yet"
                  body="Join a circle to connect with sisters."
                  action="Discover circles"
                  onAction={() => scrollToSection('discover')}
                />
              ) : (
                <div className="space-y-2.5">
                  {myCircles.map(circle => (
                    <MyCircleCard
                      key={circle.id}
                      circle={circle}
                      onClick={() => router.push(`/circle/${circle.id}/chat`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── DISCOVER ───────────────────────────────────────────────── */}
            <div ref={discoverRef} className="pt-7">
              <SectionHeader title="Discover Circles" onViewAll={() => {}} />

              {discoverCircles.length === 0 ? (
                <EmptyState
                  icon="🌸"
                  title="Check back soon"
                  body="New circles are added by the community."
                />
              ) : (
                <div className="space-y-2.5">
                  {discoverCircles.map(circle => (
                    <DiscoverCard
                      key={circle.id}
                      circle={circle}
                      onJoin={() => handleJoinRequest(circle.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── RECENT ACTIVITY ────────────────────────────────────────── */}
            <div ref={activityRef} className="pt-7">
              <SectionHeader title="Recent Activity" onViewAll={() => {}} />

              {activity.length === 0 ? (
                <EmptyState
                  icon="🔔"
                  title="Activity will appear here"
                  body="Messages, joins, and reflections from your circles."
                />
              ) : (
                <div className="space-y-2">
                  {activity.map(item => (
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

// ─── Join request ─────────────────────────────────────────────────────────────

async function handleJoinRequest(circleId: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return

  // Check if already a member
  const { data: existing } = await supabase
    .from('circle_memberships')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return

  // Direct join for public circles
  const { error } = await supabase.from('circle_memberships').insert({
    circle_id: circleId,
    user_id: user.id,
    role: 'member',
  })

  // Ignore duplicate key errors
  if (error && error.code !== '23505') {
    console.error('Failed to join circle:', error)
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-semibold text-charcoal text-sm">{title}</p>
      <button onClick={onViewAll} className="text-xs text-charcoal/40">View all →</button>
    </div>
  )
}

function CircleAvatar({ circle, size = 'md' }: { circle: { name: string; icon_url?: string | null }; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-base' : 'w-11 h-11 text-lg'
  return (
    <div className={`${sz} rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {circle.icon_url
        ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
        : <span>🕌</span>
      }
    </div>
  )
}

function MyCircleCard({ circle, onClick }: { circle: MyCircle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-ivory rounded-2xl p-3.5 flex items-center gap-3 text-left active:opacity-80"
    >
      <div className="relative">
        <CircleAvatar circle={circle} />
        {circle.unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-amina rounded-full border-2 border-cream" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-charcoal text-sm truncate">{circle.name}</p>
        {circle.description && (
          <p className="text-charcoal/50 text-xs mt-0.5 truncate">{circle.description}</p>
        )}
        {circle.last_message_at && (
          <p className="text-charcoal/30 text-xs mt-0.5">
            Last message {timeAgo(circle.last_message_at)}
          </p>
        )}
      </div>
      {circle.member_count !== null && (
        <span className="text-xs text-charcoal/40 flex-shrink-0">{circle.member_count}</span>
      )}
      <span className="text-charcoal/20 flex-shrink-0">›</span>
    </button>
  )
}

function DiscoverCard({ circle, onJoin }: { circle: Circle; onJoin: () => void }) {
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setJoined(true)
    await onJoin()
  }

  return (
    <div className="bg-ivory rounded-2xl p-3.5 flex items-center gap-3">
      <CircleAvatar circle={circle} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-charcoal text-sm truncate">{circle.name}</p>
        {circle.description && (
          <p className="text-charcoal/50 text-xs mt-0.5 truncate">{circle.description}</p>
        )}
        {circle.member_count !== null && (
          <p className="text-charcoal/30 text-xs mt-0.5">{circle.member_count.toLocaleString()} members</p>
        )}
      </div>
      <button
        onClick={handleJoin}
        disabled={joined}
        className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
          joined
            ? 'bg-charcoal/10 text-charcoal/40'
            : 'bg-rose-amina text-white active:opacity-80'
        }`}
      >
        {joined ? 'Requested' : 'Join'}
      </button>
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const icons: Record<string, string> = { message: '💬', join: '🌸', reflection: '✨' }
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-charcoal/5 last:border-0">
      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
        {icons[item.type] ?? '🔔'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-charcoal text-xs leading-relaxed">
          <span className="font-semibold">{item.actor_name}</span>
          {item.type === 'message' && ` sent a message in `}
          {item.type === 'join' && ` joined `}
          {item.type === 'reflection' && ` shared a reflection in `}
          <span className="font-medium">{item.circle_name}</span>
        </p>
        {item.preview && (
          <p className="text-charcoal/50 text-xs mt-0.5 truncate italic">"{item.preview}"</p>
        )}
        <p className="text-charcoal/30 text-xs mt-0.5">{timeAgo(item.created_at)}</p>
      </div>
    </div>
  )
}

function EmptyState({
  icon, title, body, action, onAction,
}: {
  icon: string; title: string; body: string; action?: string; onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="font-semibold text-charcoal text-sm">{title}</p>
      <p className="text-charcoal/50 text-xs mt-1 max-w-[220px]">{body}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 bg-rose-amina text-white text-xs font-semibold px-4 py-1.5 rounded-full"
        >
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
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-rose-300 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
