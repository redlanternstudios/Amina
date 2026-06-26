import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check membership
    const { data: membership } = await supabase
      .from('circle_group_members')
      .select('id')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get circle creator
    const { data: circle } = await supabase
      .from('circle_groups')
      .select('created_by')
      .eq('id', id)
      .single()

    // Get all members
    const { data, error } = await supabase
      .from('circle_group_members')
      .select('user_id, display_handle, role, joined_at, created_at')
      .eq('circle_id', id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching circle members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    const members = (data || []).map(m => ({
      user_id: m.user_id,
      display_handle: m.display_handle,
      role: m.role,
      joined_at: m.joined_at || m.created_at,
      is_creator: m.user_id === circle?.created_by,
    }))

    return NextResponse.json({ members })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/members:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
