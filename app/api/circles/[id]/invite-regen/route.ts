import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if creator
  const { data: circle } = await client.from('circle_groups').select('created_by').eq('id', id).single()
  if (circle?.created_by !== user.id) return NextResponse.json({ error: 'Only creator can regenerate invite code' }, { status: 403 })

  const newCode = generateInviteCode()
  
  const { data: updated, error } = await client
    .from('circle_groups')
    .update({ invite_code: newCode })
    .eq('id', id)
    .select('invite_code')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invite_code: updated.invite_code }, { status: 200 })
}
