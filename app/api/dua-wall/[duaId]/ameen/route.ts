import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/dua-wall/[duaId]/ameen — add ameen (toggle: insert if not exists)
// DELETE /api/dua-wall/[duaId]/ameen — remove ameen

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ duaId: string }> }
) {
  const { duaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if ameen already exists
  const { data: existing } = await supabase
    .from('dua_ameens')
    .select('id')
    .eq('dua_id', duaId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ action: 'already_exists' })
  }

  const { error } = await supabase
    .from('dua_ameens')
    .insert({ dua_id: duaId, user_id: user.id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get updated count
  const { count } = await supabase
    .from('dua_ameens')
    .select('id', { count: 'exact', head: true })
    .eq('dua_id', duaId)

  return NextResponse.json({ action: 'added', ameen_count: count ?? 0 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ duaId: string }> }
) {
  const { duaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('dua_ameens')
    .delete()
    .eq('dua_id', duaId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get updated count
  const { count } = await supabase
    .from('dua_ameens')
    .select('id', { count: 'exact', head: true })
    .eq('dua_id', duaId)

  return NextResponse.json({ action: 'removed', ameen_count: count ?? 0 })
}
