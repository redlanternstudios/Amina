import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json()
  const invite_code = body?.invite_code
  if (!invite_code) return NextResponse.json({ error: 'invite_code required' }, { status: 400 })

  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serverClient = await createClient()
  const { data: circle, error: circleErr } = await serverClient
    .from('circle_groups').select('id, name, intention, topic_tag, invite_code, max_members')
    .eq('invite_code', invite_code.toUpperCase()).single()

  if (circleErr || !circle) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  const { count } = await client.from('circle_group_members').select('*', { count: 'exact', head: true }).eq('circle_id', circle.id)
  if ((count ?? 0) >= circle.max_members) return NextResponse.json({ error: 'This circle is full, sister.' }, { status: 409 })

  const { data: existing } = await client.from('circle_group_members').select('id').eq('circle_id', circle.id).eq('user_id', user.id).single()
  if (existing) return NextResponse.json({ circle }, { status: 200 })

  const { error: joinErr } = await client.from('circle_group_members').insert({ circle_id: circle.id, user_id: user.id, display_handle: 'Sister' })
  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 })

  return NextResponse.json({ circle }, { status: 201 })
}
