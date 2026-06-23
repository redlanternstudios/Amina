import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SignJWT } from 'jose'

const SHARE_SECRET = new TextEncoder().encode(process.env.SHARE_JWT_SECRET || 'amina-share-secret-dev-only')

// GET /api/circles/[circleId]/posts/[postId]/share
// Returns share metadata — never reveals circle name or member info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string; postId: string }> }
) {
  const { circleId, postId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify membership
  const { data: membership } = await supabase
    .from('circle_group_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch post
  const { data: post } = await supabase
    .from('circle_posts')
    .select('id, content_text, created_at, is_anonymous, user_id')
    .eq('id', postId)
    .eq('circle_id', circleId)
    .single()

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Get member's display handle
  const { data: authorMember } = await supabase
    .from('circle_group_members')
    .select('display_handle')
    .eq('circle_id', circleId)
    .eq('user_id', post.user_id)
    .maybeSingle()

  // Generate share token (expires in 7 days)
  const token = await new SignJWT({
    postId: post.id,
    circleId: circleId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(SHARE_SECRET)

  const snippet = post.content_text.slice(0, 120) + (post.content_text.length > 120 ? '...' : '')
  const displayHandle = post.is_anonymous ? 'A Sister' : (authorMember?.display_handle ?? 'A Sister')

  return NextResponse.json({
    share: {
      snippet,
      authorLabel: `— ${displayHandle} from The Circle`,
      shareUrl: `https://amina.app/share/${token}`,
      createdAt: post.created_at,
    }
  })
}
