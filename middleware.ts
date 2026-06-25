import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes — reachable without a session.
// Onboarding stays public so first-time signup can complete.
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
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
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

  // Signed-in user hitting the marketing/auth/welcome entry -> straight to home.
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
  // Skip Next internals, static assets, and API routes (APIs do their own auth).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
  ],
}
