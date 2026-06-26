'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Crown, X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Member = {
  user_id: string
  display_handle: string
  role: string
  joined_at: string
  is_creator?: boolean
}

export default function CircleMembersPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const token = (() => {
      try {
        const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
        if (!match) return ''
        const blob = JSON.parse(decodeURIComponent(match[1]))
        return blob?.access_token ?? ''
      } catch {
        return ''
      }
    })()

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null)
    })

    fetch(`/api/circles/${id}/members`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.members) {
          setMembers(d.members)
          setFilteredMembers(d.members)
        }
        if (d.isAdmin !== undefined) setIsAdmin(d.isAdmin)
      })
      .finally(() => setLoading(false))
  }, [id, supabase])

  useEffect(() => {
    const filtered = members.filter(m => 
      m.display_handle.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredMembers(filtered)
  }, [search, members])

  async function removeMember(userId: string) {
    setRemoving(userId)
    try {
      const token = (() => {
        try {
          const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
          if (!match) return ''
          const blob = JSON.parse(decodeURIComponent(match[1]))
          return blob?.access_token ?? ''
        } catch {
          return ''
        }
      })()

      const res = await fetch(`/api/circles/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (res.ok) {
        setMembers(m => m.filter(x => x.user_id !== userId))
      }
    } catch (err) {
      console.log('[v0] Failed to remove member:', err)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: 'rgba(44,41,38,0.4)' }}>Loading members...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-[16px] font-semibold text-charcoal mb-2">No members yet</p>
        <p style={{ color: 'rgba(44,41,38,0.5)' }}>Be the first to join this circle!</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(44,41,38,0.4)' }} />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border"
          style={{ borderColor: 'var(--amina-hairline)', background: 'var(--amina-warm-ivory)' }}
        />
      </div>

      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'rgba(44,41,38,0.4)' }}>No members found</p>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0"
                  style={{
                    background: 'var(--amina-rose-selected)',
                    color: 'var(--amina-primary-action)',
                  }}
                >
                  {member.display_handle.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-charcoal truncate">{member.display_handle}</p>
                    {member.is_creator && (
                      <Crown size={14} style={{ color: 'var(--amina-primary-action)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.4)' }}>
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isAdmin && !member.is_creator && member.user_id !== currentUserId && (
                <button
                  onClick={() => removeMember(member.user_id)}
                  disabled={removing === member.user_id}
                  aria-label={`Remove ${member.display_handle}`}
                  className="ml-2 p-1.5 -mr-1 rounded-lg transition-colors"
                  style={{ background: removing === member.user_id ? 'rgba(217, 119, 119, 0.1)' : 'transparent', color: 'rgba(217, 119, 119, 0.6)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
