// app/api/circles/join/route.ts
// Phase 3 — The Circle Backend (P0)
// Join a circle by invite code
// Uses join_circle() RPC for atomic SELECT FOR UPDATE — prevents
// member limit overshoot under concurrent requests.
// 409 if already member, 403 if at member limit

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invite_code } = body;

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json({ error: 'invite_code is required' }, { status: 400 });
    }

    const code = invite_code.toUpperCase().trim();

    // Find circle by invite code
    const { data: circle, error: circleError } = await supabase
      .from('circles')
      .select('id, name')
      .eq('invite_code', code)
      .single();

    if (circleError || !circle) {
      return NextResponse.json({ error: 'Circle not found. Check your invite code.' }, { status: 404 });
    }

    // Use atomic join_circle RPC (SELECT FOR UPDATE inside transaction)
    const { data, error: joinError } = await supabase.rpc('join_circle', {
      p_circle_id: circle.id,
      p_user_id: user.id,
    });

    if (joinError) {
      console.error('Error in join_circle RPC:', joinError);
      return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
    }

    const result = data as Record<string, unknown>;

    if (result.status === 409) {
      return NextResponse.json({ error: result.error as string }, { status: 409 });
    }
    if (result.status === 403) {
      return NextResponse.json({ error: result.error as string }, { status: 403 });
    }
    if (result.status !== 200) {
      return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Joined circle successfully',
      circle: { id: circle.id, name: circle.name },
    }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in POST /api/circles/join:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
