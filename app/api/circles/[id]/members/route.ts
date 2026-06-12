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

    const { data, error } = await supabase
      .from('circle_memberships')
      .select('*, circle_profiles!inner(display_name, avatar_url)')
      .eq('circle_id', id)

    if (error) {
      console.error('Error fetching circle members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/members:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    // Only admins can add members
    const membership = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (membership.data?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('circle_memberships')
      .insert({
        circle_id: id,
        user_id: body.user_id,
        role: body.role || 'member',
      })
      .select('*, circle_profiles!inner(display_name, avatar_url)')
      .single()

    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }
    if (error) {
      console.error('Error adding member:', error)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/members:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const membership = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (membership.data?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    const body = await request.json()
    const { error } = await supabase
      .from('circle_memberships')
      .delete()
      .eq('circle_id', id)
      .eq('user_id', body.user_id)

    if (error) {
      console.error('Error removing member:', error)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/circles/[id]/members:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
