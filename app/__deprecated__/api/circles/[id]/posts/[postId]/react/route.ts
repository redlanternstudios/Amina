// app/api/circles/[id]/posts/[postId]/react/route.ts
// Phase 3 — The Circle Backend (P0)
// POST: Binary reaction toggle
// Returns { has_reacted: boolean } ONLY — NEVER a reaction count.
// If user has reacted: delete (unreact). If not: insert (react).
// Membership verified via is_circle_member RPC before allowing action.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: circleId, postId } = await params;

    // Verify membership via SECURITY DEFINER RPC
    const { data: isMember, error: rpcError } = await supabase.rpc('is_circle_member', {
      p_circle_id: circleId,
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error('Error checking membership:', rpcError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this circle' }, { status: 403 });
    }

    // Verify post exists and belongs to this circle
    const { data: post, error: postError } = await supabase
      .from('circle_posts')
      .select('id')
      .eq('id', postId)
      .eq('circle_id', circleId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check current reaction state
    const { data: existingReaction } = await supabase
      .from('circle_reactions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReaction) {
      // Un-react
      const { error: deleteError } = await supabase
        .from('circle_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
      }

      // Return boolean ONLY — never a count
      return NextResponse.json({ has_reacted: false });
    } else {
      // React
      const { error: insertError } = await supabase
        .from('circle_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (insertError) {
        // Handle race condition: another request may have inserted
        if (insertError.code === '23505') {
          return NextResponse.json({ has_reacted: true });
        }
        console.error('Error adding reaction:', insertError);
        return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
      }

      // Return boolean ONLY — never a count
      return NextResponse.json({ has_reacted: true });
    }
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/[id]/posts/[postId]/react:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
