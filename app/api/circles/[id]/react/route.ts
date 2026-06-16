import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/circles/[id]/react — toggle heart reaction, returns has_reacted boolean only
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { post_id } = await req.json()
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('circle_reactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_id', post_id)
    .eq('target_type', 'post')
    .single()

  if (existing) {
    await supabase.from('circle_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ has_reacted: false })
  } else {
    await supabase.from('circle_reactions').insert({
      user_id: user.id,
      target_id: post_id,
      target_type: 'post',
      reaction: 'heart',
    })
    return NextResponse.json({ has_reacted: true })
  }
}
