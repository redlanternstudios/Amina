'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus, X } from 'lucide-react'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/BottomNav'

interface DuaPost {
  id: string
  content: string
  created_at: string
  is_answered: boolean
  ameen_count: number
  user_has_ameened: boolean
  user_initial: string
}

const HADITH_QUOTES = [
  { text: 'Indeed, Allah is near and responsive.', source: 'Quran 2:186' },
  { text: 'Call upon Me; I will respond to you.', source: 'Quran 40:60' },
  { text: 'Do not despair of Allah\'s mercy.', source: 'Quran 39:53' },
  { text: 'Allah does not burden a soul except with that which it can bear.', source: 'Quran 2:286' },
  { text: 'Verily, with hardship comes ease.', source: 'Quran 94:5' },
]

const SAMPLE_DUAS = [
  {
    id: '1',
    content: 'Ya Allah, guide me to the right path and grant me wisdom in my decisions.',
    created_at: '2 hours ago',
    is_answered: false,
    ameen_count: 23,
    user_has_ameened: false,
    user_initial: 'F',
  },
  {
    id: '2',
    content: 'Please make it easy for me to maintain my prayers and bring me closer to You.',
    created_at: '5 hours ago',
    is_answered: true,
    ameen_count: 45,
    user_has_ameened: true,
    user_initial: 'A',
  },
  {
    id: '3',
    content: 'Grant me patience and help me trust Your plan, even when I cannot see the way.',
    created_at: '1 day ago',
    is_answered: false,
    ameen_count: 67,
    user_has_ameened: false,
    user_initial: 'M',
  },
]

export default function DuaWallPage() {
  const [duas, setDuas] = useState<DuaPost[]>(SAMPLE_DUAS)
  const [loading, setLoading] = useState(false)
  const [showWriteSheet, setShowWriteSheet] = useState(false)
  const [duaText, setDuaText] = useState('')

  function toggleAmeen(id: string) {
    setDuas(prev =>
      prev.map(dua => {
        if (dua.id === id) {
          return {
            ...dua,
            user_has_ameened: !dua.user_has_ameened,
            ameen_count: dua.user_has_ameened ? dua.ameen_count - 1 : dua.ameen_count + 1,
          }
        }
        return dua
      })
    )
  }

  function submitDua() {
    if (!duaText.trim()) return
    const newDua: DuaPost = {
      id: crypto.randomUUID(),
      content: duaText,
      created_at: 'Just now',
      is_answered: false,
      ameen_count: 0,
      user_has_ameened: false,
      user_initial: 'Y',
    }
    setDuas(prev => [newDua, ...prev])
    setDuaText('')
    setShowWriteSheet(false)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      <AppHeader title="Du'a Wall" />

      {/* Hadith Quote Banner */}
      <div className="mx-4 mt-4 p-4 rounded-lg" style={{ background: 'var(--amina-warm-highlight)' }}>
        <p className="text-sm italic text-charcoal/80 mb-2">{HADITH_QUOTES[0].text}</p>
        <p className="text-xs text-charcoal/60">{HADITH_QUOTES[0].source}</p>
      </div>

      {/* Du'a Feed */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {duas.map(dua => (
          <div
            key={dua.id}
            className="p-4 rounded-lg"
            style={{ background: 'var(--amina-card-bg)', border: '1px solid var(--amina-hairline)' }}
          >
            {/* Header with avatar and answered badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#D92532' }}
                >
                  {dua.user_initial}
                </div>
                <span className="text-xs text-muted">{dua.created_at}</span>
              </div>
              {dua.is_answered && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#D92532', color: '#F7F2EE' }}>
                  Answered
                </span>
              )}
            </div>

            {/* Du'a content */}
            <p className="text-sm text-charcoal leading-relaxed mb-4">{dua.content}</p>

            {/* Ameen button and count */}
            <button
              onClick={() => toggleAmeen(dua.id)}
              className="flex items-center gap-2 text-sm font-medium transition-all"
              style={{
                color: dua.user_has_ameened ? '#D92532' : 'var(--amina-muted-text)',
              }}
            >
              <Heart size={16} fill={dua.user_has_ameened ? '#D92532' : 'none'} />
              <span>Ameen ({dua.ameen_count})</span>
            </button>
          </div>
        ))}
      </div>

      {/* Write Sheet Modal */}
      {showWriteSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl p-6" style={{ background: 'var(--amina-card-bg)' }}>
            {/* Drag handle */}
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-1 rounded-full mx-auto" style={{ background: 'var(--amina-border)' }} />
              <button
                onClick={() => setShowWriteSheet(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-charcoal mb-4">Share your du'a</h2>

            <textarea
              value={duaText}
              onChange={(e) => setDuaText(e.target.value)}
              placeholder="What are you praying for? Your du'a will be shared anonymously with the circle."
              className="w-full p-3 rounded-lg border mb-4 resize-none focus:outline-none"
              style={{
                borderColor: 'var(--amina-border)',
                minHeight: '120px',
              }}
              maxLength={280}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowWriteSheet(false)}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ background: 'var(--amina-hairline)', color: 'var(--amina-muted-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={submitDua}
                disabled={!duaText.trim()}
                className="flex-1 py-2.5 rounded-lg font-medium text-white"
                style={{ background: duaText.trim() ? '#D92532' : '#D9253266' }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowWriteSheet(true)}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
        style={{ background: '#D92532' }}
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      <BottomNav />
    </div>
  )
}
