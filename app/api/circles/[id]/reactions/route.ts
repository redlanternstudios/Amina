import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('id')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(_request.url);
    const targetType = url.searchParams.get('target_type') || 'message';
    const targetId = url.searchParams.get('target_id');

    let query = supabase
      .from('circle_reactions')
      .select('*')
      .eq('target_type', targetType);

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ reactions: data || [] });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/circles/[id]/reactions:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: membership } = await supabase
      .from('circle_memberships')
      .select('id')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { target_id, target_type, reaction } = body;

    if (!target_id || !target_type || !reaction) {
      return NextResponse.json({ error: 'target_id, target_type, and reaction are required' }, { status: 400 });
    }

    if (!['message', 'post'].includes(target_type)) {
      return NextResponse.json({ error: 'target_type must be "message" or "post"' }, { status: 400 });
    }

    if (!['ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Toggle — delete if exists, insert if not
    const { data: existing } = await supabase
      .from('circle_reactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', target_id)
      .eq('reaction', reaction)
      .single();

    if (existing) {
      const { error: delError } = await supabase
        .from('circle_reactions')
        .delete()
        .eq('id', existing.id);

      if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
      return NextResponse.json({ deleted: true });
    }

    const { data, error: insError } = await supabase
      .from('circle_reactions')
      .insert({
        user_id: user.id,
        target_id,
        target_type,
        reaction,
      })
      .select()
      .single();

    if (insError) return NextResponse.json({ error: insError.message }, { status: 500 });
    return NextResponse.json({ reaction: data }, { status: 201 });
  } catch (err: any) {
    console.error('Unexpected error in POST /api/circles/[id]/reactions:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
