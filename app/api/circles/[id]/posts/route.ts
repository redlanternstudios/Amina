import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await client
    .from('circle_group_members').select('id').eq('circle_id', id).eq('user_id', user.id).single()
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { content, is_anonymous = true } = await req.json()
  const text = content?.trim()
  if (!text) return NextResponse.json({ error: 'content required' }, { status: 400 })

  // Get member's display_handle
  const { data: member } = await client
    .from('circle_group_members')
    .select('display_handle')
    .eq('circle_id', id)
    .eq('user_id', user.id)
    .single()

  const { data: post, error } = await client
    .from('circle_posts')
    .insert({ circle_id: id, user_id: user.id, content_text: text, is_anonymous })
    .select('id, content_text, is_anonymous, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const displayHandle = is_anonymous ? 'Sister' : (member?.display_handle || 'Sister')
  return NextResponse.json({
    post: { id: post.id, content: post.content_text, is_anonymous: post.is_anonymous, created_at: post.created_at, display_handle: displayHandle, has_reacted: false, is_mine: true }
  }, { status: 201 })
}
