/**
 * Auth helper for API routes that accept a Bearer token.
 *
 * Uses the service role key to validate the JWT (getUser requires it for
 * arbitrary tokens), then returns a per-user anon client so RLS policies
 * still apply to all subsequent queries.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getApiUser(authHeader: string | null) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return { user: null, client: null, error: null }

  // Validate the JWT using the service role (required for getUser with arbitrary tokens)
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return { user: null, client: null, error }

  // Build a per-user anon client so RLS still applies to all DB queries
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  return { user: data.user, client, error: null }
}
