/**
 * lib/supabase/chat.ts
 * Chat persistence layer — connects UI to public.conversations + public.messages
 * Canonical tables per 001_initial_schema.sql
 * Fixes Track B bug: both chat pages used in-memory state only, never queried Supabase.
 */
import { createClient } from '@/lib/supabase/client'

export interface DBConversation {
  id: string
  user_id: string
  title: string | null
  topic_tag: string | null
  created_at: string
  updated_at: string
}

export interface DBMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

/** Create a new conversation for the current user. Pass `id` to pin it to a specific UUID (e.g. from the URL). */
export async function createConversation(id?: string, title?: string, topicTag?: string): Promise<DBConversation> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? getUserIdFromCookie()
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('amina_conversations')
    .insert({
      ...(id ? { id } : {}),
      user_id: userId,
      title: title ?? null,
      topic_tag: topicTag ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Load all conversations for the current user, newest first */
export async function listConversations(): Promise<DBConversation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('amina_conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/** Load messages for a conversation */
export async function loadMessages(conversationId: string): Promise<DBMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('amina_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Parse the user ID directly from the Supabase auth cookie JWT payload.
 * createBrowserClient's getUser() fails in Next 14 with ssr 0.1.0 because
 * it cannot parse the URL-encoded JSON cookie blob it writes itself.
 */
function getUserIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
    if (!match) return null
    const blob = JSON.parse(decodeURIComponent(match[1]))
    const jwt = blob?.access_token
    if (!jwt) return null
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.sub ?? null
  } catch {
    return null
  }
}

/** Save a single message to the DB */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<DBMessage> {
  const supabase = createClient()

  // Prefer getUser(), fall back to cookie-parsed uid
  let userId: string | null = null
  const { data: { user } } = await supabase.auth.getUser()
  userId = user?.id ?? getUserIdFromCookie()
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('amina_messages')
    .insert({ conversation_id: conversationId, user_id: userId, role, content })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Get or create today's default conversation for a user */
export async function getOrCreateDefaultConversation(): Promise<DBConversation> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('amina_conversations')
    .select('*')
    .gte('created_at', `${today}T00:00:00Z`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing
  return createConversation(undefined, 'Chat with Amina')
}
