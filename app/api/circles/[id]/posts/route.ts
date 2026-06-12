import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('circle_memberships')
    .select('id')
    .eq('circle_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  const { data: posts, error } = await supabase
    .from('circle_posts')
    .select(`
      id,
      circle_id,
      user_id,
      content,
      media_url,
      created_at,
      updated_at,
      circle_profiles!inner(display_name, avatar_url),
      reaction_count:circle_reactions(count),
      comment_count:circle_post_comments(count)
    `)
    .eq('circle_id', params.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts: posts ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('circle_memberships')
    .select('id')
    .eq('circle_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.content && !body.media_url) {
    return NextResponse.json({ error: 'Content or media is required' }, { status: 400 })
  }

  const { data: post, error } = await supabase
    .from('circle_posts')
    .insert({
      circle_id: params.id,
      user_id: user.id,
      content: body.content,
      media_url: body.media_url,
    })
    .select(`
      id,
      circle_id,
      user_id,
      content,
      media_url,
      created_at,
      updated_at,
      circle_profiles!inner(display_name, avatar_url),
      reaction_count:circle_reactions(count),
      comment_count:circle_post_comments(count)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post }, { status: 201 })
}
