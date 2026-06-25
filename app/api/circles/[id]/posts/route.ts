import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/circles/[id]/posts
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify membership
  const { data: membership } = await supabase
    .from('circle_group_members')
    .select('id')
    .eq('circle_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { content, is_anonymous = true } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const { data: post, error } = await supabase
    .from('circle_posts')
    .insert({ circle_id: id, user_id: user.id, content: content.trim(), is_anonymous })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    post: {
      ...post,
      display_handle: is_anonymous ? 'Sister' : 'Sister',
      has_reacted: false,
      is_mine: true,
    }
  }, { status: 201 })
}
