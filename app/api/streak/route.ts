import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/streak
// Returns the authenticated user's reflection streak data.
// Auth: Supabase SSR cookie session (no detail leak on 401).
// Data source: amina_streaks — populated by trigger trg_amina_streak_on_reflection.
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('amina_streaks')
    .select('current_streak, longest_streak, last_reflection_date')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found — new user with no reflections yet, return zeroes below
    console.error('[streak] db error:', error.code)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({
    current_streak: data?.current_streak ?? 0,
    longest_streak: data?.longest_streak ?? 0,
    last_reflection_date: data?.last_reflection_date ?? null,
  })
}
