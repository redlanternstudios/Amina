'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Key, Search } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/app/AppHeader'

const TOPIC_COLORS: Record<string, string> = {
  'Faith & Worship': '#D6AAA3',
  'Marriage & Family': '#C4B5A0',
  'Mental Health': '#A8B89A',
  'Sisterhood': '#D6AAA3',
  'Quran Study': '#C4B5A0',
  'Life Transitions': '#B8A99A',
  'New Muslims': '#A8B89A',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Active just now' : `Active ${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Active ${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Active yesterday'
  return `Active ${days} days ago`
}

type Circle = {
  id: string
  name: string
  intention: string
  topic_tag: string
  member_count: number
  max_members: number
  updated_at: string
}

function CircleCard({ circle, onClick }: { circle: Circle; onClick: () => void }) {
  const chipColor = TOPIC_COLORS[circle.topic_tag] ?? '#D6AAA3'
  return (
    <button
      onClick={onClick}
      className="text-left w-full flex flex-col gap-2 transition-all active:scale-[0.98] p-4"
      style={{
        background: 'var(--amina-warm-ivory)',
        borderRadius: 16,
        borderTop: '2px solid var(--amina-muted-gold)',
        borderLeft: '1px solid var(--amina-hairline)',
        borderRight: '1px solid var(--amina-hairline)',
        borderBottom: '1px solid var(--amina-hairline)',
        boxShadow: '0 1px 4px rgba(44,41,38,0.06)',
      }}
    >
      <p className="font-display italic text-[18px] leading-tight text-charcoal line-clamp-1">
        {circle.name}
      </p>
      <p className="text-[13px] leading-snug line-clamp-2" style={{ color: 'rgba(44,41,38,0.6)' }}>
        {circle.intention}
      </p>
      <span
        className="self-start text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full text-white"
        style={{ background: chipColor }}
      >
        {circle.topic_tag}
      </span>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px]" style={{ color: 'rgba(44,41,38,0.4)' }}>
          {timeAgo(circle.updated_at)}
        </span>
        <span className="text-[12px]" style={{ color: 'rgba(44,41,38,0.5)' }}>
          {circle.member_count} sister{circle.member_count !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  )
}

function EmptyState({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-14">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'var(--amina-rose-selected)' }}
      >
        <span className="font-display italic text-3xl" style={{ color: 'var(--amina-primary-action)' }}>C</span>
      </div>
      <p className="font-display italic text-[22px] text-charcoal mb-2 text-balance">
        You haven&apos;t joined a circle yet, sister.
      </p>
      <p className="text-[14px] mb-8 text-balance" style={{ color: 'rgba(44,41,38,0.55)' }}>
        Find a circle or create your own.
      </p>
      <button onClick={onCreate} className="btn-primary w-full mb-3">
        Create a circle
      </button>
      <button onClick={onJoin} className="btn-secondary w-full">
        Join with a code
      </button>
    </div>
  )
}

export default function CirclePage() {
  const router = useRouter()
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/circles')
      .then(r => r.json())
      .then(d => setCircles(d.circles ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col min-h-dvh pb-28" style={{ background: 'var(--amina-soft-cream)' }}>
      <AppHeader
        title="The Circle"
        right={
          <button
            onClick={() => router.push('/circle/browse')}
            aria-label="Browse open circles"
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
          >
            <Search size={17} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="mb-5">
          <h1 className="font-display italic text-[28px] text-charcoal leading-tight">The Circle</h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'rgba(44,41,38,0.6)' }}>
            Your circles of sisterhood
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ background: 'var(--amina-warm-ivory)', borderTop: '2px solid var(--amina-muted-gold)' }}
              />
            ))}
          </div>
        ) : circles.length === 0 ? (
          <EmptyState
            onCreate={() => router.push('/circle/create')}
            onJoin={() => router.push('/circle/join')}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {circles.map(c => (
                <CircleCard
                  key={c.id}
                  circle={c}
                  onClick={() => router.push(`/circle/${c.id}`)}
                />
              ))}
            </div>
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => router.push('/circle/create')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-medium transition-all active:scale-[0.98]"
                style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-border)', color: 'var(--amina-soft-charcoal)' }}
              >
                <Plus size={16} strokeWidth={2} />
                Create a circle
              </button>
              <button
                onClick={() => router.push('/circle/join')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-medium transition-all active:scale-[0.98]"
                style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-border)', color: 'var(--amina-soft-charcoal)' }}
              >
                <Key size={16} strokeWidth={1.5} />
                Join with a code
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
