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

    const { data, error } = await supabase
      .from('circle_posts')
      .select('*, circle_profiles!inner(display_name, avatar_url), circle_reactions(*)')
      .eq('circle_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching circle posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/posts:', err)
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
    const body = await request.json()

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('circle_posts')
      .insert({
        circle_id: id,
        user_id: user.id,
        content: body.content.trim(),
      })
      .select('*, circle_profiles!inner(display_name, avatar_url), circle_reactions(*)')
      .single()

    if (error) {
      console.error('Error creating circle post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/posts:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
