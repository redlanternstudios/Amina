import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')

    // Discover: public circles the user is NOT a member of
    if (type === 'discover') {
      const { data: memberCircleIds } = await supabase
        .from('circle_memberships')
        .select('circle_id')
        .eq('user_id', user.id)

      const excludeIds = memberCircleIds?.map(m => m.circle_id) ?? []

      let query = supabase
        .from('circles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error } = await query
      if (error) {
        console.error('Error fetching discoverable circles:', error)
        return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 })
      }
      return NextResponse.json({ circles: data })
    }

    // Default: user's circles with member count
    const { data, error } = await supabase
      .from('circles')
      .select(`
        *,
        circle_memberships!inner(user_id),
        member_count:circle_memberships(count)
      `)
      .eq('circle_memberships.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my circles:', error)
      return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 })
    }

    return NextResponse.json({ circles: data })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles:', err)
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
    const { name, description, avatar_url, is_public } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: circle, error: createError } = await supabase
      .from('circles')
      .insert({
        name: name.trim(),
        description: description?.trim() ?? null,
        avatar_url: avatar_url ?? null,
        is_public: is_public ?? false,
        creator_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating circle:', createError)
      return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 })
    }

    // Auto-add creator as admin member
    const { error: memberError } = await supabase
      .from('circle_memberships')
      .insert({
        circle_id: circle.id,
        user_id: user.id,
        role: 'admin',
      })

    if (memberError) {
      // Rollback circle creation
      await supabase.from('circles').delete().eq('id', circle.id)
      console.error('Error adding creator as member:', memberError)
      return NextResponse.json({ error: 'Failed to set up circle membership' }, { status: 500 })
    }

    return NextResponse.json({ circle }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
