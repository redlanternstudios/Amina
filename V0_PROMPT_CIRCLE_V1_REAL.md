# V0 PROMPT — AMINA CIRCLE V1 REAL
Paste this entire block into v0 before generating any Circle screen.
Last updated: 2026-06-25

---

## WHAT YOU ARE BUILDING

Amina is a faith-centered companion app for Muslim women. Warm, private, spiritually grounded. Not a generic social app.

The Circle is Amina's community layer: small, private groups of sisters who reflect together, support one another, and grow in faith.

You are building 4 missing screens + 2 improvements to existing screens. Everything else is already built. Do not reinvent what exists.

---

## BRAND SYSTEM — NON-NEGOTIABLE

### Colors
```
Cream:           #F7F2EB  — primary background (always)
Ivory:           #F2ECE4  — card backgrounds, inputs, secondary surfaces
Charcoal:        #2C2926  — primary text, headers
Terracotta Rose: #C9796A  — primary CTA, active states, send buttons
Soft Olive:      #8E9878  — topic tag chips, secondary labels
Muted Gold:      #D7BA82  — Amina system posts, invite code cards, premium accents
Charcoal/40:     rgba(44,41,38,0.4) — inactive nav, timestamps, secondary text
Terracotta/10:   rgba(201,121,106,0.1) — selected reaction background
```

### Typography
```
Display/Headers: Canela (serif, italic for key headings and Amina voice)
Body:            Inter (regular 15px, medium 600 for labels)
```

### Radius + Spacing
```
Cards:        rounded-2xl (16px radius)
Chips/pills:  rounded-full
Inputs:       rounded-xl
Page padding: 16px horizontal
Card padding: 16px
```

### What this does NOT look like
- No dark mode (cream is always the base)
- No blue, purple, or gradient colors
- No heavy drop shadows
- No generic social app patterns (no thumbs, no stars, no "shares")
- No emojis as decoration in headers

---

## BOTTOM NAV — LOCKED, DO NOT CHANGE

```
Home         /home
Circle       /circle
Reflections  /reflections
Du'a Wall    /dua-wall
Profile      /profile
```
Active: Terracotta Rose. Inactive: Charcoal/40.
Guidance is NOT in the bottom nav. Never put it there.

---

## DATABASE TABLES — WHAT EXISTS (do not invent new ones)

```
circle_groups         — id, name, intention, topic_tag, is_public, invite_code, created_by, created_at
circle_group_members  — id, circle_id, user_id, display_handle, role (admin/member), joined_at
circle_posts          — id, circle_id, author_id, content, image_url, created_at
circle_reactions      — id, target_id, target_type, user_id, reaction, created_at
circle_comments       — id, post_id, circle_id, author_id, content, created_at
circle_messages       — id, circle_id, author_id, content, created_at
```

---

## ROUTES — WHAT ALREADY EXISTS

```
/circle                        — Circle Home (exists, needs empty state improvement)
/circle/create                 — Create Circle (exists, needs 3-step rewrite)
/circle/[id]                   — Circle Detail (exists, needs header + post card improvements)
/circle/[id]/chat              — Group Messages (exists, don't touch)
/circle/[id]/settings          — Admin settings (exists, don't touch)
```

---

## FAITH REACTIONS — EXACTLY THESE 5

```
ameen          🥲   label: "Ameen"
subhanallah    🌙   label: "SubhanAllah"
alhamdulillah  🌿   label: "Alhamdulillah"
mashallah      🌸   label: "MashaAllah"
heart          ❤️   label: "Heart"
```
No other reactions. No thumbs up. No generic hearts as replacements.

**Compact (in feed):** emoji + count inline, horizontal row
**Expanded (in post detail):** pill chips — "ameen 🥲 42"
**Selected state:** Terracotta/10 background on the pill
**Picker popover:** dark charcoal floating card, shows all 5 with labels

---

## POST CARD — STANDARD MEMBER POST (already built, reference only)

```
[Ivory card, rounded-2xl, padding 16px]

[CircleAvatar 32px]  {display_handle}                          ⋯
                      {X hours ago}

{content — 3 line clamp, "read more" if longer}

[Optional image — full width, rounded-xl, 12px top margin]

[Faith reactions compact row]
🥲 42   🌙 18   🌿 7   🌸 3   ❤️ 12

[💬 3 Replies]   ← tappable → /circle/[id]/posts/[postId]
```

CRITICAL: display_handle is ALWAYS from `circle_group_members.display_handle`. Never hardcode "Sister". Never use real name.
Metric row: faith reactions + reply count ONLY. No shares. No views.

---

## AMINA SYSTEM POST CARD (already built, reference only)

```
[Ivory card, 3px Muted Gold left border, rounded-2xl, padding 16px]

✦ Amina                    [weekly prompt chip — Muted Gold/20 bg, 11px uppercase]
This week

{weekly prompt in Canela italic 16px charcoal}

[Faith reactions compact row]
[💬 X Replies]
```

Identified by: `author_id === process.env.NEXT_PUBLIC_AMINA_SYSTEM_USER_ID`

---

## WHAT TO BUILD — 6 DELIVERABLES IN ORDER

---

### DELIVERABLE 1 — CIRCLE HOME IMPROVEMENT (`/circle`)

**Current problem:** Empty state renders nothing. Requests + Activity tabs exist but are empty and untested. CircleCard member variant shows only name + description.

**Changes needed:**

**Tab bar:** Remove Requests and Activity. Only: `My Circles | Discover`

**Header:**
```
"The Circle" — Canela italic 28px charcoal          [+ icon, routes to /circle/create]
"Your sisterhood." — charcoal/50 14px
```

**My Circles tab — EMPTY STATE:**
```
[centered vertically in tab content area]
[Muted Gold concentric arcs SVG — 64px]
"You haven't joined a Circle yet." — charcoal 18px semibold
"A Circle is a small, private sisterhood.
 Reflect together, support one another, grow in faith." — charcoal/50 14px centered max-w-xs

[Join a Circle 🔑]     — Terracotta Rose pill, routes to /circle/join
[Create a Circle ✦]    — outline ghost pill, charcoal border, routes to /circle/create
```

**My Circles tab — HAS CIRCLES state:**
Each CircleCard (member variant) must show:
```
[CircleAvatar 40px]  {name} — charcoal 15px semibold       [unread badge if >0]
                     [{topic_tag} chip — Soft Olive, 11px]
                     "{member_count} sisters · {last_message_at relative}"
                                                            [›]
```
Tap → `/circle/[id]`

**Discover tab — EMPTY STATE:**
```
"No public circles yet.
 Be the first to start one." — charcoal/50 14px centered
[Create a Circle ✦] — outline ghost pill
```

**Search bar:** Existing component. Filters visible cards client-side by name.

---

### DELIVERABLE 2 — CREATE CIRCLE 3-STEP FLOW (rewrite of `/circle/create`)

**Current problem:** Single-form flow. Skips invite code reveal on success. `intention` and `topic_tag` fields never sent.

**3-step flow with progress bar:**

**STEP 1 — Circle Identity:**
```
[Progress bar — 33% filled, Terracotta Rose, full width top]

"Name your Circle" — Canela italic 28px charcoal
"Give your sisterhood an identity." — charcoal/50 14px

[Circle Name input — Ivory rounded-xl, 56px tall, 16px Inter]
placeholder: "Sisters in Tawakkul"
max 40 chars
[char count bottom right: "0 / 40"]

[Topic tag chips — horizontal scroll row, 12px gap]
Chips: Faith & Belief | Prayer & Worship | Family | New Muslim | Mental Health | Gratitude | Growth
Unselected: Ivory bg, charcoal/60 text, charcoal/20 border
Selected: Soft Olive bg, white text
One selection required.

[Continue →] — full-width Terracotta Rose pill, disabled until name filled AND tag selected
```

**STEP 2 — Set Intention:**
```
[Progress bar — 66%]

"Set your intention" — Canela italic 28px charcoal
"This is the first thing sisters will see." — charcoal/50 14px

[Textarea — Ivory rounded-xl, 120px tall, 16px Inter]
placeholder: "A private space to reflect on trusting Allah through hardship."
max 120 chars
[char count: "0 / 120" bottom right]

[Visibility toggle — two pill options, full width]
🔒 Private  — Terracotta Rose bg, white text (DEFAULT SELECTED)
🌍 Open     — Ivory bg, charcoal/60 text
Toggle between them on tap.

[Continue →] — Terracotta Rose pill, disabled until intention filled
```

**STEP 3 — Review + Create:**
```
[Progress bar — 100%]

"Your Circle is ready" — Canela italic 28px charcoal

[Preview card — Ivory, rounded-2xl, padding 20px]
  [CircleAvatar — generated from name initial, Muted Gold/30 bg]
  "{name}" — charcoal 18px semibold
  [{topic_tag} chip — Soft Olive]
  "{intention}" — charcoal/60 14px italic
  "🔒 Private · Just you right now" — charcoal/40 12px

[Create Circle →] — full-width Terracotta Rose pill, loading state on submit
```

**On success:** Route to `/circle/create/success?id=[id]&code=[invite_code]`
DO NOT route to `/circle/[id]/chat`

**API payload:**
```json
{ "name": "...", "intention": "...", "topic_tag": "faith_belief", "is_public": false }
```

---

### DELIVERABLE 3 — INVITE CODE REVEAL (new: `/circle/create/success`)

**This screen does not exist. Build it from scratch.**

Route reads `id` and `code` from query params.

```
[cream bg, full screen]

[top left — "← My Circles" ghost link, charcoal/60 14px]

[centered content — vertically centered]

[Muted Gold concentric arcs SVG — 80px]

"Your Circle is ready." — Canela italic 32px charcoal
"Now invite your sisters." — charcoal/50 16px

[Invite Code Card — Ivory, rounded-2xl, Muted Gold 1px border, padding 20px, centered]
  "SHARE THIS CODE WITH YOUR SISTERS" — charcoal/40 11px uppercase tracking-widest
  
  {invite_code displayed as spaced chars: A M I N A 7} — Canela italic 36px charcoal centered
  
  [Copy Code 📋] — ghost pill button, charcoal border
    On tap: copies code to clipboard, button text changes to "Copied! ✓" in Soft Olive for 2s

[Two action buttons — side by side, full row, 12px gap]
  [Share via ↗]       — outline ghost pill, Terracotta Rose text + border
  [Open My Circle →]  — Terracotta Rose filled pill

[bottom note — charcoal/40 12px centered, max-w-xs]
"💡 This code never expires. You can find it anytime in Circle Settings."
```

**Behavior:**
- Copy: `navigator.clipboard.writeText(code)`
- Share: `navigator.share({ text: "Join my Circle on Amina 🌙 Use code: {code}\nDownload Amina: [link]" })`
- Open My Circle: `router.push('/circle/[id]')`
- Missing code param: show error state with link to circle settings

---

### DELIVERABLE 4 — JOIN BY CODE (new: `/circle/join`)

**This screen does not exist. Build it as a single page with 3 internal states.**

**STATE 1 — Code Entry (default):**
```
[← back]

"Join a Circle" — Canela italic 30px charcoal
"Enter the code your sister shared with you." — charcoal/50 14px

[6-box OTP input]
Each box: Ivory bg, rounded-xl, 48px wide × 56px tall, Canela italic 24px charcoal
Auto-uppercase. Auto-advance to next box on each character. Backspace goes back.
Paste support: pasting 6 chars fills all boxes at once.

[Paste Code] — Terracotta Rose/70 text link, 14px, centered below boxes

[Find Circle →] — full-width pill
  0-5 chars: charcoal/20 bg, charcoal/40 text (disabled)
  6 chars: Terracotta Rose bg, white text (active)
  Loading: spinner replaces arrow
```

**STATE 2 — Circle Preview (valid code returned):**
```
[OTP boxes remain, all 6 filled, text in Terracotta Rose]

[Slide-up card — Ivory, rounded-2xl, shadow-sm, padding 20px, animate-in from bottom]
  [CircleAvatar 48px]
  "{name}" — charcoal 18px semibold
  [{topic_tag} chip — Soft Olive]
  "{intention}" — charcoal/60 14px italic
  "🔒 Private · {member_count} sisters" — charcoal/40 12px

[Join this Circle →] — full-width Terracotta Rose pill
[Not for me] — charcoal/40 text link centered below
```

**Error banner (invalid code — stays in STATE 1):**
```
[inline banner — Terracotta Rose/10 bg, rounded-xl, padding 12px]
"This code doesn't match any Circle. Check with your sister and try again."
```

**STATE 3 — Confirmed (after join):**
```
[OTP input gone]

[centered content]
[Muted Gold concentric arcs SVG — 64px]
"Welcome, Sister." — Canela italic 32px charcoal
"You've joined {circle_name}.
 May this Circle be a source of barakah for you." — charcoal/60 14px centered

[Open The Circle →] — full-width Terracotta Rose pill → /circle/[id]
[Go to My Circles] — charcoal/40 text link centered → /circle
```

**Already-member case:** Skip to STATE 3 with "You're already in this Circle."
**Circle full:** Error banner: "This Circle has reached its max sisters."

**API calls:**
- STATE 1 → STATE 2: `GET /api/circles/preview?code=[code]`
- STATE 2 → STATE 3: `POST /api/circles/join` with `{ invite_code: code }`

---

### DELIVERABLE 5 — CIRCLE DETAIL IMPROVEMENTS (`/circle/[id]`)

**Current problems:** Header too thin, posts show hardcoded "Sister", no Amina system post visual, no ⋯ post options, no empty feed state, tapping "X replies" does nothing.

**ENRICHED HEADER:**
```
[← back]  [CircleAvatar 40px]  {name — 16px semibold}       [🔗]  [⚙️ — admin only]
           [{member_count} sisters · {topic_tag — Soft Olive chip}]

[Intention Banner — cream bg, Muted Gold left border 3px, rounded-xl, padding 12px, full width]
"Our intention: {intention}" — charcoal/60 13px italic
[Collapsible — show chevron, collapsed after first view via localStorage flag]
```

**TAB BAR:** Posts | Messages | Members (unchanged, no new tabs)

**POSTS TAB — EMPTY STATE:**
```
[centered in tab area]
🌙 — 40px
"This Circle is just getting started." — charcoal 16px semibold
"Be the first to share something with your sisters." — charcoal/50 14px centered
[Share something 🌿] — Terracotta Rose pill, opens post composer sheet
```

**POST CARD FIXES:**
- `display_handle` from `circle_group_members` — never hardcoded "Sister"
- ⋯ button top right of each card: opens bottom sheet
  - Own post: "🗑️ Delete post" + "✕ Cancel"
  - Other's post: "🚩 Report post" + "✕ Cancel"
  - Admin on any: "🗑️ Remove post" + "🚩 Report to Amina" + "✕ Cancel"
- "[💬 X Replies]" tap → routes to `/circle/[id]/posts/[postId]`

**Amina system post** (author_id === AMINA_SYSTEM_USER_ID): Ivory card with 3px Muted Gold left border, "✦ Amina" label, Canela italic body. Already specced — implement if not already visually distinct.

---

### DELIVERABLE 6 — POST DETAIL + COMMENTS (new: `/circle/[id]/posts/[postId]`)

**This screen does not exist. Build it from scratch.**

```
[status bar]
[← back]   "Post"   [⋯ options]

─── FULL POST ───────────────────────────────────
[Ivory card, no border radius (full bleed to edges)]
[CircleAvatar 40px]  {display_handle} — 15px semibold    {timestamp}

{Full post text — NOT truncated, charcoal 15px, line-height 1.6}

[Optional full-width image — rounded-xl, 12px top margin]

[Faith reactions — expanded pill row]
Each pill that has count > 0: "{label} {emoji} {count}"
Terracotta/10 bg on user's own active reaction
Tapping a pill toggles that reaction

─── REPLIES ─────────────────────────────────────
"3 Replies" — charcoal/40 12px uppercase tracking-widest, 16px top padding

[EMPTY STATE if 0 replies:]
"No replies yet. Be the first to respond." — charcoal/50 14px centered, 24px padding

[REPLY ROWS:]
[CircleAvatar 32px]  {display_handle} — 14px medium     {timestamp}
                     {comment text — charcoal 15px}

─── BOTTOM COMPOSER ─────────────────────────────
[sticky bottom, Ivory bg, border-t charcoal/10, padding 12px 16px]
[CircleAvatar 32px]  [Add a reply...  — Ivory input, rounded-full flex-1]   [→ Terracotta Rose]

Char counter appears at 200+: "{n} / 280" in charcoal/40
Submit via send button OR Enter key
Optimistic insert: new reply appears immediately, rolls back on API failure
```

**API calls this screen needs:**
- `GET /api/circles/[id]/posts/[postId]` — post + reactions
- `GET /api/circles/[id]/posts/[postId]/comments` — comments list
- `POST /api/circles/[id]/posts/[postId]/comments` — add comment body: `{ content: "..." }`

---

## SHARED RULES FOR ALL 6 DELIVERABLES

1. Display name: ALWAYS from `circle_group_members.display_handle`. Never "Sister". Never real name.
2. Loading states: every async fetch shows a skeleton, not a blank screen
3. Error states: every API failure shows an inline banner (not a console.log)
4. Optimistic updates: reactions and comments update immediately, roll back on failure
5. Non-members: 401 from any circle API → redirect to /circle with toast error
6. No shares count, no views count, no reposts on post cards
7. Sharing another sister's post externally: NOT in v1 UI — no share icon on other posts
8. "Replies" not "Comments" — this is the correct term for circle posts

---

## WHAT TO NEVER BUILD

- Settings as a tab inside circle detail
- "Reflections" as a tab inside circle detail
- Guidance in the bottom nav
- Dark mode or dark backgrounds (exception: Faith Reactions picker popover = dark charcoal)
- Star ratings or thumbs up/down
- "Like" counts (replaced entirely by faith reactions)
- Share count or view count on any post card
- Generic user avatars (always use CircleAvatar with initials fallback)
- A 4th or 5th tab in Circle Home (only My Circles + Discover)

---

## SCREENS REFERENCE — WHAT EXISTS VS WHAT YOU'RE BUILDING

| Screen | Route | Status |
|--------|-------|--------|
| Circle Home | /circle | EXISTS — improve empty state + tabs |
| Create Circle | /circle/create | EXISTS — rewrite as 3-step |
| Invite Code Reveal | /circle/create/success | BUILD FROM SCRATCH |
| Join by Code | /circle/join | BUILD FROM SCRATCH |
| Circle Detail | /circle/[id] | EXISTS — enrich header + cards |
| Post Detail + Replies | /circle/[id]/posts/[postId] | BUILD FROM SCRATCH |
| Circle Chat | /circle/[id]/chat | EXISTS — DO NOT TOUCH |
| Circle Settings | /circle/[id]/settings | EXISTS — DO NOT TOUCH |
| Members Tab | inside /circle/[id] | EXISTS — DO NOT TOUCH |
