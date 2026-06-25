# SWARMCLAW DISPATCH — THE CIRCLE SESSION 1
**Issued:** 2026-06-22 | **Priority:** P0 | **Owner:** Ro
**Status:** READY FOR EXECUTION

---

## TRUTHSERUM CONTEXT

SwarmClaw completed a full 3-layer upstream/downstream audit of The Circle codebase.
9 issues found. This dispatch covers the 4 that make The Circle usable for real users.

**Build order is a hard dependency. Do not execute Block N+1 before Block N is verified.**

---

## REPO LOCATION

```
/Users/rorysemeah/Desktop/TradeSwarm-repo/  ← NOT Amina
Amina repo: /Users/rorysemeah/Documents/Claude/Projects/RedLantern Studios/amina/
Supabase project: endovljmaudnxdzdapmf
```

---

## PRE-FLIGHT: READ THESE FILES BEFORE WRITING ANY CODE

```
amina/supabase/migrations/           ← all existing migrations
amina/app/api/circles/route.ts       ← POST /api/circles (create + join)
amina/app/api/circles/[id]/route.ts  ← GET circle detail (line 209 hardcodes display_handle)
amina/app/api/circles/[id]/posts/route.ts  ← POST new post
amina/app/api/circles/[id]/react/route.ts  ← POST reaction (hardcodes 'heart')
amina/components/circle/FaithReactions.tsx ← calls /api/reactions (does not exist)
amina/app/(app)/circle/join/page.tsx       ← join flow (no display_handle step)
amina/app/(app)/circle/[id]/page.tsx       ← circle detail feed (PostBubble)
```

---

## BLOCK 1 — MIGRATION + RLS FOR circle_groups

### Problem (VERIFIED)
`circle_groups` table exists in live Supabase DB but has NO migration file in the repo.
It is an orphan table — no schema audit trail, no RLS policy in code.
Every feature built on it has unverified access control.

### Required output
New file: `amina/supabase/migrations/[timestamp]_circle_groups_rls.sql`

### SQL content

```sql
-- Migration: circle_groups RLS + policy enforcement
-- This table already exists in the live DB. This migration adds the missing policies.

-- Enable RLS (idempotent)
ALTER TABLE public.circle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present (idempotent re-run safety)
DROP POLICY IF EXISTS "members can view their circles" ON public.circle_groups;
DROP POLICY IF EXISTS "members can view circle members" ON public.circle_group_members;
DROP POLICY IF EXISTS "members can view posts" ON public.circle_posts;
DROP POLICY IF EXISTS "members can create posts" ON public.circle_posts;
DROP POLICY IF EXISTS "authors can delete own posts" ON public.circle_posts;
DROP POLICY IF EXISTS "members can view reactions" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can react" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can remove own reaction" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can view comments" ON public.circle_comments;
DROP POLICY IF EXISTS "members can comment" ON public.circle_comments;
DROP POLICY IF EXISTS "members can delete own comments" ON public.circle_comments;
DROP POLICY IF EXISTS "members can view messages" ON public.circle_messages;
DROP POLICY IF EXISTS "members can send messages" ON public.circle_messages;

-- circle_groups: visible to members only (plus creator, plus public circles)
CREATE POLICY "members can view their circles"
  ON public.circle_groups FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated users can create circles"
  ON public.circle_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "admin can update circle"
  ON public.circle_groups FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin can delete circle"
  ON public.circle_groups FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- circle_group_members: members see all members of their circles
CREATE POLICY "members can view circle members"
  ON public.circle_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members AS cgm2
      WHERE cgm2.circle_id = circle_group_members.circle_id
        AND cgm2.user_id = auth.uid()
    )
  );

CREATE POLICY "users can join circles"
  ON public.circle_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin can remove members"
  ON public.circle_group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members AS cgm2
      WHERE cgm2.circle_id = circle_group_members.circle_id
        AND cgm2.user_id = auth.uid()
        AND cgm2.role = 'admin'
    )
  );

-- circle_posts: members only
CREATE POLICY "members can view posts"
  ON public.circle_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can create posts"
  ON public.circle_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authors can delete own posts"
  ON public.circle_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- circle_reactions
CREATE POLICY "members can view reactions"
  ON public.circle_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_posts cp
      JOIN public.circle_group_members cgm ON cgm.circle_id = cp.circle_id
      WHERE cp.id = circle_reactions.target_id
        AND cgm.user_id = auth.uid()
    )
  );

CREATE POLICY "members can react"
  ON public.circle_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members can remove own reaction"
  ON public.circle_reactions FOR DELETE
  USING (user_id = auth.uid());

-- circle_comments
CREATE POLICY "members can view comments"
  ON public.circle_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_comments.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can comment"
  ON public.circle_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_comments.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authors can delete own comments"
  ON public.circle_comments FOR DELETE
  USING (author_id = auth.uid());

-- circle_messages
CREATE POLICY "members can view messages"
  ON public.circle_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can send messages"
  ON public.circle_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );
```

### Testing receipt required
```
RECEIPT-BLOCK1:
- [ ] Migration file exists at amina/supabase/migrations/[timestamp]_circle_groups_rls.sql
- [ ] All 6 tables have RLS enabled (verify via: SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('circle_groups','circle_group_members','circle_posts','circle_reactions','circle_comments','circle_messages'))
- [ ] Policies applied: SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename LIKE 'circle%' ORDER BY tablename — must return ≥12 rows
- [ ] A non-member user_id cannot SELECT from circle_posts (test with a known non-member UUID)
```

---

## BLOCK 2 — DISPLAY HANDLE (identity is broken)

### Problem (VERIFIED)
`display_handle` is hardcoded `'Sister'` in two places:
1. `app/api/circles/[id]/route.ts` line ~209: post mapper hardcodes `display_handle: 'Sister'`
2. `app/api/circles/route.ts` join insert: sets `display_handle: 'Sister'` unconditionally
3. `app/(app)/circle/join/page.tsx`: never asks the user for a display name

### Fix: 3 files

**File 1: `app/(app)/circle/join/page.tsx`**

Add a display handle step between code entry and confirmation. After code validates and the preview card shows, add a text input before the "Join this Circle →" button:

```
[Input — Ivory rounded-xl, 56px tall]
placeholder: "How should sisters know you? (e.g. Umm Yusuf)"
label: "Your name in this Circle"
helper: "You choose — this is how you appear to your sisters."
max: 30 chars
```

Store as `displayHandle` state. Pass to the join API call.

**File 2: `app/api/circles/route.ts` — POST /api/circles/join handler**

Change:
```ts
display_handle: 'Sister',
```
To:
```ts
display_handle: body.displayHandle?.trim() || 'Sister',
```

**File 3: `app/api/circles/[id]/route.ts` — GET handler post mapper (~line 209)**

The mapper must read `display_handle` from the joined `circle_group_members` row, not hardcode it.

Current (broken):
```ts
display_handle: 'Sister',
```

Fix — the query must JOIN circle_group_members to get the per-author handle:
```sql
SELECT 
  cp.*,
  cgm.display_handle,
  cgm.role AS author_role
FROM circle_posts cp
LEFT JOIN circle_group_members cgm 
  ON cgm.circle_id = cp.circle_id 
  AND cgm.user_id = cp.author_id
WHERE cp.circle_id = $1
ORDER BY cp.created_at DESC
```

Then in the mapper:
```ts
display_handle: post.display_handle ?? 'Sister',
```

**Also fix `app/api/circles/[id]/posts/route.ts` — POST new post response**

When inserting a new post and returning it, the API must fetch the author's `display_handle` from `circle_group_members` and include it in the response. Currently it returns `display_handle: 'Sister'` on new post creation.

### Testing receipt required
```
RECEIPT-BLOCK2:
- [ ] Join flow shows display name input field between preview card and "Join" button
- [ ] After joining with handle "Umm Zainab", circle_group_members row has display_handle = 'Umm Zainab'
- [ ] GET /api/circles/[id] returns posts where display_handle matches the member's set handle (not 'Sister')
- [ ] Two different sisters posting in the same circle show different display names
- [ ] A member who joined before this fix still shows 'Sister' (graceful fallback, not a crash)
```

---

## BLOCK 3 — FAITH REACTIONS WIRING

### Problem (VERIFIED)
`FaithReactions.tsx` calls `POST /api/reactions` and `DELETE /api/reactions` — **this route does not exist**.
`POST /api/circles/[id]/react` exists but hardcodes `reaction: 'heart'` regardless of input.
The GET handler returns `has_reacted: boolean` but never returns per-reaction counts.

The 5 faith reactions (ameen, subhanallah, alhamdulillah, mashallah, heart) are locked in the DB CHECK constraint but completely inaccessible from the UI.

### Fix: 3 files

**File 1: `components/circle/FaithReactions.tsx`**

Replace the `fetch('/api/reactions', ...)` calls with `fetch(\`/api/circles/${circleId}/react\`, ...)`.

The component needs `circleId` passed as a prop (it may already receive `postId` — add `circleId` alongside it).

Toggle call:
```ts
// ADD reaction
fetch(`/api/circles/${circleId}/react`, {
  method: 'POST',
  body: JSON.stringify({ postId, reaction: reactionKey, targetType: 'post' })
})

// REMOVE reaction  
fetch(`/api/circles/${circleId}/react`, {
  method: 'DELETE',
  body: JSON.stringify({ postId, reaction: reactionKey, targetType: 'post' })
})
```

**File 2: `app/api/circles/[id]/react/route.ts`**

POST handler — accept `reaction` from body instead of hardcoding:
```ts
const { postId, reaction, targetType = 'post' } = await req.json()

// Validate reaction type
const VALID_REACTIONS = ['ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart']
if (!VALID_REACTIONS.includes(reaction)) {
  return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
}

// Insert with the actual reaction type
await supabase.from('circle_reactions').insert({
  target_id: postId,
  target_type: targetType,
  user_id: userId,
  reaction: reaction,         // ← was hardcoded 'heart'
})
```

Add DELETE handler to the same route file:
```ts
export async function DELETE(req, { params }) {
  const { postId, reaction, targetType = 'post' } = await req.json()
  const { userId } = await getApiUser(req)
  
  await supabase.from('circle_reactions')
    .delete()
    .match({ target_id: postId, target_type: targetType, user_id: userId, reaction })
  
  return NextResponse.json({ ok: true })
}
```

**File 3: `app/api/circles/[id]/route.ts` — GET handler**

Update the reaction query to return per-type counts:
```sql
SELECT 
  reaction,
  COUNT(*) as count,
  bool_or(user_id = auth.uid()) as user_reacted
FROM circle_reactions
WHERE target_id = $postId AND target_type = 'post'
GROUP BY reaction
```

Return in post object:
```ts
reaction_counts: {
  ameen: N,
  subhanallah: N,
  alhamdulillah: N,
  mashallah: N,
  heart: N,
},
user_reactions: ['ameen', 'heart'],  // which ones the current user has selected
```

Update `FaithReactions.tsx` to consume `reaction_counts` and `user_reactions` from the post object.

Update `app/(app)/circle/[id]/page.tsx` PostBubble to pass `circleId` to `FaithReactions`.

### Testing receipt required
```
RECEIPT-BLOCK3:
- [ ] Tapping "Ameen 🥲" on a post sends POST /api/circles/[id]/react with body { reaction: 'ameen' }
- [ ] circle_reactions row inserted with reaction = 'ameen' (verify in Supabase)
- [ ] Tapping same reaction again removes it (DELETE, row gone from circle_reactions)
- [ ] Feed refreshes to show updated counts per reaction type
- [ ] All 5 reactions can be toggled independently (test each: ameen, subhanallah, alhamdulillah, mashallah, heart)
- [ ] /api/reactions route does NOT need to be created — FaithReactions now calls /api/circles/[id]/react
```

---

## BLOCK 4 — AMINA SEED POST (cold start fix)

### Problem (VERIFIED)
When a circle is created, it is immediately empty. No activation prompt. No Amina voice.
The circle goes cold in 48 hours if the creator doesn't post.
`/api/chat/route.ts` proves the AI pattern works — `generateText()` is available and tested.

### Fix: 2 files

**File 1: `app/api/circles/route.ts` — POST /api/circles (create handler)**

After the creator auto-join insert, add inline Amina seed post:

```ts
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

// After: await supabase.from('circle_group_members').insert({ ... })
// Add:

const AMINA_SYSTEM_USER_ID = process.env.AMINA_SYSTEM_USER_ID

if (AMINA_SYSTEM_USER_ID) {
  try {
    const { text: welcomeText } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `You are Amina, a warm and spiritually grounded AI companion for Muslim women.
You are posting a welcome message to a new private Circle called "${circle.name}".
The circle's intention is: "${circle.intention || 'a space for sisters to reflect and grow together'}".
Write a warm, brief welcome (2-3 sentences, max 200 chars).
In the voice of a knowledgeable, gentle sister — not a bot.
Include one relevant du'a or Quranic reference if natural.
Do not use emojis except 🌙 or 🌿 sparingly.`,
      prompt: 'Write the welcome message for this circle.',
      maxTokens: 120,
    })

    await supabase.from('circle_posts').insert({
      circle_id: circle.id,
      author_id: AMINA_SYSTEM_USER_ID,
      content: welcomeText.trim(),
      is_amina_post: true,
    })
  } catch (err) {
    // Non-blocking — circle creation succeeds even if seed post fails
    console.error('[circle-seed] Failed to seed Amina post:', err)
  }
}
```

**File 2: Supabase migration — add `is_amina_post` column**

New migration: `[timestamp]_circle_posts_amina_flag.sql`
```sql
ALTER TABLE public.circle_posts 
  ADD COLUMN IF NOT EXISTS is_amina_post boolean NOT NULL DEFAULT false;

-- Index for fast lookup of Amina posts
CREATE INDEX IF NOT EXISTS idx_circle_posts_amina ON public.circle_posts (circle_id, is_amina_post) WHERE is_amina_post = true;
```

**Also: add `AMINA_SYSTEM_USER_ID` to `.env.local`**

Value: the user_id of the `amina@yopmail.com` test account (`d849ca72-...` — check auth.users for full UUID).

**Also: update `app/(app)/circle/[id]/page.tsx` PostBubble**

Render Amina posts with distinct visual treatment:
```tsx
// In PostBubble or post card renderer:
const isAminaPost = post.is_amina_post || post.author_id === process.env.NEXT_PUBLIC_AMINA_SYSTEM_USER_ID

// Conditional styling:
className={`rounded-2xl p-4 ${isAminaPost 
  ? 'bg-[#F2ECE4] border-l-4 border-[#D7BA82]'   // Ivory + Muted Gold left border
  : 'bg-[#F2ECE4]'                                 // Standard Ivory
}`}

// Amina byline:
{isAminaPost && (
  <span className="text-xs font-medium text-[#D7BA82] uppercase tracking-wide">✦ Amina</span>
)}
```

### Testing receipt required
```
RECEIPT-BLOCK4:
- [ ] AMINA_SYSTEM_USER_ID env var set in .env.local
- [ ] circle_posts table has is_amina_post boolean column (verified via Supabase)
- [ ] Create a new test circle → immediately check circle_posts → Amina welcome post exists
- [ ] Amina post content references the circle's name or intention (not generic boilerplate)
- [ ] In the circle feed, Amina post renders with gold left border and "✦ Amina" byline
- [ ] Amina post has no ⋯ options menu (or only "Report" — no "Delete post" for non-admin)
- [ ] If AMINA_SYSTEM_USER_ID is not set, circle creation still succeeds (non-blocking catch)
```

---

## FINAL VERIFICATION (run after all 4 blocks)

```
FULL SESSION 1 RECEIPT:

Schema:
- [ ] circle_groups has RLS enabled
- [ ] circle_group_members has RLS enabled
- [ ] circle_posts has is_amina_post column
- [ ] All policy names visible in pg_policies

Identity:
- [ ] Join flow has display_handle input
- [ ] API stores and returns real display_handle per member
- [ ] No hardcoded 'Sister' in GET /api/circles/[id] response

Reactions:
- [ ] All 5 faith reactions functional (tested one-by-one)
- [ ] Reaction counts returned per-type in GET response
- [ ] Toggle works (add → remove → add)
- [ ] /api/reactions route was NOT created (FaithReactions was refactored instead)

Seed post:
- [ ] New circle creation → Amina post auto-seeded
- [ ] Amina post visually distinct in feed (gold border, ✦ Amina label)
- [ ] is_amina_post = true in DB for the seeded row

E2E flow (run this exactly):
1. Create a new circle as amina@yopmail.com
2. Confirm: Amina welcome post appears in feed with gold border
3. React with "SubhanAllah 🌙" → confirm row in circle_reactions with reaction='subhanallah'
4. Join the circle from a second test account, enter display handle "Umm Test"
5. Post as "Umm Test" → confirm display_handle='Umm Test' in feed (not 'Sister')
6. React to Umm Test's post with "Ameen 🥲" from original account → confirm
7. Verify non-member cannot access /api/circles/[circle_id] (should return 403)
```

---

## WHAT IS NOT IN THIS DISPATCH

These are deferred to Session 2 — do not build them now:

- Settings page V2 rewrite (circles V1 → circle_groups V2)
- Halal gate (content_status column + generateObject)
- Invite code regeneration
- circle/[id]/chat orphan fix (nav + FK to wrong table)
- Du'a Wall full build
- Create Circle 3-step form rewrite
- Invite Code Reveal screen (/circle/create/success)
- Join by Code page (/circle/join)
- Post Detail + Comments (/circle/[id]/posts/[postId])

These 9 UI screens and 4 backend fixes are Session 2 work. Session 1 is infrastructure only.

---

## PUSH RULES

- Commit after each block (4 commits minimum)
- Commit message format: `[CIRCLE-S1-B1] Add RLS migration for circle_groups`
- Do NOT push partial work that breaks existing functionality
- If a block fails, stop and report — do not proceed to next block
- All receipts must be satisfied before marking block complete

*Dispatch issued: 2026-06-22 | TruthSerum enforced | Receipts required*
