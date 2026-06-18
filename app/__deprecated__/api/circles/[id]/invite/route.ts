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
    const url = new URL(request.url)
    const type = url.searchParams.get('type')

    // User's pending invites across all circles
    if (type === 'my') {
      const { data, error } = await supabase
        .from('circle_memberships')
        .select(`
          id,
          circle_id,
          status,
          created_at,
          circle:circles!inner(name, description, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending invites:', error)
        return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
      }

      return NextResponse.json({ invites: data || [] })
    }

    // Admin view: list all pending memberships for this circle
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['creator', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can view invites' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('circle_memberships')
      .select(`
        id,
        user_id,
        role,
        status,
        created_at,
        profile:circle_profiles!inner(display_name, avatar_url)
      `)
      .eq('circle_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending memberships:', error)
      return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 })
    }

    return NextResponse.json({ invites: data || [] })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/invite:', err)
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

    // Verify requester is admin/creator
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['creator', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can send invites' }, { status: 403 })
    }

    // Verify the circle exists and is not deleted
    const { data: circle } = await supabase
      .from('circles')
      .select('id, name, description, avatar_url')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found or has been deleted' }, { status: 404 })
    }

    const body = await request.json()

    // Generate shareable invite code
    if (body.type === 'code') {
      const code = crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data: invite, error: insertError } = await supabase
        .from('circle_invites')
        .insert({
          circle_id: id,
          created_by: user.id,
          code,
          expires_at: expiresAt.toISOString(),
          max_uses: 50,
          use_count: 0,
          is_active: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating invite code:', insertError)
        return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
      }

      return NextResponse.json({ invite }, { status: 201 })
    }

    // Invite a specific user by user_id
    const targetUserId = body.user_id
    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Verify the target user has a profile
    const { data: targetProfile } = await supabase
      .from('circle_profiles')
      .select('user_id, display_name')
      .eq('user_id', targetUserId)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for existing membership
    const { data: existing } = await supabase
      .from('circle_memberships')
      .select('status')
      .eq('circle_id', id)
      .eq('user_id', targetUserId)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'User already has a pending invite' }, { status: 409 })
      }
      if (existing.status === 'banned') {
        return NextResponse.json({ error: 'User has been banned from this circle' }, { status: 403 })
      }
    }

    // Create pending membership (the invite)
    const { data: newMembership, error: insertError } = await supabase
      .from('circle_memberships')
      .insert({
        circle_id: id,
        user_id: targetUserId,
        role: 'member',
        status: 'pending',
      })
      .select('*, profile:circle_profiles!inner(display_name, avatar_url)')
      .single()

    if (insertError?.code === '23505') {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }
    if (insertError) {
      console.error('Error creating invite membership:', insertError)
      return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
    }

    // Create notification for the invited user
    const { error: notifError } = await supabase
      .from('circle_notifications')
      .insert({
        user_id: targetUserId,
        circle_id: id,
        type: 'invite_received',
        actor_id: user.id,
        metadata: {
          circle_name: circle.name,
          invited_by: user.id,
        },
      })

    if (notifError) {
      console.error('Error creating notification:', notifError)
    }

    return NextResponse.json({
      id: newMembership.id,
      circle_id: id,
      user_id: targetUserId,
      status: 'pending',
      role: 'member',
      created_at: newMembership.created_at,
      profile: newMembership.profile,
    }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/invite:', err)
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
    const body = await request.json()
    const action = body.action

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action must be "accept" or "decline"' }, { status: 400 })
    }

    // Verify the user has a pending membership
    const { data: pendingMembership } = await supabase
      .from('circle_memberships')
      .select('id, status')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .single()

    if (!pendingMembership) {
      return NextResponse.json({ error: 'No pending invite found' }, { status: 404 })
    }

    if (pendingMembership.status !== 'pending') {
      return NextResponse.json({ error: `Cannot ${action} — current status is "${pendingMembership.status}"` }, { status: 409 })
    }

    if (action === 'accept') {
      // Verify circle is still available
      const { data: circle } = await supabase
        .from('circles')
        .select('deleted_at, name')
        .eq('id', id)
        .single()

      if (!circle || circle.deleted_at) {
        return NextResponse.json({ error: 'Circle no longer available' }, { status: 410 })
      }

      const { data, error } = await supabase
        .from('circle_memberships')
        .update({ status: 'active', joined_at: new Date().toISOString() })
        .eq('id', pendingMembership.id)
        .select('*, profile:circle_profiles!inner(display_name, avatar_url)')
        .single()

      if (error) {
        console.error('Error accepting invite:', error)
        return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
      }

      // Notify admins that user joined
      const { data: admins } = await supabase
        .from('circle_memberships')
        .select('user_id')
        .eq('circle_id', id)
        .eq('status', 'active')
        .in('role', ['creator', 'admin'])

      if (admins && admins.length > 0) {
        const adminIds = admins.map(a => a.user_id).filter(uid => uid !== user.id)
        if (adminIds.length > 0) {
          const notifications = adminIds.map(adminId => ({
            user_id: adminId,
            circle_id: id,
            type: 'invite_accepted' as const,
            actor_id: user.id,
            metadata: {
              circle_name: circle.name,
            },
          }))

          const { error: notifError } = await supabase
            .from('circle_notifications')
            .insert(notifications)

          if (notifError) {
            console.error('Error creating acceptance notifications:', notifError)
          }
        }
      }

      return NextResponse.json(data)
    }

    // Decline: delete the pending membership
    const { error } = await supabase
      .from('circle_memberships')
      .delete()
      .eq('id', pendingMembership.id)

    if (error) {
      console.error('Error declining invite:', error)
      return NextResponse.json({ error: 'Failed to decline invite' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/circles/[id]/invite:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
