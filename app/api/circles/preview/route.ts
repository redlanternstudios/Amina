import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/circles/preview?code=XXXX
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const { data: circle, error } = await supabase
    .from('circle_groups')
    .select('id, name, intention, topic_tag, max_members, created_by, created_at')
    .eq('invite_code', code)
    .single()

  if (error || !circle) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  const { count: member_count } = await supabase
    .from('circle_group_members')
    .select('id', { count: 'exact', head: true })
    .eq('circle_id', circle.id)

  const spots_remaining = circle.max_members - (member_count ?? 0)

  return NextResponse.json({ circle: { ...circle, member_count, spots_remaining } })
}
