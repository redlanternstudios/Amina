// app/api/circles/preview/route.ts
// Phase 3 — The Circle Backend (P0)
// Preview a circle by invite code — NO AUTH required
// Uses SECURITY DEFINER RPC to bypass RLS (invite-only circles are not
// visible to unauthenticated users through normal table queries).
// Returns ONLY: name, intention, topic, member_count, member_limit
// NEVER exposes: posts, member identities, reaction data

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code query parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Use SECURITY DEFINER RPC — bypasses RLS so invite-only circles
    // are previewable by code without requiring an auth session.
    const { data, error } = await supabase.rpc('get_circle_preview', {
      p_invite_code: code.toUpperCase().trim(),
    });

    if (error) {
      console.error('Error in get_circle_preview:', error);
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    const result = data as Record<string, unknown>;

    if (result.status === 404) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Return ONLY public preview fields — never posts or member identities
    return NextResponse.json({
      name: result.name,
      intention: result.intention,
      topic: result.topic,
      member_count: result.member_count ?? 0,
      member_limit: result.member_limit,
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/circles/preview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
