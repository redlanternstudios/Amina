import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/circles/join — join by invite code
export async function POST(req: Request) {
  // Prefer Bearer token (sent by client to bypass SSR cookie issues),
  // fall back to cookie-based auth.
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  // Use the service-role key to create an admin client that can verify the
  // JWT and then perform inserts with the user's identity.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined
  )

  const { data: { user }, error: userErr } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getSession().then(({ data }) => ({
        data: { user: data.session?.user ?? null },
        error: null,
      }))

  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
