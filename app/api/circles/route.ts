import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// GET /api/circles — my circles
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('circle_group_members')
    .select(`
      joined_at,
      circle_groups (
        id, name, intention, topic_tag, invite_code, is_open, max_members, created_by, updated_at,
        circle_group_members ( count )
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const circles = (data ?? []).map((row: any) => ({
    ...row.circle_groups,
    member_count: row.circle_groups.circle_group_members?.[0]?.count ?? 0,
    joined_at: row.joined_at,
  }))

  return NextResponse.json({ circles })
}

// POST /api/circles — create circle
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, intention, topic_tag, is_open = false } = body

  if (!name?.trim() || !intention?.trim() || !topic_tag?.trim()) {
    return NextResponse.json({ error: 'name, intention and topic_tag are required' }, { status: 400 })
  }

  // Generate a unique invite code
  let invite_code = generateInviteCode()
  let attempts = 0
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('circle_groups')
      .select('id')
      .eq('invite_code', invite_code)
      .single()
    if (!existing) break
    invite_code = generateInviteCode()
    attempts++
  }

  const { data: circle, error } = await supabase
    .from('circle_groups')
    .insert({ name: name.trim(), intention: intention.trim(), topic_tag, invite_code, is_open, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-join the creator — accept displayHandle or fall back to 'Sister'
  await supabase.from('circle_group_members').insert({
    circle_id: circle.id,
    user_id: user.id,
    display_handle: body.displayHandle?.trim() || 'Sister',
  })

  // Seed Amina's welcome post (async, fire and forget)
  const AMINA_SYSTEM_USER_ID = process.env.AMINA_SYSTEM_USER_ID
  if (AMINA_SYSTEM_USER_ID) {
    try {
      const topicPrompts: Record<string, string> = {
        'Faith & Belief': `You are Amina, a warm AI companion for Muslim women. Post a welcome to the circle "${name}" (intention: ${intention || 'sisterhood'}). 2-3 sentences, max 200 chars. Include a relevant du'a. Use 🌙 or 🌿 sparingly.`,
        'Mental Health': `You are Amina, a warm AI companion for Muslim women. Post a welcome to the circle "${name}" (intention: ${intention || 'sisterhood'}). 2-3 sentences, max 200 chars. Include a relevant du'a. Use 🌙 or 🌿 sparingly.`,
        'Prayer & Worship': `You are Amina, a warm AI companion for Muslim women. Post a welcome to the circle "${name}" (intention: ${intention || 'sisterhood'}). 2-3 sentences, max 200 chars. Include a relevant du'a. Use 🌙 or 🌿 sparingly.`,
        'Family & Relationships': `You are Amina, a warm AI companion for Muslim women. Post a welcome to the circle "${name}" (intention: ${intention || 'sisterhood'}). 2-3 sentences, max 200 chars. Include a relevant du'a. Use 🌙 or 🌿 sparingly.`,
      }

      const prompt = topicPrompts[topic_tag] || 
        `You are Amina, a warm AI companion for Muslim women. Post a welcome to the circle "${name}". 2-3 sentences, max 200 chars. Include a relevant du'a. Use 🌙 or 🌿 sparingly.`

      const { text: welcome } = await generateText({
        model: 'anthropic/claude-opus-4-1-20250805',
        prompt,
      })

      // Insert Amina's welcome post with is_amina_post flag
      await supabase.from('circle_posts').insert({
        circle_id: circle.id,
        user_id: AMINA_SYSTEM_USER_ID,
        content_text: welcome.trim(),
        is_anonymous: false,
        is_amina_post: true,
      })
    } catch {
      // Silently fail if seeding doesn't work — circle creation still succeeds
      console.error('[Circle seed] Failed to create Amina welcome post')
    }
  }

  return NextResponse.json({ circle }, { status: 201 })
}
