import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { post_id } = await req.json()
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const { data: existing } = await client
    .from('circle_reactions').select('id').eq('user_id', user.id).eq('target_id', post_id).eq('target_type', 'post').single()

  if (existing) {
    await client.from('circle_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ has_reacted: false })
  }
  await client.from('circle_reactions').insert({ user_id: user.id, target_id: post_id, target_type: 'post', reaction: 'heart' })
  return NextResponse.json({ has_reacted: true })
}
