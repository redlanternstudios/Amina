import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify circle membership
  const { data: membership } = await supabase
    .from('circle_memberships')
    .select('id')
    .eq('circle_id', id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { target_id, target_type, reaction } = body

  if (!target_id || !target_type || !reaction) {
    return NextResponse.json({ error: 'target_id, target_type, and reaction are required' }, { status: 400 })
  }

  if (!['message', 'post'].includes(target_type)) {
    return NextResponse.json({ error: 'target_type must be message or post' }, { status: 400 })
  }

  const allowedReactions = ['ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart']
  if (!allowedReactions.includes(reaction)) {
    return NextResponse.json({ error: `Invalid reaction. Allowed: ${allowedReactions.join(', ')}` }, { status: 400 })
  }

  // Toggle: remove if exists, insert if not
  const { data: existing } = await supabase
    .from('circle_reactions')
    .select('id')
    .eq('target_id', target_id)
    .eq('target_type', target_type)
    .eq('user_id', user.id)
    .eq('reaction', reaction)
    .maybeSingle()

  if (existing) {
    await supabase.from('circle_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }

  await supabase.from('circle_reactions').insert({
    target_id,
    target_type,
    user_id: user.id,
    reaction,
  })

  return NextResponse.json({ action: 'added' }, { status: 201 })
}
