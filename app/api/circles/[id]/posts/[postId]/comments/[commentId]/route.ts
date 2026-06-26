import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/circles/[id]/posts/[postId]/comments/[commentId]
// Soft delete — only the comment author can delete
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string; commentId: string }> }
) {
  const { id, postId, commentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: comment } = await supabase
    .from('circle_post_comments')
    .select('id, author_id')
    .eq('id', commentId)
    .eq('post_id', postId)
    .eq('circle_id', id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  if (comment.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('circle_post_comments')
    .update({ is_deleted: true, body: '[removed]' })
    .eq('id', commentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
