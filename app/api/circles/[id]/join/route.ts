import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: circle } = await supabase
      .from('circles')
      .select('is_public')
      .eq('id', id)
      .single()

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    if (circle.is_public) {
      // Direct join for public circles
      const { data, error } = await supabase
        .from('circle_memberships')
        .insert({
          circle_id: id,
          user_id: user.id,
          role: 'member',
        })
        .select('*, circle_profiles!inner(display_name, avatar_url)')
        .single()

      if (error?.code === '23505') {
        return NextResponse.json({ error: 'Already a member' }, { status: 409 })
      }
      if (error) {
        console.error('Error joining circle:', error)
        return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 })
      }

      return NextResponse.json(data, { status: 201 })
    }

    // Private circle — join requests not yet available
    return NextResponse.json(
      { error: 'This circle is private. Join requests are not yet available.' },
      { status: 403 }
    )
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/join:', err)
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

    const membership = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    const isAdmin = membership.data?.role === 'admin' || membership.data?.role === 'leader'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can approve requests' }, { status: 403 })
    }

    return NextResponse.json({ message: 'Membership approved' })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/circles/[id]/join:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
