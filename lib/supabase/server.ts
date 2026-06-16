import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // createBrowserClient URL-encodes cookie values; decode them so
          // createServerClient can parse the JSON session blob.
          return cookieStore.getAll().map(({ name, value }) => {
            try {
              return { name, value: decodeURIComponent(value) }
            } catch {
              return { name, value }
            }
          })
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — ignored
          }
        },
      },
    }
  )
}
