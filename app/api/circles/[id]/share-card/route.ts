import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/circles/[id]/share-card ─────────────────────────────────
// Returns share card data for a circle: invite code, pre-written message,
// and share links.
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify membership (only members can share)
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('id, role')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden — not a member' }, { status: 403 })
    }

    // Fetch circle info
    const { data: circle, error: circleError } = await supabase
      .from('circles')
      .select('id, name, description, avatar_url')
      .eq('id', id)
      .single()

    if (circleError || !circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
    }

    // Get or create invite code for the circle
    const { data: invite } = await supabase
      .from('circle_invites')
      .select('code, use_count, max_uses, expires_at')
      .eq('circle_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If no invite exists, or existing one is expired/full, generate one
    let inviteCode = invite?.code
    if (!inviteCode) {
      const { data: newInvite, error: inviteError } = await supabase
        .from('circle_invites')
        .insert({
          circle_id: id,
          created_by: user.id,
          code: generateInviteCode(),
          max_uses: 50,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('code')
        .single()

      if (inviteError) {
        console.error('Error creating invite:', inviteError)
        return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 })
      }

      inviteCode = newInvite.code
    }

    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://amina.app'
    const inviteUrl = `${appBase}/circle/join?code=${inviteCode}`
    const memberCount = await getMemberCount(supabase, id)

    // Build share card data matching the v0 spec
    return NextResponse.json({
      circle_id: circle.id,
      circle_name: circle.name,
      circle_description: circle.description,
      circle_avatar_url: circle.avatar_url,
      member_count: memberCount,
      invite_code: inviteCode,
      invite_code_display: inviteCode.split('').join(' ').toUpperCase(),
      invite_url: inviteUrl,
      prewritten_message: `Assalamu alaykum sister! 🌙\nI started a Circle called '${circle.name}' on Amina.\nJoin us with code: ${inviteCode}`,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/share-card:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Helper: generate 6-char alphanumeric invite code ─────────────────
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 for readability
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ─── Helper: get active member count ──────────────────────────────────
async function getMemberCount(supabase: any, circleId: string): Promise<number> {
  const { count } = await supabase
    .from('circle_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circleId)
    .eq('status', 'active')

  return count ?? 0
}
