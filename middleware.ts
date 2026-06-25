import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes — reachable without a session.
const PUBLIC_PREFIXES = ['/auth', '/welcome', '/onboarding', '/terms', '/privacy']
// Signed-in users should be bounced away from these entry points.
const ENTRY_REDIRECT = ['/auth', '/welcome']

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return req.cookies.get(key)?.value ?? null
        },
        set(key: string, value: string, options: CookieOptions) {
          req.cookies.set(key, value)
          res = NextResponse.next({ request: req })
          res.cookies.set(key, value, options)
        },
        remove(key: string, options: CookieOptions) {
          req.cookies.delete(key)
          res = NextResponse.next({ request: req })
          res.cookies.set(key, '', options)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname

  const isPublic =
    path === '/' ||
    PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))
  const isEntry = ENTRY_REDIRECT.some((p) => path === p || path.startsWith(p + '/'))

  // Signed-in user hitting marketing/auth/welcome entry -> home.
  if (user && (path === '/' || isEntry)) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Unauthenticated user hitting a protected app page -> /auth with return path.
  if (!user && !isPublic) {
    const url = new URL('/auth', req.url)
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Skip Next internals, static assets, and API routes.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
  ],
}
