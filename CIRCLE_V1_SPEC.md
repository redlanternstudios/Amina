# THE CIRCLE — V1 SPEC
**Date:** 2026-06-22 | **Owner:** Ro | **Status:** LOCKED FOR BUILD

6 essential deliverables. Each one defined to the component level.
Build in order — each deliverable unblocks the next.

---

## BUILD ORDER + DEPENDENCY MAP

```
1. CIRCLE HOME          ← exists, needs enrichment
         ↓
2. CREATE CIRCLE        ← exists, needs intention field + step flow
         ↓
3. INVITE CODE REVEAL   ← MISSING — new screen between create and circle entry
         ↓
4. JOIN BY CODE         ← MISSING — new route /circle/join
         ↓
5. CIRCLE DETAIL FEED   ← exists, needs header + Amina post card + post options
         ↓
6. POST DETAIL + COMMENTS ← MISSING — new route /circle/[id]/posts/[postId]
```

---

## DELIVERABLE 1 — CIRCLE HOME (`/circle`)

### Current state (verified)
- Route exists. 4 tabs: My Circles | Discover | Requests | Activity
- `CircleCard` component exists with `member` and `discover` variants
- Fetches `circle_group_members` → `circle_groups` for My Circles
- Fetches public circles not joined for Discover
- `SearchBar` component wired
- `ActivityItem` type defined but activity data source is just messages — incomplete

### What's broken / missing
- **Empty state** — no circles joined → page renders nothing (no CTA)
- **CircleCard member variant** is thin: shows name + description only. Missing: last activity time, unread badge, topic tag, member count, avatar stack
- **Discover tab** has no public circles seeded — empty with no messaging
- **Requests tab** — no join request flow designed or built (leave empty/hidden for v1)
- **Activity tab** — messages only, incomplete; hide for v1
- **"+ Create" or "Join" CTA** — not visible in default state. Users with no circles need a clear path.

### Spec

**Tab structure for v1:** My Circles | Discover *(drop Requests + Activity — they're empty and untested)*

**Header:**
```
[← back]   The Circle   [+ icon / new circle button]
```
Sub: "Your sisterhood." in charcoal/50 14px

**"+ New" button** top right → routes to `/circle/create`

**Search bar** (existing) — filters `myCircles` by name client-side on My tab, `discoverCircles` on Discover tab

**My Circles tab — empty state:**
```
[Muted Gold circle geometric SVG]
"You haven't joined a Circle yet"
"A Circle is a small, private sisterhood.
 Reflect together, support one another, grow in faith."
[Join a Circle 🔑]  (Terracotta Rose pill)
[Create a Circle ✦]  (ghost/outline pill)
```
Join CTA → `/circle/join`
Create CTA → `/circle/create`

**My Circles tab — has circles:**
Each `CircleCard` (member variant) must show:
```
[CircleAvatar]  Circle Name              [unread count badge if >0]
                topic_tag chip (Soft Olive)
                "12 sisters · 2h ago"
                                                          [›]
```
Fields required from DB: `name`, `topic_tag`, `member_count`, `last_message_at`, `unread` (already in `MyCircle` type)
Tap → `/circle/[id]`

**Discover tab — empty state:**
```
"No public circles yet.
 Be the first to start one."
[Create a Circle ✦]
```
**Discover tab — has circles:**
`CircleCard` discover variant (existing) — no changes needed

### AC
- [ ] My Circles tab shows empty state with two CTAs when no circles joined
- [ ] My Circles tab shows enriched CircleCard with topic_tag, member_count, last_message_at
- [ ] Unread badge shows on card when `unread = true`
- [ ] Discover tab shows empty state when no public circles
- [ ] Requests and Activity tabs removed from v1
- [ ] "+ New" button in header routes to `/circle/create`
- [ ] "Join a Circle" CTA routes to `/circle/join`
- [ ] Search filters visible cards client-side

### DoD
Circle Home renders correctly for both empty and populated states. All taps route correctly. No dead ends.

### Files to edit
- `app/(app)/circle/page.tsx` — remove Requests/Activity tabs, add empty states, update header
- `components/circle/CircleCard.tsx` — enrich member variant with topic_tag + last_message_at

---

## DELIVERABLE 2 — CREATE CIRCLE (`/circle/create`)

### Current state (verified)
- `CreateCircleForm` component: name, description, is_public toggle → `POST /api/circles`
- On success → routes to `/circle/[id]/chat` (skips invite code reveal — WRONG)
- API returns `circle.id` and `invite_code` in response
- Missing from form: `intention` field, `topic_tag` field, multi-step UX

### What's broken / missing
- `intention` field in `circle_groups` table never gets populated (form only sends name + description + is_public)
- `topic_tag` never set
- No step-by-step flow — just one form
- Success redirects to chat, skipping the invite code reveal
- "Intention" is what shows on the circle detail as "OUR INTENTION" — it's the soul of the circle. Currently blank.

### Spec

**Step flow (3 steps, progress bar at top):**

**Step 1 — Circle Identity**
```
[Step 1 of 3]
"Name your Circle"
"Give your sisterhood an identity."

[Circle name input]  max 40 chars, required
placeholder: "Sisters in Tawakkul"

[Topic tag — horizontal chip picker]
Faith & Belief | Prayer & Worship | Family | New Muslim | Mental Health | Gratitude | Growth
One selection required. Soft Olive when selected.

[Continue →]
```

**Step 2 — Set Your Intention**
```
[Step 2 of 3]
"Set your intention"
"This is the first thing sisters will see."

[Multiline textarea] max 120 chars
placeholder: "A private space to reflect on trusting Allah through hardship."
Character counter: "0 / 120"

[Visibility toggle]
🔒 Private  (invite-only — recommended, pre-selected)
🌍 Open     (anyone can join)

[Continue →]
```

**Step 3 — Review + Create**
```
[Step 3 of 3]
"Your Circle is ready"

[Preview card — Ivory rounded-2xl]
  [CircleAvatar — generated from name]
  Circle name (charcoal 18px semibold)
  topic_tag chip (Soft Olive)
  Intention in italic charcoal/60 14px
  🔒 Private · Just you right now

[Create Circle →]  Terracotta Rose full-width
```

**On success:**
- API returns `{ circle: { id, invite_code, name } }`
- Do NOT route to `/circle/[id]/chat`
- Route to `/circle/create/success?id=[id]&code=[invite_code]` (new screen — Deliverable 3)

### Data sent to `POST /api/circles`
```json
{
  "name": "Sisters in Tawakkul",
  "intention": "A private space to reflect on trusting Allah through hardship.",
  "topic_tag": "faith_belief",
  "is_public": false
}
```

### AC
- [ ] 3-step flow with progress bar renders correctly
- [ ] Name input: required, max 40 chars, shows char count
- [ ] Topic tag picker: one selection required, chips render in horizontal scroll
- [ ] Intention textarea: required, max 120 chars, shows char count
- [ ] Visibility toggle: Private pre-selected
- [ ] Step 3 shows live preview with entered values
- [ ] On success → routes to success/reveal screen (NOT to chat)
- [ ] `intention` and `topic_tag` sent in API request body
- [ ] API must accept and save `intention` + `topic_tag` fields

### DoD
A sister completes the 3-step flow. Circle is created in DB with name, intention, topic_tag set. She is routed to the invite code reveal screen. Confirmed via Supabase: `circle_groups` row has all fields populated.

### Files to edit/create
- `components/circle/CreateCircleForm.tsx` — rewrite as 3-step flow with intention + topic_tag
- `app/(app)/circle/create/page.tsx` — update `handleSuccess` to route to reveal screen
- `app/api/circles/route.ts` — ensure `intention` + `topic_tag` are accepted and inserted

---

## DELIVERABLE 3 — INVITE CODE REVEAL

### Current state (verified)
Does not exist. After create, user is dropped into the circle chat with no ceremony and no way to share the invite code.

### What's broken / missing
- Invite code is generated by the API and returned in the response
- No screen exists to display it, copy it, or share it
- The circle is useless until at least one other sister has the code
- The current flow makes the code invisible to the creator

### Spec

**Route:** `/circle/create/success` (query params: `?id=[circleId]&code=[inviteCode]`)

**Screen layout:**

```
[status bar]

[top: "← My Circles" ghost link]

[centered content — vertically centered on cream background]

[Muted Gold geometric circle — concentric arcs SVG, 80px]

"Your Circle is ready." — Canela italic 32px charcoal
"Now invite your sisters." — charcoal/50 16px


[Invite Code Card — Ivory, rounded-2xl, padding 20px, Muted Gold border]

  "Share this code with your sisters"
  in charcoal/40 11px uppercase tracking

  [Code display — Canela italic 36px charcoal centered]
  A M I N A 7

  [Copy Code 📋] ghost button below code — tap copies to clipboard, shows "Copied! ✓" for 2s


[Row of 2 action buttons]
  [Share via ↗]  — triggers native iOS share sheet with pre-written text:
    "Join my Circle on Amina 🌙 Use code: AMINA7
     Download Amina: [link]"
  [Open My Circle →]  — routes to /circle/[id]


[bottom note]
"💡 This code never expires. You can find it anytime in Circle Settings."
in charcoal/40 12px centered
```

**Behavior:**
- `id` and `code` come from query params (set by create success handler)
- "Copy Code" uses `navigator.clipboard.writeText(code)`
- "Share via" uses `navigator.share()` (Web Share API — supported in Capacitor)
- "Open My Circle" → `router.push('/circle/[id]')`

### AC
- [ ] Screen renders at `/circle/create/success` with code from query params
- [ ] Code displays in large readable format (masked as spaced characters: A M I N A 7)
- [ ] Copy button copies code to clipboard + shows "Copied! ✓" confirmation for 2 seconds
- [ ] Share button triggers native share sheet with pre-filled message
- [ ] "Open My Circle" routes to `/circle/[id]`
- [ ] Bottom note is visible
- [ ] If `code` param is missing — show error state with link back to circle settings

### DoD
Creator creates a circle, lands on reveal screen, copies the code, shares it with a sister. No additional steps needed to find the code. Confirmed: code matches the `invite_code` in `circle_groups` table.

### Files to create
- `app/(app)/circle/create/success/page.tsx` — new page

---

## DELIVERABLE 4 — JOIN BY CODE (`/circle/join`)

### Current state (verified)
No route exists. The `GET /api/circles/preview` endpoint exists (validates code, returns circle preview). The `POST /api/circles/join` endpoint exists. Neither is surfaced in a dedicated UI.

### What's broken / missing
- No standalone `/circle/join` page
- The only join path is the Discover tab (public circles) — private circles have no join UI
- Join by code is the primary way private circles grow

### Spec

**Route:** `/circle/join`

**3 states on one page (no route changes between states):**

**State 1 — Code Entry**
```
[← back]

"Join a Circle" — Canela italic 30px charcoal
"Enter the code your sister shared with you." — charcoal/50 14px

[6-box OTP input — each box Ivory, rounded-xl, 48px × 56px, large text]
Accepts letters + numbers. Auto-uppercase. Auto-advance on each character.

[Paste Code] — text link in rose/60 below input

[Find Circle →] — full-width Terracotta Rose pill button
  Disabled until 6 characters entered.
  Loading spinner while API call in flight.
```

**State 2 — Circle Preview (code matched)**
```
[← back]

[code input stays, all 6 boxes filled, rose text]

[Slide-up card — Ivory, rounded-2xl, shadow]
  [CircleAvatar]
  "Sisters in Tawakkul" — charcoal 18px semibold
  topic_tag chip (Soft Olive)
  "A private space to reflect on trusting Allah through hardship." — charcoal/60 14px italic
  "🔒 Private · 12 sisters" — charcoal/40 12px

[Join this Circle →] — Terracotta Rose full-width pill, active
[Not for me] — ghost text link below
```

**State 3 — Confirmed**
```
[centered content, no code input visible]

[Muted Gold circle geometric SVG]

"Welcome, Sister." — Canela italic 32px charcoal
"You've joined Sisters in Tawakkul.
 May this Circle be a source of barakah for you." — charcoal/60 14px centered

[Open The Circle →] — Terracotta Rose full-width pill → routes to /circle/[id]
[Go to My Circles] — ghost text link → routes to /circle
```

**Error states:**
- Invalid code → inline banner: "This code doesn't match any Circle. Check with your sister and try again."
- Circle full → "This Circle has reached its max sisters. Ask the admin if space opens up."
- Already a member → skip to State 3 with message: "You're already in this Circle." + Open button

### AC
- [ ] Page renders at `/circle/join`
- [ ] 6-character OTP input: auto-uppercase, auto-advance, paste support
- [ ] "Find Circle" button disabled until 6 chars entered
- [ ] On valid code: `GET /api/circles/preview?code=[code]` called, preview card renders
- [ ] On invalid code: error banner renders, input clears, stays in State 1
- [ ] "Join this Circle" calls `POST /api/circles/join` with `{ invite_code: code }`
- [ ] On join success: transitions to State 3 with circle name visible
- [ ] "Open The Circle" in State 3 routes to `/circle/[id]`
- [ ] Already-member case handled (skip to confirmed state)

### DoD
A sister enters a valid code → sees circle preview → joins → lands in confirmed state → can open the circle. Non-member cannot see circle content before joining. Confirmed via Supabase: `circle_group_members` row inserted.

### Files to create/edit
- `app/(app)/circle/join/page.tsx` — new page with 3-state flow
- "Join a Circle" CTA on `/circle` empty state → `/circle/join`

---

## DELIVERABLE 5 — CIRCLE DETAIL FEED (`/circle/[id]`)

### Current state (verified)
- Route exists. Tabs: Posts | Messages | Members
- `FaithReactions` component exists: ameen 🥲 | subhanallah 🌙 | alhamdulillah 🌿 | mashallah 🌸 | heart ❤️
- Posts fetched from `circle_posts`, reactions from `circle_reactions`
- `userRole` detected (creator / admin / member)
- Settings gear shows for creator/admin → routes to `/circle/[id]/settings`
- Post composer at bottom (sends to `POST /api/circles/[id]/posts`)

### What's broken / missing
- **Header is thin**: shows avatar + circle name but no member count, no intention, no share/invite button
- **All posts show "Sister"**: `display_handle` from `circle_group_members` not read per-post
- **No Amina system post card**: weekly prompt looks identical to member posts
- **No post options (⋯ menu)**: can't delete own post, can't report
- **Faith reactions show counts** but tapping opens a picker? Need to verify — current `FaithReactions` is compact by default
- **Post detail**: tapping a post has no action — dead end (Deliverable 6 fixes this)
- **Empty feed**: no state for zero posts
- **Messages tab**: exists but may be broken (separate chat from posts)

### Spec

**Enriched Header:**
```
[← back]  [CircleAvatar 40px]  [Circle Name 16px semibold]    [🔗 share]  [⚙️ settings — admin only]
           [member_count sisters · topic_tag chip]
[Intention banner — collapsible, cream bg, gold left border]
"Our intention: {intention}" — charcoal/60 13px italic
```
Intention banner: collapsed by default after first view (use localStorage flag `intention_seen_[id]`)

**Tab bar (unchanged):** Posts | Messages | Members (count)

**Posts tab — empty state:**
```
[centered in feed area]
[🌙 emoji large]
"This Circle is just getting started."
"Be the first to share something with your sisters."
[Share something 🌿] — Terracotta Rose pill, opens composer
```

**Post card — standard member post:**
```
[Ivory card, rounded-2xl, padding 16px]

[avatar 32px]  Sister Maryam           ⋯  (options menu)
               6h ago

"Alhamdulillah, I finally felt peace in my
 salah today after months of struggling..." — 3 line clamp + "read more" if longer

[FaithReactions — compact row]
ameen 🥲 42   🌙 18   🌿 7   🌸 3   ❤️ 12

[💬 3 comments]  ← tappable → /circle/[id]/posts/[postId]
```

**Post card — Amina system post (DISTINCT):**
```
[Ivory card, Muted Gold left border 3px, rounded-2xl, padding 16px]

✦ Amina                           [🌙 weekly prompt chip — gold/20 bg]
This week

"This week's reflection: What is one
 thing you want to let go of, and
 offer to Allah?" — Canela italic 16px charcoal

[FaithReactions — compact row]
[💬 comments count]
```
Amina system post identified by: `author_id` matches the system/Amina account user_id (store in env var `NEXT_PUBLIC_AMINA_SYSTEM_USER_ID`)

**Post options menu (⋯ tap):**
```
Bottom sheet:
Own post:
  🗑️ Delete post  (calls DELETE /api/circles/[id]/posts/[postId])
  ✕ Cancel

Other's post:
  🚩 Report post  (calls POST /api/reports — stub for v1, just show "Thanks for reporting.")
  ✕ Cancel
```

**Post composer (unchanged — pinned bottom):**
"Share with the sisters..." → sends text post

### AC
- [ ] Header shows: back, avatar, name, member_count, topic_tag chip, share icon, settings icon (admin only)
- [ ] Intention banner renders below header, collapsible, gold border
- [ ] Each post shows the poster's `display_handle` (not hardcoded "Sister")
- [ ] Amina system post renders with gold border, "✦ Amina" label, Canela italic body
- [ ] Empty feed state renders with CTA when 0 posts
- [ ] Post options (⋯) opens bottom sheet with Delete (own) or Report (other) options
- [ ] Delete calls API and removes post from local state optimistically
- [ ] Tapping "X comments" on a post routes to `/circle/[id]/posts/[postId]`
- [ ] FaithReactions counts display correctly per post

### DoD
A sister opens a circle, sees real post cards with display handles, sees Amina system post if present, can delete her own posts, can tap into a post detail. Admin sees settings gear. Confirmed: no hardcoded "Sister" text in rendered posts.

### Files to edit
- `app/(app)/circle/[id]/page.tsx` — enrich header, add empty state, add ⋯ menu, add comments tap
- `app/api/circles/[id]/posts/route.ts` — ensure `display_handle` joined from `circle_group_members`

---

## DELIVERABLE 6 — POST DETAIL + COMMENTS (`/circle/[id]/posts/[postId]`)

### Current state (verified)
Route does not exist. Tapping "X comments" is a dead end.

### Spec

**Route:** `/circle/[id]/posts/[postId]`

**Data needed:**
```sql
-- Post
SELECT cp.*, cgm.display_handle
FROM circle_posts cp
JOIN circle_group_members cgm ON cp.author_id = cgm.user_id AND cgm.circle_id = cp.circle_id
WHERE cp.id = [postId]

-- Reactions on post
SELECT reaction, COUNT(*), bool_or(user_id = auth.uid()) as my_reaction
FROM circle_reactions
WHERE target_id = [postId] AND target_type = 'post'
GROUP BY reaction

-- Comments (circle_comments table — exists in schema)
SELECT cc.*, cgm.display_handle
FROM circle_comments cc
JOIN circle_group_members cgm ON cc.author_id = cgm.user_id AND cgm.circle_id = [circleId]
WHERE cc.post_id = [postId]
ORDER BY cc.created_at ASC
```

**API routes needed:**
- `GET /api/circles/[id]/posts/[postId]` — post + reactions
- `GET /api/circles/[id]/posts/[postId]/comments` — comments list
- `POST /api/circles/[id]/posts/[postId]/comments` — add comment

**Screen layout:**
```
[status bar]
[← back]  "Post"  [⋯ options]

─────────────────────────────────────
[Ivory card, full bleed, rounded-none]

[avatar 40px]  Sister Maryam                    6h ago
"This week has been so hard and I keep asking
 Allah why. But then I remembered something
 Amina said to me — that hardship is a sign
 Allah is speaking to you. SubhanAllah. 🌙"
 — charcoal 15px, full text (not truncated)

[FaithReactions — expanded row with counts]
ameen 🥲 42 · subhanallah 🌙 18 · alhamdulillah 🌿 7

─────────────────────────────────────
[3 Comments — charcoal/40 12px]

[comment 1]
[avatar 32px]  Sister Aisha · 2h ago
"Ameen, sister. You are not alone. 🤍"

[comment 2]
[avatar 32px]  Sister Fatima · 1h ago
"BarakAllahu feeki for sharing this."

[comment 3]
[avatar 32px]  Sister Khadija · 45m ago
"This made me cry. Shukran for being so honest."

─────────────────────────────────────
[bottom composer — pinned above keyboard]
[avatar 32px]  [Add a comment...]   [→ send]
```

**Comment behavior:**
- Submit via send button or Enter key
- Optimistic insert (show immediately, roll back on error)
- Empty state: "No comments yet. Be the first to respond."
- Max 280 characters per comment (show counter at 200+)

**FaithReactions in expanded mode:**
- Shows each reaction type that has count > 0 as a pill: "ameen 🥲 42"
- Tapping a pill toggles your reaction (same API as on feed — `POST /api/reactions`)
- User's own active reaction pill gets Terracotta Rose/10 background

### AC
- [ ] Route exists at `/circle/[id]/posts/[postId]`
- [ ] Post renders full text (not truncated)
- [ ] Faith reactions show as expanded pills with counts
- [ ] Comments list renders in chronological order with display handles
- [ ] Comment composer sends `POST /api/circles/[id]/posts/[postId]/comments`
- [ ] New comment appears optimistically without page reload
- [ ] Comment count on feed card updates after submitting (if returning to feed)
- [ ] Empty comment state renders when 0 comments
- [ ] ⋯ menu: Delete (own post) or Report (other's post)

### DoD
A sister taps a post in the feed → opens detail → reads full post → sees all reactions → reads comment thread → adds a comment → comment appears immediately. Confirmed: comment row in `circle_comments` table, reaction toggled in `circle_reactions`.

### Files to create/edit
- `app/(app)/circle/[id]/posts/[postId]/page.tsx` — new page (check if posts subdir exists already)
- `app/api/circles/[id]/posts/[postId]/comments/route.ts` — GET + POST
- Verify `circle_comments` schema: needs `id`, `post_id`, `circle_id`, `author_id`, `content`, `created_at`

---

## SHARED BUILD RULES

**All 6 deliverables must follow:**
1. **No hardcoded display names** — always read from `circle_group_members.display_handle`
2. **RLS enforced** — non-members cannot access any circle content. 401 returns to `/circle` with error toast.
3. **Loading states** — every async fetch shows a skeleton, not a blank screen
4. **Error states** — every API failure shows an inline banner (not a console log)
5. **Optimistic updates** — reactions and comments update immediately, roll back on failure
6. **Halal gate** — post creation currently has no gate. For v1: add a simple profanity filter call inline before insert. Full n8n gate is v1.1.

---

## OPEN QUESTIONS (Tier 2 — Ro to answer)

1. **Intention field in v1 UI** — currently `intention` and `description` are separate fields in the DB. Create form currently sends `description` where `intention` should go. Should we consolidate? **Recommendation:** use `intention` as the primary field, drop `description` from v1 form.

2. **Display handle** — right now it's stored in `circle_group_members.display_handle`. Is this user-set during join, or auto-generated? Current join API auto-assigns. **Recommendation:** let the user set a display name when joining (1 extra field on the join flow, Step 2 of join).

3. **Amina system account** — weekly prompt posts need a system user. Is `amina@yopmail.com` the system account, or should there be a separate `amina-system@...` account? **Recommendation:** create a dedicated system account, store its `user_id` in `AMINA_SYSTEM_USER_ID` env var.

---

*Spec locked: 2026-06-22 | Ready for SwarmClaw dispatch*
