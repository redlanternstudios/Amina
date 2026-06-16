import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/circles/join — join by invite code
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invite_code } = await req.json()
  if (!invite_code?.trim()) return NextResponse.json({ error: 'invite_code required' }, { status: 400 })

  const { data: circle, error: circleErr } = await supabase
    .from('circle_groups')
    .select('id, name, intention, topic_tag, max_members, created_by')
    .eq('invite_code', invite_code.toUpperCase().trim())
    .single()

  if (circleErr || !circle) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  // Check member count
  const { count } = await supabase
    .from('circle_group_members')
    .select('id', { count: 'exact', head: true })
    .eq('circle_id', circle.id)

  if ((count ?? 0) >= circle.max_members) {
    return NextResponse.json({ error: 'This circle is full, sister.' }, { status: 409 })
  }

  // Check already a member
  const { data: existing } = await supabase
    .from('circle_group_members')
    .select('id')
    .eq('circle_id', circle.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 })

  const { error: joinErr } = await supabase.from('circle_group_members').insert({
    circle_id: circle.id,
    user_id: user.id,
    display_handle: 'Sister',
  })

  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 })

  return NextResponse.json({ circle }, { status: 200 })
}
