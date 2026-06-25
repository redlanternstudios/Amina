import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/circles/browse?topic=Faith+%26+Worship
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')

  let query = supabase
    .from('circle_groups')
    .select(`
      id, name, intention, topic_tag, max_members, created_at,
      circle_group_members ( count )
    `)
    .eq('is_open', true)
    .order('created_at', { ascending: false })

  if (topic) query = query.eq('topic_tag', topic)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const circles = (data ?? []).map((c: any) => ({
    ...c,
    member_count: c.circle_group_members?.[0]?.count ?? 0,
    is_full: (c.circle_group_members?.[0]?.count ?? 0) >= c.max_members,
  }))

  return NextResponse.json({ circles })
}
