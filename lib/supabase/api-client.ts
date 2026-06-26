/**
 * Creates a Supabase client for API routes that accepts a Bearer token
 * from the Authorization header. This bypasses the SSR cookie parsing
 * issue with createBrowserClient's URL-encoded JSON cookie format.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createApiClient(authHeader: string | null) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  return {
    client: createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token
        ? { global: { headers: { Authorization: `Bearer ${token}` } } }
        : undefined
    ),
    token,
  }
}

export async function getApiUser(authHeader: string | null) {
  const { client, token } = createApiClient(authHeader)
  if (token) {
    const { data, error } = await client.auth.getUser(token)
    return { user: data?.user ?? null, client, error }
  }
  // No token — unauthenticated
  return { user: null, client, error: null }
}
