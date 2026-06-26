'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, MessageCircle, Users, Settings, BookOpen, Share2 } from 'lucide-react'
import { useState, useEffect } from 'react'

type Circle = {
  id: string
  name: string
  intention: string
  topic_tag: string
  created_by?: string
}

export default function CircleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const id = params.id as string
  
  const [circle, setCircle] = useState<Circle | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Extract user ID from token
  useEffect(() => {
    try {
      const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
      if (match) {
        const blob = JSON.parse(decodeURIComponent(match[1]))
        setCurrentUserId(blob?.user?.id)
      }
    } catch {
      // Ignore
    }
  }, [])

  // Load circle data
  useEffect(() => {
    if (!id) return
    fetch(`/api/circles/${id}`, {
      headers: {
        'Authorization': `Bearer ${document.cookie.split('sb-')[1]?.split('=')[1] || ''}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.circle) setCircle(d.circle)
      })
      .finally(() => setLoading(false))
  }, [id])

  const isCreator = circle?.created_by === currentUserId
  
  // Determine active tab
  const reflectionsActive = pathname === `/circle/${id}` || pathname === `/circle/${id}/`
  const chatActive = pathname === `/circle/${id}/chat`
  const membersActive = pathname === `/circle/${id}/members`
  const settingsActive = pathname === `/circle/${id}/settings`

  const TAB_STYLE_ACTIVE = {
    color: 'var(--amina-primary-action)',
    borderBottom: '2px solid var(--amina-primary-action)',
  }
  const TAB_STYLE_INACTIVE = {
    color: 'rgba(44,41,38,0.5)',
    borderBottom: '2px solid transparent',
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--amina-page-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--amina-hairline)', background: 'var(--amina-warm-ivory)' }}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--amina-hairline)' }}>
          <button onClick={() => router.back()} aria-label="Back">
            <ChevronLeft size={24} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-[16px] font-semibold text-charcoal">{circle?.name || 'Circle'}</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(44,41,38,0.5)' }}>{circle?.topic_tag}</p>
          </div>
          <button
            onClick={() => router.push(`/circle/${id}/invite`)}
            aria-label="Invite sisters"
            className="w-6 h-6 flex items-center justify-center"
          >
            <Share2 size={20} strokeWidth={1.5} style={{ color: 'var(--amina-primary-action)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-4" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
          <button
            onClick={() => router.push(`/circle/${id}`)}
            className="flex items-center gap-1.5 py-3 px-0 text-[13px] font-medium transition-colors"
            style={reflectionsActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
          >
            <BookOpen size={16} />
            Reflections
          </button>
          <button
            onClick={() => router.push(`/circle/${id}/chat`)}
            className="flex items-center gap-1.5 py-3 px-4 text-[13px] font-medium transition-colors"
            style={chatActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
          >
            <MessageCircle size={16} />
            Chat
          </button>
          <button
            onClick={() => router.push(`/circle/${id}/members`)}
            className="flex items-center gap-1.5 py-3 px-4 text-[13px] font-medium transition-colors"
            style={membersActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
          >
            <Users size={16} />
            Members
          </button>
          {isCreator && (
            <button
              onClick={() => router.push(`/circle/${id}/settings`)}
              className="flex items-center gap-1.5 py-3 px-4 text-[13px] font-medium transition-colors"
              style={settingsActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
            >
              <Settings size={16} />
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'rgba(44,41,38,0.4)' }}>Loading...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
