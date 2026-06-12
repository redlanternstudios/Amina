'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const supabase = createClient()
  const circleId = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
        return
      }
      setUserId(data.user.id)
    })
  }, [router, supabase])

  useEffect(() => {
    let mounted = true

    async function fetchMessages() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('circle_messages')
        .select('*, circle_profiles!user_id(display_name, avatar_url)')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (fetchError) {
        if (mounted) setError(fetchError.message)
      } else if (mounted) {
        setMessages((data || []) as Message[])
      }
      if (mounted) setLoading(false)
    }

    fetchMessages()

    // Real-time subscription
    const channel = supabase.channel(`circle-${circleId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'circle_messages', filter: `circle_id=eq.${circleId}` },
        async (payload) => {
          const { data } = await supabase
            .from('circle_messages')
            .select('*, circle_profiles!user_id(display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages(prev => [...prev, data as Message])
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [circleId, supabase])

  async function sendMessage(e: FormEvent | KeyboardEvent) {
    e.preventDefault()
    if (!input.trim() || !userId || sending) return

    setSending(true)
    try {
      const { error: insertError } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: circleId,
          user_id: userId,
          content: input.trim(),
        })

      if (insertError) throw insertError
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Loading messages…</p>
      </div>
    )
  }

  // ── Error state (no messages loaded) ──
  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-red-500 text-lg font-medium">Could not load messages</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-emerald-600 underline hover:text-emerald-700"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <p className="pt-20 text-center text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.user_id === userId ? 'flex-row-reverse' : ''}`}
            >
              <CircleAvatar
                name={msg.circle_profiles?.display_name || 'User'}
                avatarUrl={msg.circle_profiles?.avatar_url}
                size="sm"
              />
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.user_id === userId
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted'
                }`}
              >
                <p className="text-xs font-semibold opacity-80">
                  {msg.circle_profiles?.display_name || 'Unknown'}
                </p>
                <p className="mt-0.5 text-sm">{msg.content}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="self-end">
                <FaithReactions targetId={msg.id} targetType="message" currentUserId={userId || undefined} />
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — error inline */}
      {error && (
        <p className="text-xs text-red-500 mb-1 px-1">{error}</p>
      )}

      <form
        onSubmit={sendMessage}
        className="flex items-end gap-2 border-t pb-4 pt-3"
      >
        <input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (!sending && input.trim()) sendMessage(e)
            }
          }}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || !userId}
          className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
        >
          {sending ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Sending
            </>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  )
}
