'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FaithReactions from '@/components/circle/FaithReactions'
import CircleAvatar from '@/components/circle/CircleAvatar'

interface Message {
  id: string
  circle_id: string
  user_id: string
  content: string
  created_at: string
  circle_profiles?: { display_name?: string; avatar_url?: string }
}

export default function CircleChatPage() {
  const params = useParams()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
  }, [])

  const loadMessages = useCallback(async () => {
    const id = params.id as string
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/circles/${id}/messages`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to load messages')
      }
      const data: Message[] = await response.json()
      setMessages(data)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Realtime subscription
  useEffect(() => {
    const id = params.id as string
    const channel = supabase.channel(`circle-${id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'circle_messages', filter: `circle_id=eq.${id}` },
        async (payload) => {
          try {
            const response = await fetch(`/api/circles/${id}/messages`)
            if (response.ok) {
              const data: Message[] = await response.json()
              const newMsg = data.find(m => m.id === payload.new.id)
              if (newMsg) {
                setMessages(prev => [...prev, newMsg])
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
              }
            }
          } catch { /* silent */ }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  async function sendMessage() {
    if (!input.trim() || !userId) return
    setSendError(null)
    try {
      const response = await fetch(`/api/circles/${params.id as string}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to send message')
      }
      setInput('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send')
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto space-y-3 p-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-charcoal/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 bg-charcoal/10 rounded w-16 animate-pulse" />
                <div className={`h-10 bg-charcoal/10 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-center px-4">
        <span className="text-3xl mb-2" role="img" aria-hidden="true">⚠️</span>
        <p className="font-semibold text-red-600 text-sm">Failed to load messages</p>
        <p className="text-charcoal/50 text-xs mt-1 max-w-[260px]">{error}</p>
        <button onClick={loadMessages} className="mt-3 border border-rose-amina text-rose-amina text-xs font-semibold px-4 py-1.5 rounded-full active:opacity-80">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-charcoal/50 text-sm">No messages yet</p>
            <p className="text-charcoal/30 text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.user_id === userId ? 'flex-row-reverse' : ''}`}>
              <CircleAvatar
                name={msg.circle_profiles?.display_name || 'User'}
                avatarUrl={msg.circle_profiles?.avatar_url}
                size="sm"
              />
              <div className={`max-w-[75%] ${msg.user_id === userId ? 'items-end' : ''}`}>
                <p className="text-xs text-gray-400 mb-0.5">
                  {msg.circle_profiles?.display_name || 'Unknown'}
                </p>
                <div className={`rounded-2xl px-3 py-2 text-sm ${
                  msg.user_id === userId ? 'bg-emerald-500 text-white' : 'bg-gray-100'
                }`}>
                  {msg.content}
                </div>
                <FaithReactions
                  targetId={msg.id}
                  targetType="message"
                  currentUserId={userId || undefined}
                  compact
                />
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <div className="px-3 pb-1">
          <p className="text-xs text-red-500">{sendError}</p>
        </div>
      )}

      <div className="flex gap-2 p-3 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
