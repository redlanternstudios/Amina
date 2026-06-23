'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Plus, X } from 'lucide-react'

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

export default function DuaWallPage() {
  const [duas, setDuas] = useState<DuaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteSheet, setShowWriteSheet] = useState(false)
  const [duaText, setDuaText] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadDuas()
  }, [])

  async function loadDuas() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: posts, error } = await supabase
        .from('dua_wall_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Get ameen counts and user's ameens
      const { data: ameens } = await supabase
        .from('dua_ameens')
        .select('dua_id, user_id')

      const ameenMap = new Map<string, number>()
      const userAmeenedSet = new Set<string>()
      
      ameens?.forEach(ameen => {
        ameenMap.set(ameen.dua_id, (ameenMap.get(ameen.dua_id) || 0) + 1)
        if (ameen.user_id === user?.id) {
          userAmeenedSet.add(ameen.dua_id)
        }
      })

      const formattedDuas = posts.map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        is_answered: post.is_answered,
        ameen_count: ameenMap.get(post.id) || 0,
        user_has_ameened: userAmeenedSet.has(post.id),
        user_initial: String(Math.floor(Math.random() * 26) + 65),
      }))

      setDuas(formattedDuas)
    } catch (err) {
      console.error('Failed to load duas', err)
    } finally {
      setLoading(false)
    }
  }

  async function submitDua() {
    if (!duaText.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('dua_wall_posts')
        .insert({
          user_id: user.id,
          content: duaText.trim(),
          is_answered: isAnswered,
        })

      if (error) throw error

      setDuaText('')
      setIsAnswered(false)
      setShowWriteSheet(false)
      await loadDuas()
    } catch (err) {
      console.error('Failed to submit dua', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleAmeen(duaId: string, hasAmeened: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (hasAmeened) {
        const { error } = await supabase
          .from('dua_ameens')
          .delete()
          .eq('dua_id', duaId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('dua_ameens')
          .insert({ dua_id: duaId, user_id: user.id })
        if (error) throw error
      }

      await loadDuas()
    } catch (err) {
      console.error('Failed to toggle ameen', err)
    }
  }

  const getRelativeTime = (created: string) => {
    const now = new Date()
    const then = new Date(created)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="relative pb-32" style={{ background: '#07080D', minHeight: '100dvh' }}>
      {/* Header */}
      <div className="pt-6 px-4 pb-4" style={{ background: '#07080D' }}>
        <h1 className="text-3xl font-serif" style={{ color: '#F7F2EE' }}>Du'a Wall</h1>
        <p className="text-sm mt-1" style={{ color: '#8A8A8A' }}>Sisters are praying with you</p>
      </div>

      {/* Du'a Feed */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-8" style={{ color: '#8A8A8A' }}>Loading duas...</div>
        ) : duas.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#8A8A8A' }} className="text-sm">No duas yet. Be the first to share.</p>
          </div>
        ) : (
          duas.map(dua => {
            const quote = HADITH_QUOTES[Math.floor(Math.random() * HADITH_QUOTES.length)]
            return (
              <div key={dua.id} className="rounded-lg p-4" style={{ background: '#111318' }}>
                {/* Post header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: '#D92532', color: '#F7F2EE' }}
                  >
                    {dua.user_initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#F7F2EE' }} className="text-sm font-medium">A sister</p>
                    <p style={{ color: '#8A8A8A' }} className="text-xs">{getRelativeTime(dua.created_at)}</p>
                  </div>
                  {dua.is_answered && (
                    <span className="text-xs px-2 py-1 rounded" style={{ background: '#1E4D2B', color: '#7FE8B5' }}>
                      Answered ✓
                    </span>
                  )}
                </div>

                {/* Du'a content */}
                <p style={{ color: '#F7F2EE' }} className="text-sm leading-relaxed mb-3 line-clamp-3">
                  {dua.content}
                </p>

                {/* Quote */}
                <div
                  className="pl-3 py-2 mb-3 rounded-sm text-xs italic"
                  style={{
                    background: '#0A0B0F',
                    borderLeft: '3px solid #D92532',
                    color: '#F7F2EE',
                  }}
                >
                  "{quote.text}"
                  <br />
                  <span style={{ color: '#8A8A8A' }}>— {quote.source}</span>
                </div>

                {/* Ameen button */}
                <button
                  onClick={() => toggleAmeen(dua.id, dua.user_has_ameened)}
                  className="flex items-center gap-2 text-sm transition-opacity"
                  style={{
                    color: dua.user_has_ameened ? '#D92532' : '#8A8A8A',
                  }}
                >
                  <span>🤲</span>
                  <span>{dua.ameen_count}</span>
                  <span className="text-xs">Ameen</span>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setShowWriteSheet(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: '#D92532', color: '#F7F2EE' }}
      >
        <Plus size={24} />
      </button>

      {/* Write Sheet */}
      {showWriteSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0"
            onClick={() => setShowWriteSheet(false)}
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <div
            className="relative w-full rounded-t-2xl p-6"
            style={{ background: '#111318' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ color: '#F7F2EE' }} className="text-lg font-serif">Share Your Du'a</h2>
              <button
                onClick={() => setShowWriteSheet(false)}
                style={{ color: '#8A8A8A' }}
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={duaText}
              onChange={(e) => setDuaText(e.target.value.slice(0, 280))}
              placeholder="Share your du'a with your sisters..."
              className="w-full p-3 rounded-lg mb-3 text-sm resize-none focus:outline-none"
              style={{
                background: '#07080D',
                color: '#F7F2EE',
              }}
              rows={4}
            />

            <div className="text-xs mb-4" style={{ color: '#8A8A8A' }}>
              {duaText.length}/280 characters
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnswered}
                onChange={(e) => setIsAnswered(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span style={{ color: '#F7F2EE' }} className="text-sm">Mark as answered</span>
            </label>

            <p style={{ color: '#8A8A8A' }} className="text-xs mb-4">
              Posted anonymously to protect your privacy
            </p>

            <button
              onClick={submitDua}
              disabled={submitting || !duaText.trim()}
              className="w-full py-3 rounded-lg font-medium transition-opacity disabled:opacity-50"
              style={{ background: '#D92532', color: '#F7F2EE' }}
            >
              {submitting ? 'Posting...' : 'Post Du\'a'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
