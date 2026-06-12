import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')

  let query = supabase
    .from('circles')
    .select(`
      id,
      name,
      description,
      icon_url,
      is_public,
      creator_id,
      created_at,
      member_count:circle_memberships(count)
    `)
    .eq('status', 'active')

  if (search) query = query.ilike('name', `%${search}%`)
  if (category) query = query.contains('tags', [category])

  const { data: circles, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ circles })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, icon_url, tags, is_public } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data: circle, error: insertError } = await supabase
    .from('circles')
    .insert({
      name,
      description,
      icon_url,
      tags,
      is_public,
      creator_id: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const { error: memberError } = await supabase
    .from('circle_memberships')
    .insert({ circle_id: circle.id, user_id: user.id, role: 'creator' })

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ circle }, { status: 201 })
}
