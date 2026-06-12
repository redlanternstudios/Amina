import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select(`
      id,
      name,
      description,
      icon_url,
      is_public,
      tags,
      creator_id,
      created_at,
      member_count:circle_memberships(count),
      members:circle_memberships(
        id,
        user_id,
        role,
        joined_at,
        circle_profiles!inner(display_name, avatar_url)
      )
    `)
    .eq('id', params.id)
    .eq('status', 'active')
    .single()

  if (circleError || !circle) {
    return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
  }

  const memberCount = Array.isArray(circle.member_count)
    ? circle.member_count[0]?.count ?? 0
    : (circle.member_count as any)?.count ?? 0

  let membership: { role: string } | null = null
  if (user) {
    const { data: mem } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', params.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    membership = mem
  }

  return NextResponse.json({
    circle: { ...circle, member_count: memberCount },
    membership,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('circle_memberships')
    .select('role')
    .eq('circle_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership || !['creator', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
  if (body.icon_url !== undefined) updates.icon_url = body.icon_url
  if (body.is_public !== undefined) updates.is_public = body.is_public
  if (body.tags !== undefined) updates.tags = body.tags

  const { data: circle, error } = await supabase
    .from('circles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ circle })
}
