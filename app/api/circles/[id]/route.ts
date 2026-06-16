import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await client
    .from('circle_group_members').select('id').eq('circle_id', id).eq('user_id', user.id).single()
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const [circleRes, postsRes, memberCountRes] = await Promise.all([
    client.from('circle_groups').select('id, name, intention, topic_tag, invite_code, max_members').eq('id', id).single(),
    client.from('circle_posts').select('id, content_text, is_anonymous, created_at, user_id').eq('circle_id', id).order('created_at', { ascending: true }),
    client.from('circle_group_members').select('*', { count: 'exact', head: true }).eq('circle_id', id),
  ])

  if (circleRes.error) return NextResponse.json({ error: circleRes.error.message }, { status: 500 })

  const postIds = (postsRes.data ?? []).map((p: { id: string }) => p.id)
  const { data: myReactions } = postIds.length > 0
    ? await client.from('circle_reactions').select('target_id').eq('user_id', user.id).eq('target_type', 'post').in('target_id', postIds)
    : { data: [] }

  const reactedSet = new Set((myReactions ?? []).map((r: { target_id: string }) => r.target_id))
  const posts = (postsRes.data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id, content: p.content_text, is_anonymous: p.is_anonymous, created_at: p.created_at,
    display_handle: 'Sister', has_reacted: reactedSet.has(p.id as string), is_mine: p.user_id === user.id,
  }))

  return NextResponse.json({ circle: circleRes.data, posts, member_count: memberCountRes.count ?? 0 })
}
