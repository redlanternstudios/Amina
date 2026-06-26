import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/dua-wall/[id]/fulfilled — mark du'a as answered (own post only)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: dua } = await supabase
    .from('dua_wall_posts')
    .select('id, user_id, is_answered')
    .eq('id', id)
    .single()

  if (!dua) return NextResponse.json({ error: 'Du\'a not found' }, { status: 404 })
  if (dua.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (dua.is_answered) return NextResponse.json({ error: 'Already marked as answered' }, { status: 409 })

  const { error } = await supabase
    .from('dua_wall_posts')
    .update({ is_answered: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
