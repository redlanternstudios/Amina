import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const REACTION_TABLE = 'circle_reactions';
const VALID_TARGET_TYPES = ['post', 'comment', 'dua'];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const target_type = searchParams.get('target_type');
    const target_id = searchParams.get('target_id');
    if (!target_type || !target_id) return NextResponse.json({ error: 'target_type and target_id required' }, { status: 400 });
    if (!VALID_TARGET_TYPES.includes(target_type)) return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 });

    const { data: userReaction } = await supabase.from(REACTION_TABLE).select('reaction_type').eq('user_id', user.id).eq('target_id', target_id).eq('target_type', target_type).single();
    const { data: countData } = await supabase.from(REACTION_TABLE).select('reaction_type').eq('target_id', target_id).eq('target_type', target_type);
    const counts: Record<string, number> = {};
    if (countData) for (const row of countData) counts[row.reaction_type] = (counts[row.reaction_type] || 0) + 1;
    return NextResponse.json({ target_type, target_id, user_reaction: userReaction?.reaction_type || null, counts, total: countData?.length || 0 });
  } catch (error) {
    console.error('[VERIFY_REACT_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targets } = await req.json();
    if (!Array.isArray(targets) || targets.length === 0) return NextResponse.json({ error: 'targets array required' }, { status: 400 });
    if (targets.length > 50) return NextResponse.json({ error: 'Max 50 targets per batch' }, { status: 400 });
    for (const t of targets) {
      if (!t.target_type || !t.target_id) return NextResponse.json({ error: 'Each target needs target_type and target_id' }, { status: 400 });
      if (!VALID_TARGET_TYPES.includes(t.target_type)) return NextResponse.json({ error: `Invalid target_type '${t.target_type}'` }, { status: 400 });
    }

    const targetKeys = targets.map((t: any) => `${t.target_type}:${t.target_id}`);
    const { data: userReactions } = await supabase.from(REACTION_TABLE).select('target_id, target_type, reaction_type').eq('user_id', user.id).in('target_id', targets.map((t: any) => t.target_id)).in('target_type', targets.map((t: any) => t.target_type));
    const userReactionMap = new Map<string, string>();
    if (userReactions) for (const r of userReactions) userReactionMap.set(`${r.target_type}:${r.target_id}`, r.reaction_type);

    const countEntries: Record<string, Record<string, number>> = {};
    for (let i = 0; i < targets.length; i += 10) {
      const batch = targets.slice(i, i + 10);
      const { data: batchCounts } = await supabase.from(REACTION_TABLE).select('target_id, target_type, reaction_type').in('target_id', batch.map((t: any) => t.target_id)).in('target_type', batch.map((t: any) => t.target_type));
      if (batchCounts) for (const row of batchCounts) { const k = `${row.target_type}:${row.target_id}`; if (!countEntries[k]) countEntries[k] = {}; countEntries[k][row.reaction_type] = (countEntries[k][row.reaction_type] || 0) + 1; }
    }

    const results: Record<string, any> = {};
    for (const key of targetKeys) {
      const t = targets[targetKeys.indexOf(key)];
      const counts = countEntries[key] || {};
      const total = Object.values(counts).reduce((s: number, c: number) => s + c, 0);
      results[key] = { target_type: t.target_type, target_id: t.target_id, user_reaction: userReactionMap.get(key) || null, counts, total };
    }
    return NextResponse.json({ results });
  } catch (error) {
    console.error('[VERIFY_REACT_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
