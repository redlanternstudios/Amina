import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── POST /api/circles/[id]/posts/[postId]/comments ───────────────────
// Create a comment on a circle post. Supports nested replies via parent_id.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: circleId, postId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify membership
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('id')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden — not a member' }, { status: 403 })
    }

    // Verify post exists in this circle
    const { data: post } = await supabase
      .from('circle_posts')
      .select('id')
      .eq('id', postId)
      .eq('circle_id', circleId)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const { content, parent_id } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // If parent_id provided, verify it exists and belongs to same post
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('circle_post_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('post_id', postId)
        .single()

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const { data: comment, error: insertError } = await supabase
      .from('circle_post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select('*, circle_profiles!inner(display_name, avatar_url)')
      .single()

    if (insertError) {
      console.error('Error creating comment:', insertError)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/posts/[postId]/comments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── GET /api/circles/[id]/posts/[postId]/comments ────────────────────
// Fetch comments for a post, with nested replies.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: circleId, postId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify membership
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('id')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden — not a member' }, { status: 403 })
    }

    // Fetch top-level comments (parent_id IS NULL) with nested replies
    const { data: comments, error } = await supabase
      .from('circle_post_comments')
      .select(`
        *,
        circle_profiles!inner(display_name, avatar_url),
        replies:circle_post_comments(
          *,
          circle_profiles!inner(display_name, avatar_url)
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    // Get total comment count from the post
    const { data: post } = await supabase
      .from('circle_posts')
      .select('comment_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      comments: comments || [],
      total_count: post?.comment_count ?? 0,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/[id]/posts/[postId]/comments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE /api/circles/[id]/posts/[postId]/comments ─────────────────
// Delete a comment. Author can delete own; admin/creator can delete any.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id: circleId, postId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const commentId = url.searchParams.get('comment_id')
    if (!commentId) {
      return NextResponse.json({ error: 'comment_id query param required' }, { status: 400 })
    }

    // Fetch comment to verify ownership
    const { data: comment } = await supabase
      .from('circle_post_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user is author OR admin/creator of the circle
    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('role')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const isAuthor = comment.user_id === user.id
    const isAdmin = membership && ['admin', 'creator'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden — not your comment' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('circle_post_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/circles/[id]/posts/[postId]/comments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
