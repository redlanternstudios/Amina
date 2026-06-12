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

    const { data: circle, error } = await supabase
      .from('circles')
      .select(`
        *,
        member_count:circle_memberships(count)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
      }
      console.error('Error fetching circle:', error)
      return NextResponse.json({ error: 'Failed to fetch circle' }, { status: 500 })
    }

    return NextResponse.json({ circle })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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

    const { data: circle, error: fetchError } = await supabase
      .from('circles')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
      }
      console.error('Error fetching circle:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch circle' }, { status: 500 })
    }

    // Creator or admin can update
    const isCreator = circle.creator_id === user.id
    if (!isCreator) {
      const membership = await supabase
        .from('circle_memberships')
        .select('role')
        .eq('circle_id', id)
        .eq('user_id', user.id)
        .single()

      if (!membership.data || !['creator', 'admin'].includes(membership.data.role)) {
        return NextResponse.json({ error: 'Only the circle creator or admin can update' }, { status: 403 })
      }
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      updates.name = body.name.trim()
    }
    if (body.description !== undefined) updates.description = body.description
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url
    if (body.is_public !== undefined) updates.is_public = body.is_public

    const { data: updatedCircle, error: updateError } = await supabase
      .from('circles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating circle:', updateError)
      return NextResponse.json({ error: 'Failed to update circle' }, { status: 500 })
    }

    return NextResponse.json({ circle: updatedCircle })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/circles/[id]:', err)
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

    const { data: circle, error: fetchError } = await supabase
      .from('circles')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
      }
      console.error('Error fetching circle:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch circle' }, { status: 500 })
    }

    // Creator or admin can delete
    const isCreator = circle.creator_id === user.id
    if (!isCreator) {
      const membership = await supabase
        .from('circle_memberships')
        .select('role')
        .eq('circle_id', id)
        .eq('user_id', user.id)
        .single()

      if (!membership.data || !['creator', 'admin'].includes(membership.data.role)) {
        return NextResponse.json({ error: 'Only the circle creator or admin can delete' }, { status: 403 })
      }
    }

    const { error: deleteError } = await supabase
      .from('circles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting circle:', deleteError)
      return NextResponse.json({ error: 'Failed to delete circle' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Circle deleted' })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/circles/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
