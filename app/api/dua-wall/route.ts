import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/dua-wall — paginated list of du'as
// POST /api/dua-wall — create a du'a (anonymous)

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Allow anonymous reading — no auth required for viewing du'as
  const url = new URL(request.url)
  const cursor = url.searchParams.get('cursor')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

  let query = supabase
    .from('dua_wall_posts')
    .select(`
      id, content, is_answered, created_at,
      ameen_count:dua_ameens(count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: duas, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = duas.length > limit
  const page = hasMore ? duas.slice(0, limit) : duas

  // Check which ones the current user has ameened
  const { data: { user } } = await supabase.auth.getUser()
  let userAmeens = new Set<string>()
  if (user && page.length > 0) {
    const { data: ameens } = await supabase
      .from('dua_ameens')
      .select('dua_id')
      .in('dua_id', page.map((d: any) => d.id))
      .eq('user_id', user.id)
    ;(ameens ?? []).forEach((a: any) => userAmeens.add(a.dua_id))
  }

  const formatted = page.map((d: any) => ({
    id: d.id,
    content: d.content,
    is_answered: d.is_answered,
    ameen_count: d.ameen_count?.[0]?.count ?? 0,
    user_has_ameened: userAmeens.has(d.id),
    created_at: d.created_at,
  }))

  return NextResponse.json({
    duas: formatted,
    nextCursor: hasMore ? page[limit - 1]?.created_at : null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { content } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  if (content.length > 280) {
    return NextResponse.json({ error: 'Du\'a must be under 280 characters' }, { status: 400 })
  }

  const { data: dua, error } = await supabase
    .from('dua_wall_posts')
    .insert({ user_id: user.id, content: content.trim() })
    .select('id, content, is_answered, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    dua: {
      id: dua.id,
      content: dua.content,
      is_answered: dua.is_answered,
      ameen_count: 0,
      user_has_ameened: false,
      created_at: dua.created_at,
    }
  }, { status: 201 })
}
