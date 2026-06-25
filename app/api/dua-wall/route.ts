import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/dua-wall ───────────────────────────────────────────────
// Fetch dua wall posts with ameen counts, newest first.
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const { data: posts, error } = await supabase
      .from('dua_wall_posts')
      .select(`
        *,
        ameens:dua_ameens(count),
        my_ameen:dua_ameens!inner(user_id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      // Fallback: query without the nested my_ameen join if it fails
      console.error('Error fetching dua wall posts:', error)
      const { data: fallbackPosts, error: fallbackError } = await supabase
        .from('dua_wall_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fallbackError) {
        return NextResponse.json({ error: 'Failed to fetch dua wall posts' }, { status: 500 })
      }

      // Enrich with ameen counts
      const enriched = await Promise.all(
        (fallbackPosts || []).map(async (post) => {
          const { count: ameenCount } = await supabase
            .from('dua_ameens')
            .select('*', { count: 'exact', head: true })
            .eq('dua_id', post.id)

          const { data: myAmeen } = await supabase
            .from('dua_ameens')
            .select('id')
            .eq('dua_id', post.id)
            .eq('user_id', user.id)
            .single()

          return {
            ...post,
            ameen_count: ameenCount ?? 0,
            has_ameen: !!myAmeen,
          }
        })
      )

      const { count: total } = await supabase
        .from('dua_wall_posts')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({ posts: enriched, total: total ?? 0 })
    }

    // Transform the nested response
    const enriched = (posts || []).map((post: any) => ({
      ...post,
      ameen_count: post.ameens?.[0]?.count ?? 0,
      has_ameen: !!post.my_ameen?.length,
      ameens: undefined,
      my_ameen: undefined,
    }))

    const { count: total } = await supabase
      .from('dua_wall_posts')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ posts: enriched, total: total ?? 0 })
  } catch (err) {
    console.error('Unexpected error in GET /api/dua-wall:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/dua-wall ───────────────────────────────────────────────
// Create a new dua post (anonymous by design — user_id stored but not exposed)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Du\'a must be 1000 characters or less' }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from('dua_wall_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        is_answered: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dua:', error)
      return NextResponse.json({ error: 'Failed to create dua' }, { status: 500 })
    }

    return NextResponse.json({ post: { ...post, ameen_count: 0, has_ameen: false } }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/dua-wall:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
