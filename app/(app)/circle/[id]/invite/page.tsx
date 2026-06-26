'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Copy, Check, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Circle = {
  id: string
  name: string
  invite_code: string
  member_count?: number
  max_members?: number
}

type Member = {
  id: string
  user_id: string
  display_handle: string
  joined_at: string
  profiles?: {
    display_name?: string
    avatar_url?: string | null
  }
}

export default function CircleInvitePage() {
  const router = useRouter()
  const params = useParams()
  const circleId = Array.isArray(params.id) ? params.id[0] : params.id

  const [circle, setCircle] = useState<Circle | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: circleData } = await supabase
        .from('circle_groups')
        .select('id, name, invite_code, max_members')
        .eq('id', circleId)
        .single()

      if (!circleData) {
        router.push('/circle')
        return
      }

      const { count: memberCount } = await supabase
        .from('circle_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('circle_id', circleId)

      const { data: membersList } = await supabase
        .from('circle_group_members')
        .select('id, user_id, display_handle, joined_at, profiles(display_name, avatar_url)')
        .eq('circle_id', circleId)
        .limit(8)

      setCircle({
        ...circleData,
        member_count: memberCount ?? 0,
      })
      setMembers(membersList || [])
      setLoading(false)
    }

    if (circleId) fetchData()
  }, [circleId, router])

  function handleCopy() {
    if (!circle) return
    navigator.clipboard.writeText(circle.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (!circle) return
    const shareText = `Join "${circle.name}" circle with code: ${circle.invite_code}`
    if (navigator.share) {
      navigator.share({
        title: 'Join my Circle',
        text: shareText,
      }).catch(() => {})
    }
  }

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/circle/join?code=${circle?.invite_code}`

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
        <div className="flex items-center px-4 pt-14 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}>
            <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px]" style={{ color: 'var(--amina-muted-text)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!circle) return null

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-8">
        {/* Title */}
        <h1 className="font-display italic text-[26px] text-charcoal mb-2 leading-snug">
          {circle.name}
        </h1>
        <p className="text-[14px] mb-8" style={{ color: 'var(--amina-muted-text)' }}>
          Invite sisters to join your circle
        </p>

        {/* Invite Code Box */}
        <div
          className="rounded-2xl flex flex-col items-center py-8 px-4 mb-4"
          style={{
            border: '2px solid var(--amina-muted-gold)',
            background: 'var(--amina-warm-ivory)',
          }}
        >
          <p className="text-[12px] mb-3 uppercase tracking-wide" style={{ color: 'rgba(44,41,38,0.5)' }}>
            Invite code
          </p>
          <p className="font-display italic text-[48px] tracking-[0.18em] text-charcoal leading-none select-all mb-2">
            {circle.invite_code}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.4)' }}>
            Only women with this code can join
          </p>
        </div>

        {/* Copy & Share Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-4 text-[14px] font-medium transition-all"
            style={{
              background: copied ? 'var(--amina-rose-selected)' : 'var(--amina-warm-ivory)',
              border: '1px solid var(--amina-border)',
              color: 'var(--amina-soft-charcoal)',
            }}
          >
            {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
            {copied ? 'Copied!' : 'Copy code'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-4 text-[14px] font-medium transition-all"
            style={{
              background: 'var(--amina-warm-ivory)',
              border: '1px solid var(--amina-border)',
              color: 'var(--amina-soft-charcoal)',
            }}
          >
            <Share2 size={16} strokeWidth={1.5} />
            Share
          </button>
        </div>

        {/* Member List Preview */}
        {members.length > 0 && (
          <div>
            <p className="text-[14px] font-semibold text-charcoal mb-3">
              Sisters in this circle ({circle.member_count}/{circle.max_members})
            </p>
            <div className="flex flex-col gap-2">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--amina-warm-ivory)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--amina-rose-selected)' }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--amina-primary-action)' }}>
                      {(m.display_handle || m.profiles?.display_name || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-charcoal truncate">
                      {m.display_handle || m.profiles?.display_name || 'Sister'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'rgba(44,41,38,0.4)' }}>
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
