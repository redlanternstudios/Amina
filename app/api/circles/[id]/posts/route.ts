import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/supabase/api-client'
import { generateText } from 'ai'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, client } = await getApiUser(req.headers.get('Authorization'))
  if (!user || !client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await client
    .from('circle_group_members').select('id').eq('circle_id', id).eq('user_id', user.id).single()
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { content, is_anonymous = true } = await req.json()
  const text = content?.trim()
  if (!text) return NextResponse.json({ error: 'content required' }, { status: 400 })

  // Get member's display_handle
  const { data: member } = await client
    .from('circle_group_members')
    .select('display_handle')
    .eq('circle_id', id)
    .eq('user_id', user.id)
    .single()

  // Content validation via AI (halal gate)
  let contentStatus = 'approved'
  
  try {
    const { text: assessment } = await generateText({
      model: 'anthropic/claude-opus-4-1-20250805',
      prompt: `Assess this post for a Muslim sisterhood community. Respond with ONLY one word: "approved" if it's respectful and appropriate, "review" if uncertain, or "flagged" if inappropriate/harmful.

Post: "${text}"`,
    })
    const verdict = assessment.trim().toLowerCase()
    contentStatus = verdict === 'approved' ? 'approved' : verdict === 'review' ? 'reviewing' : 'flagged'
  } catch {
    // If AI validation fails, default to 'approved' and proceed
    contentStatus = 'approved'
  }

  const { data: post, error } = await client
    .from('circle_posts')
    .insert({ circle_id: id, user_id: user.id, content_text: text, is_anonymous, content_status: contentStatus })
    .select('id, content_text, is_anonymous, content_status, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const displayHandle = is_anonymous ? 'Sister' : (member?.display_handle || 'Sister')
  return NextResponse.json({
    post: { 
      id: post.id, 
      content: post.content_text, 
      is_anonymous: post.is_anonymous, 
      content_status: post.content_status,
      created_at: post.created_at, 
      display_handle: displayHandle, 
      has_reacted: false, 
      is_mine: true 
    }
  }, { status: 201 })
}
