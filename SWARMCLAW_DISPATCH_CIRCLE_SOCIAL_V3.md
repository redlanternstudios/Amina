# SWARMCLAW DISPATCH — THE CIRCLE: REAL SOCIAL BUILD
**Issued:** 2026-06-22
**Feature:** The Circle — Social Experience Upgrade (Real social feed, faith reactions wired, comments, identity, Du'a Wall, share card)
**Branch:** `feature/circle-social-v3`
**Supersedes:** SWARMCLAW_DISPATCH_CIRCLE_V2.md
**Final instruction:** Build all phases → run acceptance criteria → merge to main → push to remote.

---

## CTP PROMPT CONTRACT

**GOAL:** The Circle must feel like a mini Instagram/X for Muslim sisters. Sisters open it, scroll content, react with faith reactions, comment, post duas, and share to WhatsApp/Instagram. Every tap must go somewhere. No dead ends.

**CONSTRAINTS:**
- Design system is LOCKED. Read `tailwind.config.ts` — all tokens are there (cream, ivory, rose, olive, charcoal, gold, CSS vars). Do NOT invent colors.
- Typography: `font-display` (Canela/Newsreader italic) for headings, `font-body` (Inter) for body. Already wired.
- Mobile-first. iPhone 15 Pro. All UI touches: min 44px tap targets.
- Schema is MOSTLY THERE. Do not recreate what exists — extend it.
- `FaithReactions.tsx` component is FULLY BUILT. Wire it — do not rewrite it.
- No business logic in frontend components. API routes handle mutations.
- RLS is enforced at DB. API routes add auth middleware as defense in depth.
- Halal gate: no auto-approve. If gate fails → hold in moderation, never silently publish.
- Chronological feed only. No algorithm.

**FORMAT:** Per-phase builds with exact file paths, acceptance criteria, and merge gate.

**FAILURE:**
- Shipping a post feed with no comments (wall with no conversation)
- Faith reactions not visible in the feed scroll (sisters can't react without tapping into a post)
- All posts showing "Sister" with no identity differentiation
- Du'a Wall route returning 404
- Tapping a post going nowhere

---

## WHAT ALREADY EXISTS — READ BEFORE BUILDING ANYTHING

### Schema (all in Supabase — DO NOT RECREATE)
- `circles` — circle entity table
- `circle_memberships` — roles: creator/admin/member
- `circle_posts` — post feed (content_type: text/image/video/repost)
- `circle_reactions` — faith reactions on posts and messages (ameen/subhanallah/alhamdulillah/mashallah/heart)
- `circle_profiles` — display_handle, avatar per user in circle context
- `circle_messages` — group chat (separate from feed posts)
- `dua_wall_posts` — du'a feed (is_answered boolean)
- `dua_ameens` — ameen reactions on du'as (unique per user/dua)
- RLS is enabled and policies are set on all tables above

### Components (all in `components/circle/`)
- `FaithReactions.tsx` — COMPLETE. Props: targetId, targetType, circleId, existingReactions, currentUserId, compact. API: `/api/circles/${circleId}/react` and `/api/reactions`. DO NOT REWRITE.
- `CircleCard.tsx` — circle list card (member + discover variants)
- `CircleList.tsx` — renders list of CircleCards
- `CircleAvatar.tsx` — avatar with fallback initial
- `CreateCircleForm.tsx` — 3-step creation form
- `JoinCircleModal.tsx` — join by code modal
- `InviteMembersModal.tsx`
- `CircleDetailSkeleton.tsx`

### Routes (all exist)
- `/circle` — home, 4 tabs (collapse to 2: My Circles / Discover for v3)
- `/circle/create` — creation flow
- `/circle/[id]` — circle detail (Posts / Messages / Members tabs)
- `/circle/[id]/posts` — post feed
- `/circle/[id]/chat` — group messages
- `/circle/[id]/settings` — circle settings

### Design tokens (from `tailwind.config.ts`)
```
cream: var(--amina-soft-cream)       → #F7F2EB
ivory: var(--amina-warm-ivory)       → #F2ECE4
rose.action: var(--amina-primary-action)  → #C9796A
olive: #8E9878
charcoal: var(--amina-soft-charcoal) → #2C2926
gold: var(--amina-muted-gold)        → #D7BA82
font-display: Canela/Newsreader italic serif
font-body: Inter
shadow-soft, shadow-button, shadow-nav: CSS vars
```

---

## PHASE 0 — BRANCH SETUP

**Agent: DEPLOY**

```bash
cd /path/to/amina
git checkout main
git pull origin main
git checkout -b feature/circle-social-v3
```

---

## PHASE 1 — DATABASE: COMMENTS MIGRATION

**Agent: ARCHITECT**
**Dependency:** Phase 0

The only missing schema piece for real social is comments. Everything else exists.

### Migration: `20260622_008_circle_post_comments.sql`

```sql
-- Comments on circle posts
CREATE TABLE IF NOT EXISTS public.circle_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES public.circle_post_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_circle_post_comments_post_id ON public.circle_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_post_comments_parent ON public.circle_post_comments(parent_comment_id);

-- RLS
ALTER TABLE public.circle_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active members can read comments"
  ON public.circle_post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_memberships
      WHERE circle_id = circle_post_comments.circle_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Active members can post comments"
  ON public.circle_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.circle_memberships
      WHERE circle_id = circle_post_comments.circle_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Authors can soft-delete own comments"
  ON public.circle_post_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Add comment_count to circle_posts for feed display
ALTER TABLE public.circle_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to increment/decrement comment_count on circle_posts
CREATE OR REPLACE FUNCTION update_circle_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_circle_post_comment_count
AFTER INSERT OR DELETE ON public.circle_post_comments
FOR EACH ROW EXECUTE FUNCTION update_circle_post_comment_count();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_post_comments;
```

Apply via Supabase CLI:
```bash
supabase db push
```

**Acceptance criteria:**
- `circle_post_comments` table exists with RLS
- `comment_count` column on `circle_posts`
- Trigger increments/decrements on insert/delete

---

## PHASE 2 — API ROUTES

**Agent: BACKEND**
**Dependency:** Phase 1

### 2A — Comments API

**File:** `app/api/circles/[circleId]/posts/[postId]/comments/route.ts`

```typescript
// GET — fetch comments for a post (paginated, threaded)
// POST — create a comment
// Auth: require active circle membership before any operation
// On POST: insert to circle_post_comments, return the new comment with author circle_profile
// Soft delete: PATCH /{commentId} sets is_deleted=true, body becomes "[removed]"
```

Required endpoints:
- `GET /api/circles/[circleId]/posts/[postId]/comments` → array of comments with `circle_profiles` join for display_handle + avatar
- `POST /api/circles/[circleId]/posts/[postId]/comments` → create comment, returns comment + profile
- `PATCH /api/circles/[circleId]/posts/[postId]/comments/[commentId]` → soft delete (own only)

### 2B — Du'a Wall API

**Files:**
- `app/api/dua-wall/route.ts` — GET (paginated list) + POST (create dua)
- `app/api/dua-wall/[duaId]/ameen/route.ts` — POST (add ameen) + DELETE (remove ameen)
- `app/api/dua-wall/[duaId]/fulfilled/route.ts` — PATCH (mark answered, own post only)

GET response shape:
```typescript
{
  duas: Array<{
    id: string
    content: string
    is_answered: boolean
    ameen_count: number
    user_has_ameened: boolean
    created_at: string
    // author always anonymous — no user info returned
  }>
  nextCursor: string | null
}
```

### 2C — Share Card API

**File:** `app/api/circles/[circleId]/posts/[postId]/share/route.ts`

- GET → returns share metadata: post snippet (first 120 chars), circle name masked as "A Sister's reflection", Amina branding, share URL
- Share URL format: `amina.app/share/[token]` (token = signed JWT, expires 7 days, reveals post content only — never circle name or membership)
- No circle name, no member count, no admission info on external share

### 2D — Verify existing react API
Check `app/api/circles/[circleId]/react/route.ts` and `app/api/reactions/route.ts` exist and work.
If missing, create:
```typescript
// POST /api/circles/[circleId]/react
// Body: { targetId, targetType: 'post'|'message', reaction: 'ameen'|'subhanallah'|'alhamdulillah'|'mashallah'|'heart' }
// Toggle: if reaction exists → delete, else → insert
// Returns: updated reaction counts for that target
```

**Acceptance criteria:**
- All 5 endpoints return correct data
- Auth middleware blocks non-members on all circle endpoints
- Du'a Wall returns anonymous posts only (no user PII)

---

## PHASE 3 — CIRCLE FEED: WIRE FAITH REACTIONS + IDENTITY

**Agent: FRONTEND**
**Dependency:** Phase 2D (react API confirmed)

This is the highest-leverage phase. `FaithReactions.tsx` is built. It just needs to be in every post card.

### 3A — Fix post card identity

**File:** `app/circle/[id]/posts/page.tsx` (and whatever PostCard component exists)

When fetching posts, JOIN `circle_profiles` on `author_id`:
```typescript
// In the Supabase query for circle_posts:
.select(`
  *,
  author_profile:circle_profiles!author_id(display_handle, avatar_url),
  reactions:circle_reactions(reaction, user_id),
  comment_count
`)
```

In the post card render:
- Replace hardcoded "Sister" with `post.author_profile?.display_handle ?? 'A Sister'`
- Show `CircleAvatar` with `avatar_url` if set, else initial from display_handle
- If author_id === system bot UUID → show Amina system post variant (see Phase 3C)

### 3B — Wire FaithReactions into post card (feed-level)

Every post card in the feed must show faith reactions WITHOUT requiring tap-in to post detail.

```tsx
// Inside PostCard component, below post content:
<FaithReactions
  targetId={post.id}
  targetType="post"
  circleId={circleId}
  existingReactions={post.reactions}
  currentUserId={currentUserId}
  compact={true}
/>
```

`compact={true}` renders: emoji row + counts, single tap to react, hold for picker. This is already handled inside `FaithReactions.tsx`.

Below FaithReactions, show:
```tsx
<button onClick={() => router.push(`/circle/${circleId}/posts/${post.id}`)}>
  <ChatBubbleIcon /> {post.comment_count > 0 ? post.comment_count : 'Reply'}
</button>
<button onClick={() => openShareSheet(post)}>
  <ShareIcon /> Share
</button>
```

### 3C — Amina system post card variant

Amina posts are identified by `author_id === process.env.NEXT_PUBLIC_AMINA_SYSTEM_USER_ID`.

Create `components/circle/AminaSystemPostCard.tsx`:
```tsx
// Visual: Ivory card, left border 3px gold, top label "✦ From Amina" in gold 11px uppercase tracking
// Avatar: Terracotta Rose circle with "A" — NOT the user's avatar
// Content in font-display italic
// FaithReactions wired same as regular post
// No share button (system posts not shareable externally)
// No ⋯ options menu
```

### 3D — Circle detail header enrichment

**File:** `app/circle/[id]/page.tsx` or the header component

Current: Just shows "OUR INTENTION" banner. No circle name visible.

Replace with:
```tsx
<header className="flex items-center justify-between px-4 py-3 bg-cream">
  <BackButton />
  <div className="text-center">
    <h1 className="font-display text-lg text-charcoal">{circle.name}</h1>
    <p className="text-xs text-charcoal/50">{circle.member_count} sisters</p>
  </div>
  <div className="flex gap-2">
    <InviteCodeButton circleId={circleId} />  {/* copies invite code to clipboard */}
    <SettingsButton href={`/circle/${circleId}/settings`} />
  </div>
</header>
```

Keep "OUR INTENTION" banner below the header as a secondary element — don't remove it.

**Acceptance criteria:**
- Every post shows real display_handle (not "Sister")
- FaithReactions visible in feed without tapping into post
- Ameen tap increments count immediately (optimistic update)
- Amina system posts visually distinct
- Circle header shows name + member count

---

## PHASE 4 — POST DETAIL + COMMENTS

**Agent: FRONTEND**
**Dependency:** Phase 2A, Phase 3

### New route: `app/circle/[id]/posts/[postId]/page.tsx`

**Page structure (top to bottom):**
```
← Back to Circle Name

[Full post card — same as feed but non-truncated]
[FaithReactions — full/non-compact mode showing all reactions with names]

─────────────────────────────
Comments (N)
─────────────────────────────

[Comment cards — threaded]
  [Reply button on each comment]
  [Nested replies indented 16px, max 1 level deep]

─────────────────────────────
[Comment composer — sticky bottom]
  [CircleAvatar of current user]
  [Input: "Add a reflection..." placeholder]
  [Send button: Terracotta Rose circle, paper plane icon]
```

**Comment card:**
```tsx
<article className="flex gap-3 py-3">
  <CircleAvatar handle={comment.author_profile?.display_handle} size="sm" />
  <div>
    <p className="text-xs font-medium text-charcoal">
      {comment.author_profile?.display_handle ?? 'A Sister'}
    </p>
    <p className="text-sm text-charcoal/80 mt-0.5">
      {comment.is_deleted ? '[removed]' : comment.body}
    </p>
    <div className="flex gap-4 mt-1">
      <button className="text-xs text-charcoal/40">{timeAgo(comment.created_at)}</button>
      <button className="text-xs text-charcoal/40" onClick={() => setReplyTo(comment)}>Reply</button>
      {comment.author_id === currentUserId && (
        <button className="text-xs text-red-400/60" onClick={() => deleteComment(comment.id)}>Delete</button>
      )}
    </div>
    {/* Nested replies */}
    {comment.replies?.map(reply => <CommentCard key={reply.id} comment={reply} nested />)}
  </div>
</article>
```

**Realtime:** Subscribe to `circle_post_comments` filtered by `post_id` for live comment updates.

**Acceptance criteria:**
- `/circle/[id]/posts/[postId]` renders without error
- Comments load for a post
- Posting a comment appears immediately (optimistic insert)
- Reply to a comment nests correctly
- Soft delete replaces body with "[removed]"

---

## PHASE 5 — DU'A WALL

**Agent: FRONTEND**
**Dependency:** Phase 2B

Schema exists (`dua_wall_posts`, `dua_ameens`). Build the UI.

### New route: `app/dua-wall/page.tsx`

**Page structure:**
```
Du'a Wall                          [🤲 Make Du'a]
"Lift each other in prayer."

[Weekly Amina du'a — gold border card, "✦ From Amina" label]

[Du'a feed — vertical scroll]
  [DuaCard × N]

[+ Make Du'a FAB — bottom right, Terracotta Rose circle]
```

### `DuaCard` component:

```tsx
<article className="bg-ivory rounded-2xl p-4 shadow-soft">
  <p className="text-xs text-charcoal/40 mb-2">A sister from the community · {timeAgo}</p>
  <p className="text-sm text-charcoal leading-relaxed">{dua.content}</p>
  {dua.is_answered && (
    <p className="text-xs text-olive mt-2">✓ Answered — Alhamdulillah</p>
  )}
  <div className="flex items-center justify-between mt-3">
    <AmeenButton
      duaId={dua.id}
      count={dua.ameen_count}
      hasAmeened={dua.user_has_ameened}
    />
    {isOwnPost && !dua.is_answered && (
      <button onClick={() => markFulfilled(dua.id)}
        className="text-xs text-olive/70">
        Mark as answered
      </button>
    )}
  </div>
</article>
```

### `AmeenButton` component:

```tsx
// Untapped: Ivory border, "🤲 Ameen · {count}" in charcoal/60
// Tapped: Terracotta Rose bg, white text "🤲 Ameen · {count}"
// Tap: optimistic toggle → POST/DELETE /api/dua-wall/[duaId]/ameen
// Animate count: number fades +1 / -1
```

### `PostDuaSheet` — bottom sheet:

```tsx
// Triggered by FAB or top right button
// Slides up from bottom (mobile sheet)
// Content:
//   "Make a Du'a" heading in font-display
//   "Your du'a will be shared anonymously with the community." sub-text
//   Textarea (Ivory, rounded-xl, 4 rows): "Ya Allah..." placeholder
//   Character counter: 280 max
//   Submit button: "Share Du'a 🤲" Terracotta Rose
//   Dismiss: tap outside or "×" top right
```

**Wire bottom nav:** Add Du'a Wall tab to `BottomNav.tsx`:
```
Home | Circle | Reflections | Du'a Wall | Profile
```
Icons: house | geometric circle | bookmark | hands/🤲 | person
Active state: Terracotta Rose with underline dot.

**Acceptance criteria:**
- `/dua-wall` renders feed of du'as from `dua_wall_posts`
- Ameen tap toggles in `dua_ameens`, count updates immediately
- Post du'a sheet submits to `dua_wall_posts`
- Own du'a shows "Mark as answered" button
- Answered du'as show "✓ Answered — Alhamdulillah"
- Bottom nav shows Du'a Wall tab with correct active state

---

## PHASE 6 — CIRCLE JOIN (DEDICATED ROUTE)

**Agent: FRONTEND**
**Dependency:** Phase 0

### New route: `app/circle/join/page.tsx`

Three states in sequence:

**State 1 — Code Entry:**
```
[← back]
"Join a Circle" (font-display)
"Enter the admission code shared with you."

[6-character code input — large, centered, one box per character OR single field]
[Join → button, disabled until 6 chars entered]
```

**State 2 — Circle Preview (code valid):**
```
[Blurred circle avatar]
"[Circle Name]"
"[member_count] sisters · Private circle"
"[First 60 chars of intention]..."

[Join this Circle — Terracotta Rose]
[Not now — ghost]
```

**State 3 — Joined:**
```
[Animated checkmark or gold star burst]
"Bismillah. You're in."
"Welcome to [Circle Name]."

[Enter Circle →]
```

**Error state (wrong code):**
```
Inline error below input: "That code doesn't seem right. Check with the sister who invited you."
Input border: red/40
```

**Acceptance criteria:**
- Code validation hits existing admission code API
- Correct code shows circle preview (name, count, intention)
- Join creates `circle_memberships` row
- Wrong code shows inline error (no page change)

---

## PHASE 7 — SHARE CARD

**Agent: FRONTEND**
**Dependency:** Phase 2C

### `ShareCard` component (`components/circle/ShareCard.tsx`)

Used in post detail and post feed (share button).

When tapped:
1. Call `GET /api/circles/[circleId]/posts/[postId]/share` → get share metadata
2. Generate share card (HTML canvas or styled div):
```
┌─────────────────────────────────┐
│  [Amina logo — small, top left] │
│                                 │
│  "Ya Allah, ease what is        │
│  heavy for the sisters who      │
│  can't say it out loud..."      │
│                                 │
│  — A Sister from The Circle     │
│                                 │
│  amina.app                      │
└─────────────────────────────────┘
Background: #F7F2EB (cream)
Text: Canela italic for quote, Inter for footer
Gold accent line at bottom
```
3. Convert to PNG via `html-to-image` or canvas
4. Trigger native share sheet: `navigator.share({ files: [imageFile], title: 'A reflection from The Circle' })`
5. Fallback (desktop/no share API): show "Copy link" button with the share URL

**Install if missing:**
```bash
pnpm add html-to-image
```

**Acceptance criteria:**
- Share button on post generates a branded cream card
- Card contains post excerpt (not circle name, not member info)
- Native share sheet opens on mobile
- Copy link fallback works on desktop

---

## PHASE 8 — EMPTY STATES + POLISH

**Agent: FRONTEND**
**Dependency:** Phase 3, 4, 5

### 8A — Circle feed empty state

When `circle_posts.length === 0`:
```tsx
<div className="flex flex-col items-center justify-center py-16 gap-4">
  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
    <SparkleIcon className="text-gold w-8 h-8" />
  </div>
  <p className="font-display italic text-xl text-charcoal">Be the first to share</p>
  <p className="text-sm text-charcoal/50 text-center max-w-xs">
    Open this Circle with a reflection, a du'a, or a thought.
    Your sisters are waiting.
  </p>
  <button onClick={openComposer} className="btn-primary">Share something ✦</button>
</div>
```

### 8B — Du'a Wall empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 gap-4">
  <p className="text-4xl">🤲</p>
  <p className="font-display italic text-xl text-charcoal">No du'as yet</p>
  <p className="text-sm text-charcoal/50 text-center max-w-xs">
    Be the first to lift your sisters in prayer.
  </p>
  <button onClick={openPostDuaSheet} className="btn-primary">Make the first Du'a</button>
</div>
```

### 8C — Post composer enrichment

Ensure the circle post composer supports:
- Text post (default)
- Photo upload (select from library → upload to Supabase Storage → set media_url on post)
- Post type label chip: "Reflection | Du'a | Reminder | Quran" — sets `content_type` tag on `circle_posts`

### 8D — Feed infinite scroll

Add cursor-based pagination to the post feed:
```typescript
// Fetch 20 posts per page, cursor = created_at of last post
// Show "Load more" button at bottom OR implement IntersectionObserver infinite scroll
```

---

## PHASE 9 — FINAL WIRE + MERGE

**Agent: DEPLOY + QA**
**Dependency:** All phases complete

### Acceptance gate — run ALL before merge:

**Navigation:**
- [ ] Home tab → `/home` ✓
- [ ] Circle tab → `/circle` ✓
- [ ] Reflections tab → `/reflections` ✓
- [ ] Du'a Wall tab → `/dua-wall` ✓ (NEW — was 404)
- [ ] Profile tab → `/profile` ✓

**The Circle feed:**
- [ ] Posts show real display_handle from `circle_profiles`
- [ ] Faith reactions visible in feed (no tap-in required)
- [ ] Tapping Ameen increments count, tapping again removes
- [ ] Tapping a post → `/circle/[id]/posts/[postId]` ✓ (was dead end)
- [ ] Amina system post has gold border + "✦ From Amina" label
- [ ] Circle header shows: name, member count, invite icon, settings gear
- [ ] Empty feed shows empty state with "Share something ✦" CTA

**Comments:**
- [ ] Post detail loads comments
- [ ] Typing and submitting a comment appears immediately
- [ ] Reply nests under parent comment
- [ ] Own comment has "Delete" option (soft delete)

**Du'a Wall:**
- [ ] Feed loads from `dua_wall_posts`
- [ ] Ameen tap works and count updates
- [ ] Post du'a sheet submits and new dua appears at top
- [ ] "Mark as answered" sets `is_answered=true` and shows confirmation

**Circle Join:**
- [ ] `/circle/join` renders
- [ ] Wrong code shows inline error
- [ ] Correct code shows preview
- [ ] Joining creates membership and routes to circle

**Share Card:**
- [ ] Share button generates cream card with post excerpt
- [ ] Native share sheet opens (iOS)
- [ ] No circle name, no member info on share card

### Merge:
```bash
git add -A
git commit -m "feat: The Circle — real social feed, faith reactions wired, comments, Du'a Wall, share card, circle join"
git push origin feature/circle-social-v3
# Create PR to main and merge (no approval required per standing instructions)
git checkout main
git merge feature/circle-social-v3
git push origin main
```

---

## AGENT ASSIGNMENTS SUMMARY

| Phase | Agent | Task |
|-------|-------|------|
| 0 | DEPLOY | Branch setup |
| 1 | ARCHITECT | Comments migration + Supabase push |
| 2 | BACKEND | API routes (comments, dua wall, share, verify react) |
| 3 | FRONTEND | Wire FaithReactions, fix identity, Amina post card, circle header |
| 4 | FRONTEND | Post detail + comments page |
| 5 | FRONTEND | Du'a Wall route + components |
| 6 | FRONTEND | Circle Join route |
| 7 | FRONTEND | Share card component |
| 8 | FRONTEND | Empty states, composer, infinite scroll |
| 9 | QA + DEPLOY | Full acceptance gate → merge → push |

**Parallelizable after Phase 1 is done:** Phases 3, 4, 5, 6, 7 can run concurrently.
Phase 2 must complete before Phase 3 (react API dependency) and Phase 4 (comments API dependency).
Phase 8 runs after 3, 4, 5.
Phase 9 is last.

---

## NON-NEGOTIABLES

1. Every post shows a real identity. "Sister" is only shown if `circle_profiles.display_handle` is NULL.
2. FaithReactions must be visible in the feed without tapping into post detail.
3. Du'a Wall must be accessible from bottom nav — update `BottomNav.tsx`.
4. Share card must NEVER expose circle name, member count, or admission code.
5. Comments must use soft delete only — no hard delete. Body becomes "[removed]".
6. All new routes must have loading skeletons. Use `CircleDetailSkeleton` as reference.
7. Merge to main only after ALL acceptance criteria pass.
