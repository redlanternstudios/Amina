'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Copy, Check } from 'lucide-react'

const TOPICS = [
  'Faith & Worship',
  'Marriage & Family',
  'Mental Health',
  'Sisterhood',
  'Quran Study',
  'Life Transitions',
  'New Muslims',
]

type StepDotProps = { total: number; current: number }
function StepDots({ total, current }: StepDotProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            background: i === current ? 'var(--amina-primary-action)' : 'var(--amina-rose-selected)',
          }}
        />
      ))}
    </div>
  )
}

export default function CreateCirclePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [intention, setIntention] = useState('')
  const [topic, setTopic] = useState('')
  const [createdCircle, setCreatedCircle] = useState<{ id: string; invite_code: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, intention, topic_tag: topic }),
      })
      const data = await res.json()
      if (data.circle) {
        setCreatedCircle(data.circle)
        setStep(3)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!createdCircle) return
    navigator.clipboard.writeText(createdCircle.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canNext = [
    name.trim().length >= 2,
    intention.trim().length >= 10,
    topic !== '',
  ]

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ background: 'var(--amina-soft-cream)' }}
    >
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-4">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(s => s - 1))}
          aria-label="Go back"
          className="w-9 h-9 flex items-center justify-center rounded-full mr-3"
          style={{ background: 'var(--amina-warm-ivory)', border: '1px solid var(--amina-hairline)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: 'var(--amina-soft-charcoal)' }} />
        </button>
        <div className="flex-1 flex justify-center pr-9">
          <StepDots total={4} current={step} />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6 pb-10">

        {/* Step 0 — Name */}
        {step === 0 && (
          <div className="flex flex-col flex-1">
            <h1 className="font-display italic text-[24px] text-charcoal mb-1 text-balance leading-snug">
              What will you call this circle?
            </h1>
            <p className="text-[13px] mb-8" style={{ color: 'rgba(44,41,38,0.5)' }}>
              Give it a name that feels like a warm invitation.
            </p>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              placeholder="Sisters in Motherhood, Healing Hearts, Friday Study..."
              className="w-full bg-transparent text-[17px] text-charcoal outline-none placeholder:text-[rgba(44,41,38,0.35)] pb-2"
              style={{
                borderBottom: '2px solid var(--amina-muted-gold)',
                fontFamily: 'var(--font-inter)',
              }}
            />
            <div className="mt-auto pt-10">
              <button
                disabled={!canNext[0]}
                onClick={() => setStep(1)}
                className="btn-primary w-full disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Intention */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <h1 className="font-display italic text-[24px] text-charcoal mb-1 text-balance leading-snug">
              What is your intention for this circle?
            </h1>
            <p className="text-[13px] mb-8" style={{ color: 'rgba(44,41,38,0.5)' }}>
              One sentence. This becomes the soul of your space.
            </p>
            <textarea
              autoFocus
              value={intention}
              onChange={e => setIntention(e.target.value.slice(0, 150))}
              rows={3}
              placeholder="A place for mothers to support each other through the beautiful struggle..."
              className="w-full bg-transparent text-[16px] text-charcoal outline-none resize-none placeholder:text-[rgba(44,41,38,0.35)] pb-2 leading-relaxed"
              style={{
                borderBottom: '2px solid var(--amina-muted-gold)',
                fontFamily: 'var(--font-inter)',
              }}
            />
            <p className="text-[12px] mt-2 text-right" style={{ color: 'rgba(44,41,38,0.35)' }}>
              {intention.length} / 150
            </p>
            <div className="mt-auto pt-8">
              <button
                disabled={!canNext[1]}
                onClick={() => setStep(2)}
                className="btn-primary w-full disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Topic */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <h1 className="font-display italic text-[24px] text-charcoal mb-1 text-balance leading-snug">
              Choose a topic
            </h1>
            <p className="text-[13px] mb-6" style={{ color: 'rgba(44,41,38,0.5)' }}>
              This helps sisters find circles that resonate with them.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="rounded-2xl px-4 py-3.5 text-[14px] font-medium text-left transition-all active:scale-[0.97]"
                  style={{
                    background: topic === t ? 'var(--amina-dusty-rose, #D6AAA3)' : 'var(--amina-warm-ivory)',
                    color: topic === t ? '#fff' : 'var(--amina-soft-charcoal)',
                    border: topic === t
                      ? '1px solid var(--amina-dusty-rose, #D6AAA3)'
                      : '1px solid var(--amina-hairline)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-8">
              <button
                disabled={!canNext[2] || loading}
                onClick={handleCreate}
                className="btn-primary w-full disabled:opacity-40"
              >
                {loading ? 'Creating your circle...' : 'Create my circle'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && createdCircle && (
          <div className="flex flex-col flex-1 items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'var(--amina-rose-selected)' }}
            >
              <span className="font-display italic text-3xl" style={{ color: 'var(--amina-primary-action)' }}>C</span>
            </div>
            <h1 className="font-display italic text-[28px] text-charcoal mb-2 text-balance">
              Your circle is ready.
            </h1>
            <p className="text-[14px] mb-8 text-balance" style={{ color: 'rgba(44,41,38,0.55)' }}>
              Share this code with sisters you trust.
            </p>

            {/* Code box */}
            <div
              className="w-full rounded-2xl flex flex-col items-center py-6 px-4 mb-3"
              style={{
                border: '2px solid var(--amina-muted-gold)',
                background: 'var(--amina-warm-ivory)',
              }}
            >
              <p className="font-display italic text-[42px] tracking-[0.18em] text-charcoal leading-none select-all">
                {createdCircle.invite_code}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-3 mb-6 text-[14px] font-medium transition-all"
              style={{
                background: copied ? 'var(--amina-rose-selected)' : 'var(--amina-warm-ivory)',
                border: '1px solid var(--amina-border)',
                color: 'var(--amina-soft-charcoal)',
              }}
            >
              {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
              {copied ? 'Copied!' : 'Copy code'}
            </button>

            <p className="text-[12px] mb-10" style={{ color: 'rgba(44,41,38,0.4)' }}>
              Only women with this code can join. You can reset it anytime.
            </p>

            <button
              onClick={() => router.push(`/circle/${createdCircle.id}`)}
              className="btn-primary w-full"
            >
              Enter my circle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
