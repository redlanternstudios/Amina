'use client'

import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  MosqueCard,
  MosqueCardSkeleton,
  MosqueCardError,
  MosqueSearchPrompt,
  MosqueEmptyState,
  type Mosque,
} from '@/components/chat/MosqueCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ConversationState = 'normal' | 'fiqh_referral' | 'mosque_search' | 'location_pending' | 'mosque_results'

const QUICK_CHIPS = [
  { id: 'reflect', label: '🧘 Help me reflect' },
  { id: 'reminder', label: '🔔 Give me a reminder' },
  { id: 'dua', label: '🤲 Make du\'a for me' },
  { id: 'quran', label: '📖 Quranic guidance' },
]

// ── Mosque query detection ──

const MOSQUE_KEYWORDS = [
  'mosque', 'masjid', 'musallah', 'prayer near', 'nearby mosque',
  'place to pray', 'islamic center', 'find a mosque',
]

function isMosqueQuery(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return MOSQUE_KEYWORDS.some(keyword => lower.includes(keyword))
}

// ── Main component ──

function ChatInner() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const supabase = createClient()

  // Core state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Mosque / conversation state
  const [conversationState, setConversationState] = useState<ConversationState>('normal')
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [isSearchingMosques, setIsSearchingMosques] = useState(false)
  const [mosqueError, setMosqueError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // ── Helpers ──

  const fetchMosques = useCallback(async (lat?: number, lng?: number) => {
    setIsSearchingMosques(true)
    setMosqueError(null)

    try {
      const params = new URLSearchParams()
      if (lat !== undefined && lng !== undefined) {
        params.set('lat', String(lat))
        params.set('lng', String(lng))
      }

      const res = await fetch(`/api/mosques?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch mosques')

      const data: Mosque[] = await res.json()
      setMosques(data)
      setConversationState(data.length > 0 ? 'mosque_results' : 'normal')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load nearby mosques.'
      setMosqueError(msg)
      setConversationState('mosque_results')
    } finally {
      setIsSearchingMosques(false)
    }
  }, [])

  const handleShareLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      // Fallback — no geolocation support, fetch without location
      fetchMosques()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(coords)
        fetchMosques(coords.lat, coords.lng)
      },
      () => {
        // Permission denied or error — fetch without location
        fetchMosques()
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [fetchMosques])

  const handleSkipLocation = useCallback(() => {
    fetchMosques()
  }, [fetchMosques])

  const handleMosqueSelect = useCallback((id: string) => {
    const mosque = mosques.find(m => m.id === id)
    if (mosque?.phone) {
      window.location.href = `tel:${mosque.phone}`
    }
  }, [mosques])

  const handleGetDirections = useCallback((lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [])

  // ── Init conversation ──

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }
      setUserId(user.id)

      // Ensure conversation exists; create if not
      const { data: conv } = await supabase
        .from('amina_conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!conv) {
        await supabase
          .from('amina_conversations')
          .insert({ id: conversationId, user_id: user.id, title: 'New conversation' })
      }

      // Load existing messages
      const { data: rows } = await supabase
        .from('amina_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (rows && rows.length > 0) {
        setMessages(rows.map(r => ({
          id: r.id,
          role: r.role as 'user' | 'assistant',
          content: r.content,
          timestamp: new Date(r.created_at),
        })))
      } else {
        // Seed the opening greeting
        setMessages([{
          id: 'greeting',
          role: 'assistant',
          content: 'As-salamu alaykum, sister ♥️\nHow can I support you today?',
          timestamp: new Date(),
        }])
      }

      setIsInitializing(false)
    }
    init()
  }, [conversationId, supabase, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSearchingMosques])

  // ── Persistence ──

  async function saveMessage(role: 'user' | 'assistant', content: string): Promise<string> {
    const { data } = await supabase
      .from('amina_messages')
      .insert({ conversation_id: conversationId, user_id: userId, role, content })
      .select('id')
      .single()
    return data?.id ?? Date.now().toString()
  }

  // ── Send message ──

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading || !userId) return
    setError(null)

    // Detect mosque query
    if (isMosqueQuery(text)) {
      setConversationState('location_pending')
    }

    const savedUserId = await saveMessage('user', text.trim())
    const userMsg: Message = {
      id: savedUserId,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Update conversation timestamp
    await supabase
      .from('amina_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          conversationState,
        }),
      })

      if (res.status === 429) {
        setError('Taking a breath... please try again in a moment.')
        setIsLoading(false)
        return
      }
      if (!res.ok) throw new Error('Response error')

      const data = await res.json()
      const savedAssistantId = await saveMessage('assistant', data.content)
      setMessages(prev => [
        ...prev,
        { id: savedAssistantId, role: 'assistant', content: data.content, timestamp: new Date() },
      ])

      // If the assistant response indicates fiqh referral, update state
      if (data.conversationState) {
        setConversationState(data.conversationState)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Render inline mosque content within messages ──

  function renderMessageContent(msg: Message) {
    const isLastAssistant = msg.role === 'assistant' && messages.indexOf(msg) === messages.length - 1

    return (
      <>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

        {/* Location permission prompt */}
        {isLastAssistant && conversationState === 'location_pending' && (
          <div className="mt-3">
            <MosqueSearchPrompt
              onShareLocation={handleShareLocation}
              onSkip={handleSkipLocation}
            />
          </div>
        )}

        {/* Loading skeletons */}
        {isLastAssistant && isSearchingMosques && (
          <div className="mt-3 flex flex-col gap-3">
            <MosqueCardSkeleton />
            <MosqueCardSkeleton />
          </div>
        )}

        {/* Error state */}
        {isLastAssistant && conversationState === 'mosque_results' && mosqueError && !isSearchingMosques && (
          <div className="mt-3">
            <MosqueCardError
              message={mosqueError}
              onRetry={userLocation ? () => fetchMosques(userLocation.lat, userLocation.lng) : fetchMosques}
            />
          </div>
        )}

        {/* Empty state */}
        {isLastAssistant && conversationState === 'mosque_results' && !isSearchingMosques && !mosqueError && mosques.length === 0 && (
          <div className="mt-3">
            <MosqueEmptyState />
          </div>
        )}

        {/* Mosque results as cards */}
        {isLastAssistant && conversationState === 'mosque_results' && !isSearchingMosques && !mosqueError && mosques.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {mosques.map(mosque => (
              <MosqueCard
                key={mosque.id}
                mosque={mosque}
                onSelect={handleMosqueSelect}
                onDirections={handleGetDirections}
              />
            ))}
          </div>
        )}

        {/* Fallback CTA for fiqh referral (no mosque flow) */}
        {isLastAssistant && conversationState === 'fiqh_referral' && !isSearchingMosques && mosques.length === 0 && (
          <div className="mt-3 flex flex-col gap-2">
            <button className="w-full text-xs font-medium text-white bg-rose-amina rounded-full py-2.5 hover:bg-rose-amina/90 transition-colors">
              🕌 Find a mosque near me
            </button>
            <button className="w-full text-xs font-medium text-rose-amina border border-rose-amina/30 rounded-full py-2.5 hover:bg-rose-amina/5 transition-colors">
              📚 Continue in Fiqh Companion
            </button>
          </div>
        )}

        <p className={`text-xs mt-1 ${
          msg.role === 'user' ? 'text-white/60' : 'text-charcoal/30'
        }`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </>
    )
  }

  // ── Loading screen ──

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">🌙</span>
          <p className="text-charcoal/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // ── Render ──

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-cream border-b border-charcoal/5">
        <button onClick={() => router.back()} className="text-charcoal/60 text-2xl">‹</button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-full bg-rose-amina flex items-center justify-center">
            <span className="text-white">🌙</span>
          </div>
          <div>
            <p className="font-semibold text-charcoal text-sm">Amina</p>
            <p className="text-charcoal/40 text-xs">Faith companion</p>
          </div>
        </div>
        <button className="text-charcoal/40">…</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-rose-amina flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-white text-xs">🌙</span>
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-rose-amina text-white rounded-tr-sm'
                : 'bg-ivory text-charcoal rounded-tl-sm'
            }`}>
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-rose-amina flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-xs">🌙</span>
            </div>
            <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-charcoal/20 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-amina/10 border border-rose-amina/20 rounded-xl px-4 py-3 text-center">
            <p className="text-rose-amina text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-charcoal/40 text-xs mt-1">Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => sendMessage(chip.label.replace(/^[\S]+ /, ''))}
              className="chip flex-shrink-0 text-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 border-t border-charcoal/5">
        <div className="flex items-center gap-2 bg-ivory rounded-full px-4 py-2.5 border border-charcoal/10">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Message Amina..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-rose-amina flex items-center justify-center disabled:opacity-40"
          >
            <span className="text-white text-sm">↑</span>
          </button>
        </div>
        <p className="text-center text-xs text-charcoal/30 mt-2">
          Amina can make mistakes. Please review important information.
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-dvh bg-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">🌙</span>
          <p className="text-charcoal/40 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <ChatInner />
    </Suspense>
  )
}
