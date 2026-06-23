import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/circles/[circleId]/posts/[postId]/comments
// Returns paginated, threaded comments with author circle_profiles
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

  const url = new URL(request.url)
  const cursor = url.searchParams.get('cursor')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

  // Fetch top-level comments (no parent_comment_id) with cursor pagination
  let query = supabase
    .from('circle_post_comments')
    .select(`
      id, post_id, circle_id, author_id, parent_comment_id, body, is_deleted, created_at,
      author_profile:circle_group_members!author_id(display_handle)
    `)
    .eq('post_id', postId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: comments, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasMore = comments.length > limit
  const topComments = hasMore ? comments.slice(0, limit) : comments

  // For each top-level comment, fetch replies (nested, 1 level deep)
  const commentIds = topComments.map((c: any) => c.id)
  const { data: replies } = commentIds.length > 0
    ? await supabase
        .from('circle_post_comments')
        .select(`
          id, post_id, circle_id, author_id, parent_comment_id, body, is_deleted, created_at,
          author_profile:circle_group_members!author_id(display_handle)
        `)
        .in('parent_comment_id', commentIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Group replies by parent
  const repliesByParent = new Map<string, any[]>()
  ;(replies ?? []).forEach((r: any) => {
    const parent = r.parent_comment_id
    if (!repliesByParent.has(parent)) repliesByParent.set(parent, [])
    repliesByParent.get(parent)!.push({
      id: r.id,
      postId: r.post_id,
      circleId: r.circle_id,
      authorId: r.author_id,
      parentCommentId: r.parent_comment_id,
      body: r.is_deleted ? '[removed]' : r.body,
      isDeleted: r.is_deleted,
      displayHandle: r.author_profile?.display_handle ?? 'A Sister',
      createdAt: r.created_at,
      isOwn: r.author_id === user.id,
    })
  })

  const formatted = topComments.map((c: any) => ({
    id: c.id,
    postId: c.post_id,
    circleId: c.circle_id,
    authorId: c.author_id,
    parentCommentId: c.parent_comment_id,
    body: c.is_deleted ? '[removed]' : c.body,
    isDeleted: c.is_deleted,
    displayHandle: c.author_profile?.display_handle ?? 'A Sister',
    createdAt: c.created_at,
    isOwn: c.author_id === user.id,
    replies: repliesByParent.get(c.id) ?? [],
  }))

  return NextResponse.json({
    comments: formatted,
    nextCursor: hasMore ? comments[limit - 1]?.created_at : null,
  })
}

// POST /api/circles/[circleId]/posts/[postId]/comments
export async function POST(
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
    .select('id, display_handle')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { body: commentBody, parentCommentId } = body

  if (!commentBody?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  if (commentBody.length > 1000) {
    return NextResponse.json({ error: 'Comment must be under 1000 characters' }, { status: 400 })
  }

  // If replying, verify parent comment exists in this post
  if (parentCommentId) {
    const { data: parent } = await supabase
      .from('circle_post_comments')
      .select('id, post_id, parent_comment_id')
      .eq('id', parentCommentId)
      .single()
    if (!parent || parent.post_id !== postId) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
    }
    // Only allow 1 level of nesting — if parent is already a reply, attach to its parent
    const effectiveParentId = parent.parent_comment_id ?? parentCommentId

    const { data: comment, error } = await supabase
      .from('circle_post_comments')
      .insert({
        post_id: postId,
        circle_id: circleId,
        author_id: user.id,
        body: commentBody.trim(),
        parent_comment_id: effectiveParentId,
      })
      .select('id, post_id, circle_id, author_id, parent_comment_id, body, is_deleted, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      comment: {
        id: comment.id,
        postId: comment.post_id,
        circleId: comment.circle_id,
        authorId: comment.author_id,
        parentCommentId: comment.parent_comment_id,
        body: comment.body,
        isDeleted: comment.is_deleted,
        displayHandle: membership.display_handle ?? 'A Sister',
        createdAt: comment.created_at,
        isOwn: true,
        replies: [],
      }
    }, { status: 201 })
  }

  const { data: comment, error } = await supabase
    .from('circle_post_comments')
    .insert({
      post_id: postId,
      circle_id: circleId,
      author_id: user.id,
      body: commentBody.trim(),
    })
    .select('id, post_id, circle_id, author_id, parent_comment_id, body, is_deleted, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    comment: {
      id: comment.id,
      postId: comment.post_id,
      circleId: comment.circle_id,
      authorId: comment.author_id,
      parentCommentId: comment.parent_comment_id,
      body: comment.body,
      isDeleted: comment.is_deleted,
      displayHandle: membership.display_handle ?? 'A Sister',
      createdAt: comment.created_at,
      isOwn: true,
      replies: [],
    }
  }, { status: 201 })
}
