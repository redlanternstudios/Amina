import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── DELETE /api/dua-wall/[id] ────────────────────────────────────────
// Delete own dua post.
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: post } = await supabase
      .from('dua_wall_posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Du\'a not found' }, { status: 404 })
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden — not your du\'a' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('dua_wall_posts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting dua:', deleteError)
      return NextResponse.json({ error: 'Failed to delete du\'a' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/dua-wall/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PATCH /api/dua-wall/[id] ─────────────────────────────────────────
// Mark dua as answered.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_answered } = body

    if (typeof is_answered !== 'boolean') {
      return NextResponse.json({ error: 'is_answered (boolean) is required' }, { status: 400 })
    }

    const { data: post } = await supabase
      .from('dua_wall_posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Du\'a not found' }, { status: 404 })
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden — not your du\'a' }, { status: 403 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('dua_wall_posts')
      .update({ is_answered })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating dua:', updateError)
      return NextResponse.json({ error: 'Failed to update du\'a' }, { status: 500 })
    }

    return NextResponse.json({ post: updated })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/dua-wall/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
