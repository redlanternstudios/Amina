import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/circles/[id] — circle detail + posts
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify membership
  const { data: membership } = await supabase
    .from('circle_group_members')
    .select('id')
    .eq('circle_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const [circleRes, postsRes, membersRes] = await Promise.all([
    supabase
      .from('circle_groups')
      .select('id, name, intention, topic_tag, invite_code, max_members, created_by')
      .eq('id', id)
      .single(),
    supabase
      .from('circle_posts')
      .select('id, content, is_anonymous, created_at, user_id')
      .eq('circle_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('circle_group_members')
      .select('user_id, display_handle')
      .eq('circle_id', id),
  ])

  if (circleRes.error) return NextResponse.json({ error: circleRes.error.message }, { status: 500 })

  // Get reactions for current user
  const postIds = (postsRes.data ?? []).map((p: any) => p.id)
  const { data: myReactions } = postIds.length > 0
    ? await supabase
        .from('circle_reactions')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .in('target_id', postIds)
    : { data: [] }

  const reactedSet = new Set((myReactions ?? []).map((r: any) => r.target_id))

  const posts = (postsRes.data ?? []).map((p: any) => ({
    ...p,
    display_handle: p.is_anonymous ? 'Sister' : (membersRes.data?.find((m: any) => m.user_id === p.user_id)?.display_handle ?? 'Sister'),
    has_reacted: reactedSet.has(p.id),
    is_mine: p.user_id === user.id,
  }))

  return NextResponse.json({
    circle: circleRes.data,
    posts,
    member_count: membersRes.data?.length ?? 0,
  })
}
