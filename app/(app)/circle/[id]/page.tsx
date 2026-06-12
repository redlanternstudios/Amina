'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CircleAvatar from '@/components/circle/CircleAvatar'

type Tab = 'posts' | 'chat' | 'members'

interface CircleData {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  is_public: boolean
  category: string | null
  creator_id: string
  member_count: number
}

interface Member {
  id: string
  user_id: string
  role: string
  display_name: string
  avatar_url: string | null
}

export default function CircleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string

  const [circle, setCircle] = useState<CircleData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setCurrentUserId(user.id)

      // Fetch circle
      const { data: c, error: cErr } = await supabase
        .from('circles')
        .select('*')
        .eq('id', circleId)
        .single()

      if (cErr) { setError(cErr.message); return }

      // Check membership
      const { data: membership } = await supabase
        .from('circle_memberships')
        .select('role')
        .eq('circle_id', circleId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!membership && !c.is_public) {
        setError('You are not a member of this circle')
        return
      }

      setUserRole(membership?.role || null)
      if (!mounted) return

      // Count members
      const { count } = await supabase
        .from('circle_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('circle_id', circleId)
        .eq('status', 'active')

      setCircle({ ...c, member_count: count || 0 })

      // Fetch members
      const { data: mems } = await supabase
        .from('circle_memberships')
        .select('id, user_id, role, profiles!inner(display_name, avatar_url)')
        .eq('circle_id', circleId)
        .eq('status', 'active')

      if (mems) {
        setMembers(mems.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          display_name: m.profiles?.display_name || 'User',
          avatar_url: m.profiles?.avatar_url || null,
        })))
      }

      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [circleId, supabase, router])

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><p className="text-charcoal">Loading circle…</p></div>
  if (error) return <div className="min-h-screen bg-cream flex items-center justify-center"><p className="text-red-500">{error}</p></div>
  if (!circle) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'chat', label: 'Chat' },
    { key: 'members', label: `Members (${circle.member_count})` },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal/10 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-charcoal hover:text-rose-amina transition-colors text-xl leading-none">&larr;</button>
          <CircleAvatar name={circle.name} avatarUrl={circle.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg text-charcoal truncate">{circle.name}</h1>
            <p className="text-xs text-charcoal/40">{circle.member_count} members{circle.category ? ' · ' + circle.category : ''}</p>
          </div>
        </div>
        {circle.description && (
          <p className="text-sm text-charcoal/70 ml-11">{circle.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 bg-white">
        {tabs.map(tab => (
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
        {activeTab === 'posts' && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-charcoal/40 text-sm">Posts from this circle will appear here.</p>
            <button
              onClick={() => router.push(`/circle/${circleId}/posts`)}
              className="mt-3 bg-rose-amina text-white text-xs font-semibold px-4 py-1.5 rounded-full"
            >
              Go to Posts
            </button>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-charcoal/40 text-sm">Chat with circle members in real-time.</p>
            <button
              onClick={() => router.push(`/circle/${circleId}/chat`)}
              className="mt-3 bg-rose-amina text-white text-xs font-semibold px-4 py-1.5 rounded-full"
            >
              Open Chat
            </button>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="px-4 py-4 space-y-2">
            {members.length === 0 ? (
              <p className="text-center text-charcoal/40 py-8 text-sm">No members yet.</p>
            ) : (
              members.map(member => (
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
