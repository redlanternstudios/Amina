'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Crown } from 'lucide-react'

type Member = {
  user_id: string
  display_handle: string
  role: string
  joined_at: string
  is_creator?: boolean
}

export default function CircleMembersPage() {
  const { id } = useParams<{ id: string }>()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

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

    fetch(`/api/circles/${id}/members`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.members) setMembers(d.members)
      })
      .finally(() => setLoading(false))
  }, [id])

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
    <div className="px-4 py-4 space-y-2">
      {members.map(member => (
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
        </div>
      ))}
    </div>
  )
}
