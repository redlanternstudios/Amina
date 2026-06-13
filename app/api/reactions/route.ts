import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REACTION_TABLE = 'circle_reactions'
const VALID_TARGET_TYPES = ['message', 'post', 'dm_message'] as const
const VALID_REACTIONS = ['ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const targetId = url.searchParams.get('target_id')
    const targetType = url.searchParams.get('target_type')

    if (!targetId || !targetType) {
      return NextResponse.json({ error: 'target_id and target_type are required' }, { status: 400 })
    }

    if (!VALID_TARGET_TYPES.includes(targetType as typeof VALID_TARGET_TYPES[number])) {
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    }

    let query = supabase
      .from(REACTION_TABLE)
      .select('*, circle_profiles!inner(display_name, avatar_url)')
      .eq('target_id', targetId)
      .eq('target_type', targetType)

    const { data, error } = await query
    if (error) {
      console.error('Error fetching reactions:', error)
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/reactions:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { target_id, target_type, reaction } = body

    if (!target_id || !target_type || !reaction) {
      return NextResponse.json({ error: 'target_id, target_type, and reaction are required' }, { status: 400 })
    }

    if (!VALID_TARGET_TYPES.includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    }

    if (!VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
    }

    // Check if reaction already exists (unique constraint per user per target per reaction)
    const { data: existing } = await supabase
      .from(REACTION_TABLE)
      .select('id')
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .eq('user_id', user.id)
      .eq('reaction', reaction)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Reaction already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from(REACTION_TABLE)
      .insert({
        target_id,
        target_type,
        user_id: user.id,
        reaction,
      })
      .select('*, circle_profiles!inner(display_name, avatar_url)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Reaction already exists' }, { status: 409 })
      }
      console.error('Error creating reaction:', error)
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/reactions:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { target_id, target_type, reaction } = body

    if (!target_id || !target_type || !reaction) {
      return NextResponse.json({ error: 'target_id, target_type, and reaction are required' }, { status: 400 })
    }

    if (!VALID_TARGET_TYPES.includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    }

    if (!VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(REACTION_TABLE)
      .delete()
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .eq('user_id', user.id)
      .eq('reaction', reaction)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reaction not found' }, { status: 404 })
      }
      console.error('Error deleting reaction:', error)
      return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 })
    }

    return NextResponse.json({ success: true, removed: data })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/reactions:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
