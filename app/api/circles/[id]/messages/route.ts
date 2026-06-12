import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data: membership } = await supabase
      .from('circle_memberships').select('id').eq('circle_id', id).eq('user_id', user.id).eq('status', 'active').single()

    if (!membership) return NextResponse.json({ error: 'You are not a member of this circle' }, { status: 403 })

    const { data, error } = await supabase
      .from('circle_messages').select('*, profiles(full_name, avatar_url)')
      .eq('circle_id', id).order('created_at', { ascending: true }).limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/messages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const contentText = body.message?.trim() || body.content?.trim()
    if (!contentText) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('circle_messages').insert({
        circle_id: id, user_id: user.id,
        content: contentText,
        media_url: body.media_url || null,
        media_type: body.media_type || null,
      }).select('*, profiles(full_name, avatar_url)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/messages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
