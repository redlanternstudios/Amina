import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface CircleMember {
  id: string
  user_id: string
  role: string
  status: string
  joined_at: string | null
  circle_profiles: { display_name: string | null; avatar_url: string | null } | null
}

interface CirclePayload {
  name?: string
  description?: string | null
  avatar_url?: string | null
  is_public?: boolean
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user is an active member
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role, status')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'You are not a member of this circle' }, { status: 403 })
    }

    // Fetch circle (exclude soft-deleted)
    const { data: circle, error } = await supabase
      .from('circles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error?.code === 'PGRST116' || !circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch active members with profiles
    const { data: members } = await supabase
      .from('circle_memberships')
      .select(`
        id,
        user_id,
        role,
        status,
        joined_at,
        circle_profiles!inner(display_name, avatar_url)
      `)
      .eq('circle_id', id)
      .eq('status', 'active')

    // Fetch member count
    const { count: memberCount } = await supabase
      .from('circle_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('circle_id', id)
      .eq('status', 'active')

    // Fetch last message for preview
    const { data: lastMessage } = await supabase
      .from('circle_messages')
      .select('id, content, created_at, user_id')
      .eq('circle_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      ...circle,
      members: (members as unknown as CircleMember[]) || [],
      member_count: memberCount ?? 0,
      last_message: lastMessage ?? null,
      my_role: membership.role,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify circle exists and is not soft-deleted
    const { data: circle } = await supabase
      .from('circles')
      .select('id, creator_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    // Verify caller is admin/creator
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['creator', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can update the circle' }, { status: 403 })
    }

    const body: CirclePayload = await req.json()

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required and must be non-empty' }, { status: 400 })
    }
    if (body.name.trim().length > 80) {
      return NextResponse.json({ error: 'Name must be 80 characters or less' }, { status: 400 })
    }
    if (body.description && body.description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
    }

    const updates: CirclePayload = {
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      avatar_url: body.avatar_url ?? null,
      is_public: body.is_public ?? false,
    }

    const { data: updated, error } = await supabase
      .from('circles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating circle:', error)
      return NextResponse.json({ error: 'Failed to update circle' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Unexpected error in PUT /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify circle exists
    const { data: circle } = await supabase
      .from('circles')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    // Verify admin
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['creator', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can update the circle' }, { status: 403 })
    }

    const body: CirclePayload = await req.json()

    const allowedFields = ['name', 'description', 'avatar_url', 'is_public']
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field as keyof CirclePayload] !== undefined) {
        if (field === 'name') {
          const val = body.name?.trim()
          if (!val) continue
          if (val.length > 80) {
            return NextResponse.json({ error: 'Name must be 80 characters or less' }, { status: 400 })
          }
          updates[field] = val
        } else if (field === 'description') {
          const val = body.description?.trim() ?? null
          if (val && val.length > 500) {
            return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
          }
          updates[field] = val
        } else {
          updates[field] = body[field as keyof CirclePayload]
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('circles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error patching circle:', error)
      return NextResponse.json({ error: 'Failed to update circle' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Unexpected error in PATCH /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify circle exists
    const { data: circle } = await supabase
      .from('circles')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    // Verify admin
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['creator', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can delete the circle' }, { status: 403 })
    }

    // Soft-delete: set deleted_at timestamp
    const { error } = await supabase
      .from('circles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error deleting circle:', error)
      return NextResponse.json({ error: 'Failed to delete circle' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted_at: new Date().toISOString() })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
