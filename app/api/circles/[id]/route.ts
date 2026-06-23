import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await client
    .from('circle_group_members').select('id').eq('circle_id', id).eq('user_id', user.id).single()
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const [circleRes, postsRes, memberCountRes, membersRes] = await Promise.all([
    client.from('circle_groups').select('id, name, intention, topic_tag, invite_code, max_members').eq('id', id).single(),
    client.from('circle_posts').select('id, content_text, is_anonymous, content_status, created_at, user_id').eq('circle_id', id).neq('content_status', 'flagged').order('created_at', { ascending: true }),
    client.from('circle_group_members').select('*', { count: 'exact', head: true }).eq('circle_id', id),
    client.from('circle_group_members').select('user_id, display_handle').eq('circle_id', id),
  ])

  if (circleRes.error) return NextResponse.json({ error: circleRes.error.message }, { status: 500 })

  // Build user_id → display_handle map
  const memberHandles = new Map((membersRes.data ?? []).map((m: { user_id: string; display_handle: string }) => [m.user_id, m.display_handle]))

  const postIds = (postsRes.data ?? []).map((p: { id: string }) => p.id)
  const { data: myReactions } = postIds.length > 0
    ? await client.from('circle_reactions').select('target_id').eq('user_id', user.id).eq('target_type', 'post').in('target_id', postIds)
    : { data: [] }

  const reactedSet = new Set((myReactions ?? []).map((r: { target_id: string }) => r.target_id))
  const posts = (postsRes.data ?? []).map((p: Record<string, unknown>) => {
    const displayHandle = p.is_anonymous ? 'Sister' : (memberHandles.get(p.user_id as string) || 'Sister')
    const contentDisplayed = p.content_status === 'reviewing' ? '[This post is being reviewed for community safety...]' : p.content_text
    return {
      id: p.id, 
      content: contentDisplayed, 
      is_anonymous: p.is_anonymous, 
      content_status: p.content_status,
      created_at: p.created_at,
      display_handle: displayHandle, 
      has_reacted: reactedSet.has(p.id as string), 
      is_mine: p.user_id === user.id,
    }
  })

  return NextResponse.json({ circle: circleRes.data, posts, member_count: memberCountRes.count ?? 0 })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if creator
  const { data: circle } = await client.from('circle_groups').select('created_by').eq('id', id).single()
  if (circle?.created_by !== user.id) return NextResponse.json({ error: 'Only creator can edit' }, { status: 403 })

  const { name, intention, topic_tag, max_members } = await req.json()
  
  const { data: updated, error } = await client
    .from('circle_groups')
    .update({ name, intention, topic_tag, max_members, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ circle: updated }, { status: 200 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if creator
  const { data: circle } = await client.from('circle_groups').select('created_by').eq('id', id).single()
  if (circle?.created_by !== user.id) return NextResponse.json({ error: 'Only creator can delete' }, { status: 403 })

  const { error } = await client.from('circle_groups').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
