import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, userId } = await params

    // Check if requester is circle creator (admin)
    const { data: circle, error: circleError } = await supabase
      .from('circle_groups')
      .select('created_by')
      .eq('id', id)
      .single()

    if (circleError || !circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    if (circle.created_by !== user.id) {
      return NextResponse.json({ error: 'Only circle creators can remove members' }, { status: 403 })
    }

    // Prevent removing the creator
    if (userId === circle.created_by) {
      return NextResponse.json({ error: 'Cannot remove circle creator' }, { status: 400 })
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('circle_group_members')
      .delete()
      .eq('circle_id', id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/circles/[id]/members/[userId]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
