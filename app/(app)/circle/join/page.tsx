'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

type CirclePreview = {
  id: string
  name: string
  intention: string
  topic_tag: string
  member_count: number
  max_members: number
  spots_remaining: number
}

const TOPIC_COLORS: Record<string, string> = {
  'Faith & Worship': '#D6AAA3',
  'Marriage & Family': '#C4B5A0',
  'Mental Health': '#A8B89A',
  'Sisterhood': '#D6AAA3',
  'Quran Study': '#C4B5A0',
  'Life Transitions': '#B8A99A',
  'New Muslims': '#A8B89A',
}

export default function JoinCirclePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [preview, setPreview] = useState<CirclePreview | null>(null)
  const [error, setError] = useState('')
  const [isFull, setIsFull] = useState(false)
  const [joining, setJoining] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCodeChange(val: string) {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    setCode(cleaned)
    setError('')
    setPreview(null)
    setIsFull(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (cleaned.length === 8) {
      debounceRef.current = setTimeout(() => fetchPreview(cleaned), 400)
    }
  }

  async function fetchPreview(c: string) {
    const res = await fetch(`/api/circles/preview?code=${c}`)
    const data = await res.json()
    if (data.circle) {
      setPreview(data.circle)
      setIsFull(data.circle.spots_remaining <= 0)
    } else {
      setError('No circle found with that code, sister.')
    }
  }

  async function handleJoin() {
    if (!preview || joining || isFull) return
    setJoining(true)
    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code }),
      })
      const data = await res.json()
      if (data.circle) {
        router.push(`/circle/${data.circle.id}`)
      } else {
        setError(data.error ?? 'Something went wrong, sister. Please try again.')
      }
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6">
        <h1 className="font-display italic text-[26px] text-charcoal mb-1 leading-snug">
          Join a circle
        </h1>
        <p className="text-[14px] mb-8" style={{ color: 'rgba(44,41,38,0.55)' }}>
          Enter the code shared with you by a sister.
        </p>

        {/* Code input */}
        <div className="flex flex-col items-center mb-8">
          <input
            autoFocus
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            maxLength={8}
            placeholder="XXXXXXXX"
            inputMode="text"
            autoCapitalize="characters"
            className="w-full text-center text-[32px] tracking-[0.22em] font-display bg-transparent outline-none text-charcoal placeholder:text-[rgba(44,41,38,0.22)] pb-2 transition-all"
            style={{
              borderBottom: code.length === 8 && !error
                ? '2px solid var(--amina-muted-gold)'
                : code.length > 0
                  ? '2px solid var(--amina-border)'
                  : '2px solid var(--amina-hairline)',
            }}
          />
          {code.length > 0 && code.length < 8 && (
            <p className="text-[12px] mt-2" style={{ color: 'rgba(44,41,38,0.4)' }}>
              {8 - code.length} more character{8 - code.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-[14px] mb-6" style={{ color: 'var(--amina-primary-action)' }}>
            {error}
          </p>
        )}

        {/* Preview card */}
        {preview && !error && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'var(--amina-warm-ivory)',
              borderTop: '2px solid var(--amina-muted-gold)',
              borderLeft: '1px solid var(--amina-hairline)',
              borderRight: '1px solid var(--amina-hairline)',
              borderBottom: '1px solid var(--amina-hairline)',
              boxShadow: '0 1px 4px rgba(44,41,38,0.06)',
            }}
          >
            <p className="font-display italic text-[20px] text-charcoal mb-2 leading-tight">
              {preview.name}
            </p>
            <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'rgba(44,41,38,0.6)' }}>
              {preview.intention}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full text-white"
                style={{ background: TOPIC_COLORS[preview.topic_tag] ?? '#D6AAA3' }}
              >
                {preview.topic_tag}
              </span>
              <span className="text-[12px]" style={{ color: 'rgba(44,41,38,0.5)' }}>
                {preview.member_count} sisters
              </span>
              {preview.spots_remaining <= 5 && preview.spots_remaining > 0 && (
                <span className="text-[12px]" style={{ color: 'var(--amina-primary-action)' }}>
                  {preview.spots_remaining} spot{preview.spots_remaining !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
          </div>
        )}

        {/* Full message */}
        {isFull && (
          <p className="text-center text-[14px] mb-6 px-2" style={{ color: 'rgba(44,41,38,0.55)' }}>
            This circle is full, sister. Ask the creator to increase the limit.
          </p>
        )}

        {/* Join button */}
        {preview && !isFull && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn-primary w-full disabled:opacity-40"
          >
            {joining ? 'Joining...' : 'Join this circle'}
          </button>
        )}
      </div>
    </div>
  )
}
