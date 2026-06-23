import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── POST /api/dua-wall/[id]/ameen ────────────────────────────────────
// Toggle ameen on a dua post (add if not present, remove if present).
export async function POST(
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

    // Verify dua post exists
    const { data: post } = await supabase
      .from('dua_wall_posts')
      .select('id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Du\'a not found' }, { status: 404 })
    }

    // Check if user already has an ameen on this dua
    const { data: existing } = await supabase
      .from('dua_ameens')
      .select('id')
      .eq('dua_id', id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Remove ameen (toggle off)
      const { error: delError } = await supabase
        .from('dua_ameens')
        .delete()
        .eq('id', existing.id)

      if (delError) {
        console.error('Error removing ameen:', delError)
        return NextResponse.json({ error: 'Failed to remove ameen' }, { status: 500 })
      }

      return NextResponse.json({ has_ameen: false })
    }

    // Add ameen (toggle on)
    const { error: insError } = await supabase
      .from('dua_ameens')
      .insert({
        dua_id: id,
        user_id: user.id,
      })

    if (insError) {
      console.error('Error adding ameen:', insError)
      return NextResponse.json({ error: 'Failed to add ameen' }, { status: 500 })
    }

    return NextResponse.json({ has_ameen: true }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/dua-wall/[id]/ameen:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── GET /api/dua-wall/[id]/ameen ─────────────────────────────────────
// Check current user's ameen status on this dua.
export async function GET(
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

    // Get ameen count for this dua
    const { count: ameenCount } = await supabase
      .from('dua_ameens')
      .select('*', { count: 'exact', head: true })
      .eq('dua_id', id)

    // Check if current user has ameen'd
    const { data: myAmeen } = await supabase
      .from('dua_ameens')
      .select('id')
      .eq('dua_id', id)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      ameen_count: ameenCount ?? 0,
      has_ameen: !!myAmeen,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/dua-wall/[id]/ameen:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
