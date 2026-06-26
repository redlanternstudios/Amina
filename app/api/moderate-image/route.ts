/**
 * POST /api/moderate-image
 *
 * Server-side Sightengine proxy. Never expose API keys to client.
 *
 * Body (JSON):
 *   { imageUrl: string }   — public URL or Supabase storage URL
 *
 * Response:
 *   { verdict: 'approved' | 'flagged' | 'rejected', reasons: string[] }
 *
 * Caller responsibilities:
 *   - approved  → proceed with upload / insert
 *   - flagged   → proceed with upload but also insert to moderation_queue
 *   - rejected  → block upload, show error to user
 *
 * Authn: requires valid Supabase session cookie (server-side check).
 * Rate limiting: TODO — add edge rate limiting before launch.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { moderateImageUrl, ModerationResult } from '@/lib/sightengine'

export async function POST(req: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let imageUrl: string
  try {
    const body = await req.json()
    imageUrl = body?.imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Moderate ───────────────────────────────────────────────────────────────
  const result: ModerationResult = await moderateImageUrl(imageUrl)

  // ── Log flagged/rejected items to moderation_queue ─────────────────────────
  if (result.verdict === 'flagged' || result.verdict === 'rejected') {
    await supabase.from('moderation_queue').insert({
      user_id: user.id,
      image_url: imageUrl,
      verdict: result.verdict,
      reasons: result.reasons,
      reviewed: false,
    }).throwOnError().catch((err: Error) => {
      // Log but don't fail the moderation response
      console.error('[moderate-image] Failed to insert moderation_queue row', err.message)
    })
  }

  return NextResponse.json({
    verdict: result.verdict,
    reasons: result.reasons,
  })
}
