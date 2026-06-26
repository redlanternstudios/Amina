'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search } from 'lucide-react'

const TOPICS = ['All', 'Faith & Worship', 'Marriage & Family', 'Mental Health', 'Sisterhood', 'Quran Study', 'Life Transitions', 'New Muslims']

const TOPIC_COLORS: Record<string, string> = {
  'Faith & Worship': '#D6AAA3',
  'Marriage & Family': '#C4B5A0',
  'Mental Health': '#A8B89A',
  'Sisterhood': '#D6AAA3',
  'Quran Study': '#C4B5A0',
  'Life Transitions': '#B8A99A',
  'New Muslims': '#A8B89A',
}

type Circle = {
  id: string
  name: string
  intention: string
  topic_tag: string
  member_count: number
  max_members: number
  is_full: boolean
}

function BrowseCard({ circle, onJoin }: { circle: Circle; onJoin: () => void }) {
  const chipColor = TOPIC_COLORS[circle.topic_tag] ?? '#D6AAA3'
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: 'var(--amina-warm-ivory)',
        borderTop: '2px solid var(--amina-muted-gold)',
        borderLeft: '1px solid var(--amina-hairline)',
        borderRight: '1px solid var(--amina-hairline)',
        borderBottom: '1px solid var(--amina-hairline)',
        boxShadow: '0 1px 4px rgba(44,41,38,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display italic text-[18px] text-charcoal leading-tight flex-1">
          {circle.name}
        </p>
        <span
          className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full text-white flex-shrink-0 mt-0.5"
          style={{ background: chipColor }}
        >
          {circle.topic_tag}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'rgba(44,41,38,0.6)' }}>
        {circle.intention}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[12px]" style={{ color: 'rgba(44,41,38,0.5)' }}>
          {circle.member_count} of {circle.max_members} sisters
        </span>
        {circle.is_full ? (
          <span className="text-[12px]" style={{ color: 'rgba(44,41,38,0.35)' }}>Full</span>
        ) : (
          <button
            onClick={onJoin}
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'var(--amina-primary-action)', color: '#fff' }}
          >
            Join
          </button>
        )}
      </div>
    </div>
  )
}

export default function BrowseCirclesPage() {
  const router = useRouter()
  const [activeTopic, setActiveTopic] = useState('All')
  const [circles, setCircles] = useState<Circle[]>([])
  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = activeTopic === 'All'
      ? '/api/circles/browse'
      : `/api/circles/browse?topic=${encodeURIComponent(activeTopic)}`
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const allCircles = d.circles ?? []
        setCircles(allCircles)
        filterCircles(allCircles, search)
      })
      .finally(() => setLoading(false))
  }, [activeTopic])

  useEffect(() => {
    filterCircles(circles, search)
  }, [search, circles])

  function filterCircles(allCircles: Circle[], searchTerm: string) {
    const filtered = allCircles.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.intention.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCircles(filtered)
  }

  function handleJoin(circle: Circle) {
    // Pre-fill the join page via URL — just navigate to join
    router.push('/circle/join')
  }

  return (
    <div className="flex flex-col min-h-dvh pb-10" style={{ background: 'var(--amina-soft-cream)' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-4">
        <button
          onClick={() => router.push('/circle')}
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center rounded-full mr-3"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <h1 className="font-display italic text-[26px] text-charcoal leading-tight">Find a circle</h1>
        <p className="text-[14px] mt-1" style={{ color: 'rgba(44,41,38,0.55)' }}>
          These circles are open to new sisters.
        </p>
      </div>

      {/* Search box */}
      <div className="px-4 mb-4 relative">
        <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2" style={{ color: 'rgba(44,41,38,0.4)' }} />
        <input
          type="text"
          placeholder="Search circles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border"
          style={{ borderColor: 'var(--amina-hairline)', background: 'var(--amina-warm-ivory)' }}
        />
      </div>

      {/* Topic filter — horizontal scroll */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar flex-shrink-0">
        {TOPICS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTopic(t)}
            className="rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: activeTopic === t ? 'var(--amina-primary-action)' : 'var(--amina-warm-ivory)',
              color: activeTopic === t ? '#fff' : 'var(--amina-soft-charcoal)',
              border: activeTopic === t ? '1px solid var(--amina-primary-action)' : '1px solid var(--amina-hairline)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 px-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl h-28 animate-pulse"
                style={{ background: 'var(--amina-warm-ivory)', borderTop: '2px solid var(--amina-muted-gold)' }}
              />
            ))}
          </div>
        ) : filteredCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-display italic text-[20px] text-charcoal mb-2">
              {search ? 'No circles match your search.' : 'No open circles yet, sister.'}
            </p>
            <p className="text-[14px] mb-8" style={{ color: 'rgba(44,41,38,0.5)' }}>
              {search ? 'Try a different search term.' : 'Be the first to create one in this topic.'}
            </p>
            {!search && (
              <button
                onClick={() => router.push('/circle/create')}
                className="btn-primary"
              >
                Create a circle
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredCircles.map(c => (
              <BrowseCard key={c.id} circle={c} onJoin={() => handleJoin(c)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
