# THE CIRCLE — COMPLETE PRODUCT DEFINITION
**Date:** 2026-06-22 | **Version:** v1 | **Owner:** Ro

---

## CTP — PROMPT CONTRACT

**GOAL:** Define The Circle completely. Every page, subpage, component, tap, state, and sharing mechanic. No gaps. Design-ready.

**CONSTRAINTS:**
- Private by default. External sharing NEVER exposes member content, names, or member count.
- Faith-first tone throughout. No generic social media patterns (likes, follower counts, virality).
- Sharing must serve sisterhood — invite, uplift, and support. Not broadcast.
- The Circle is premium-only. Non-subscribers see a paywall gate.
- Halal gate runs before all content goes live.
- All circle content is anonymous-by-default via display handles, not real names.

**FORMAT:** Section per page → components → tap map → states → sharing mechanics

**FAILURE:** A sister hits a dead end. A share action exposes private data. A tap does nothing. An edge case crashes the flow.

---

## WHAT THE CIRCLE IS

The Circle is Amina's private sisterhood layer. It's the connective tissue between private reflection (Amina AI) and communal growth.

**Core loop:** Sister joins a Circle → shares a reflection, question, or du'a → other sisters react with faith reactions or comment → Amina seeds a weekly prompt to keep the conversation alive.

**Design principle:** It feels like a warm, intimate group chat crossed with a reflection journal — not a social media feed. No public likes. No follower counts. No algorithmic ordering. Chronological only. Contribution is optional, never pressured.

---

## THE CIRCLE — PAGE TREE

```
/circle                          Circle Home
/circle/join                     Join by Code
/circle/create                   Create Circle (3 steps)
/circle/create/success           Invite Code Reveal

/circle/[id]                     Circle Detail (Posts tab default)
/circle/[id]/posts               Posts Feed (same as detail, Posts tab)
/circle/[id]/posts/[postId]      Post Detail + Comments
/circle/[id]/chat                Group Messages (DM thread)
/circle/[id]/members             Members List (same as detail, Members tab)
/circle/[id]/settings            Circle Settings (admin only)

Modals / Sheets (not routes — rendered in-page):
  Post Composer Sheet            Opens from bottom bar in any feed
  Faith Reactions Picker         Opens from reaction tap on any post/message
  Post Options Sheet             Opens from ⋯ tap on any post
  Member Profile Sheet           Opens from member tap in Members tab
  Share Invite Sheet             Opens from 🔗 share tap in header
  Report Sheet                   Opens from Report in Post Options
```

---

## PAGE 1 — CIRCLE HOME (`/circle`)

### Purpose
Discovery and navigation hub. Entry point for all circle activity.

### Layout
```
[Status bar]
[Header]
  Left:    ← back (if navigated from another feature)
           OR blank (if from tab nav — this IS home)
  Center:  "The Circle" — Canela italic 28px charcoal
  Right:   [+ icon] — creates new circle → /circle/create

[Tab bar: My Circles | Discover]
  Active tab: Terracotta Rose underline
  Inactive: charcoal/40

[Search bar — Ivory rounded-xl]
  Placeholder: "Search circles..."
  Filters visible list client-side on type

[Tab content — scrollable]

[Bottom nav — 5 tabs]
```

### Tab: My Circles

**State A — Empty (no circles joined)**
```
[centered in content area]
[Muted Gold concentric circle SVG — 80px]
"You haven't joined a Circle yet"  — Canela italic 22px
"A Circle is a small, private sisterhood.
 Reflect, support one another, grow in faith." — charcoal/50 14px centered

[Join a Circle 🔑]  ← Terracotta Rose pill → /circle/join
[Create a Circle ✦] ← ghost outline pill → /circle/create
```

**State B — Has circles**
Vertical list of `CircleCard` (member variant).

**CircleCard — member variant**
```
[Ivory card, rounded-2xl, padding 14px]
[CircleAvatar 40px]   Circle Name — 16px semibold charcoal
                      [topic_tag chip — Soft Olive pill]
                      "12 sisters · 2h ago"           [unread badge]

Tap anywhere → /circle/[id]
```
- `CircleAvatar`: generated from circle name initials, Terracotta Rose background, white text
- `unread badge`: filled Terracotta Rose circle with count (shows if `unread > 0`)
- `topic_tag chip`: Soft Olive background, white text, pill, 11px
- "2h ago": derived from `last_message_at` via `timeAgo()`
- Long press on card → Post Options Sheet (Leave Circle option)

### Tab: Discover

**State A — Empty**
```
"No public circles yet.
 Be the first to create one."
[Create a Circle ✦] — Terracotta Rose pill → /circle/create
```

**State B — Has public circles**
Vertical list of `CircleCard` (discover variant).

**CircleCard — discover variant**
```
[Ivory card, rounded-2xl, padding 14px]
[CircleAvatar 40px]   Circle Name — 16px semibold
                      topic_tag chip
                      description — 1 line truncated, charcoal/50 13px
                                         [Join] button — Terracotta Rose pill, 32px tall
```
- [Join] tap → calls `POST /api/circles/join` with circle_id (open circles don't need code)
- After join: button becomes "Joined ✓" (greyed), card reappears in My Circles tab
- Tapping the card (not the button) → `/circle/[id]` (if already a member) or show Join confirmation sheet (if not)

### Search behavior
- Filters `myCircles` by name substring on My tab
- Filters `discoverCircles` by name substring on Discover tab
- Empty search results: "No circles found." — minimal, no CTA

### Header [+] button
- Tap → `/circle/create`
- Always visible regardless of membership state

---

## PAGE 2 — JOIN BY CODE (`/circle/join`)

### Purpose
Entry point for sisters joining a private circle via shared admission code.

### Entry paths
- "Join a Circle 🔑" CTA on Circle Home empty state
- Direct deep link (future: `amina://circle/join?code=AMINA7`)
- Tapping a shared invite link in iMessage (future)

### 3-State Flow (single page, state machine)

**State 1: Code Entry**
```
[← back]

"Join a Circle" — Canela italic 30px
"Enter the code your sister shared with you." — charcoal/50 14px

[6-box OTP input]
  Each box: Ivory, rounded-xl, 48×56px, Canela 24px centered
  Auto-uppercase all input
  Auto-advance on each character typed
  Backspace clears current box, moves to previous
  [Paste Code] text link below → reads clipboard, fills all 6 boxes if valid format

[Error banner — shows between input and button if code invalid]
  "This code doesn't match any Circle.
   Double-check with your sister and try again."
  Dismiss X

[Find Circle →] button
  Disabled (grey) until 6 chars entered
  Terracotta Rose when active
  Shows spinner while API in flight: GET /api/circles/preview?code=[code]
```

**State 2: Circle Preview**
Transitions in after successful preview API response.
```
[OTP boxes stay, all filled, text turns Terracotta Rose]

[Slide-up preview card — Ivory, rounded-2xl, shadow-lg, animate from bottom]

  [CircleAvatar 48px]
  "Sisters in Tawakkul" — Canela italic 22px charcoal
  [topic_tag chip]
  "A private space to reflect on trusting Allah
   through hardship." — charcoal/60 14px italic, 2-line max
  "🔒 Private · 12 sisters" — charcoal/40 12px

  [Display handle input — NEW]
  "How should sisters know you?" — label charcoal/60 12px
  [Input: Ivory, rounded-xl, "Sister Nour..." placeholder]
  "This is anonymous. Sisters won't see your real name." — charcoal/40 11px

[Join this Circle →] — Terracotta Rose full-width pill
  Calls POST /api/circles/join with { invite_code, display_handle }
  Shows spinner while in flight

[Not for me] — ghost text link, charcoal/40 → back to State 1
```

**State 3: Confirmed**
```
[Clean screen, no OTP input]

[Muted Gold concentric arcs SVG — 72px]
"Welcome, Sister." — Canela italic 32px charcoal
"You've joined Sisters in Tawakkul.
 May this Circle be a source of barakah." — charcoal/60 14px centered

[Open The Circle →] — Terracotta Rose full-width pill
  → routes to /circle/[id]

[Go to My Circles] — ghost text link → /circle
```

**Edge cases:**
| Scenario | Behavior |
|----------|----------|
| Invalid code | Error banner in State 1. Input cleared. |
| Circle at max capacity | Error banner: "This Circle is full. Ask the admin if space opens up." |
| Already a member | Skip to State 3: "You're already in this Circle." |
| Code expires (if expiry set) | Error banner: "This code has expired. Ask your sister for a new one." |
| No display_handle entered | "Join" button disabled until handle typed |

### Sharing surface on this page
None — this page receives shares, it doesn't send them.

---

## PAGE 3 — CREATE CIRCLE (`/circle/create`)

### Purpose
Let a sister start her own private Circle with a name, intention, and topic.

### 3-Step Flow

**Progress bar:** 4 segments, filled in Terracotta Rose as steps progress. "Step X of 3" below bar.

**Step 1 — Name + Topic**
```
[← back]  [Progress: 1/3]

"Name your Circle" — Canela italic 30px
"Give your sisterhood an identity." — charcoal/50 14px

[Circle name input — Ivory, rounded-xl, 56px]
  placeholder: "Sisters in Tawakkul"
  max: 40 chars
  char counter shown at 30+: "32 / 40"
  required — Continue disabled until typed

[Topic tag — label "Choose a topic" 12px charcoal/60]
[Horizontal chip picker — scrollable]
  Faith & Belief | Prayer & Worship | Family | New Muslim |
  Mental Health | Gratitude | Growth | Grief & Healing
  Inactive: Ivory pill, charcoal/60 text
  Active: Soft Olive background, white text
  One selection required. Continue disabled until one selected.

[Continue →] — full-width Terracotta Rose pill, disabled until both filled
```

**Step 2 — Intention**
```
[← back]  [Progress: 2/3]

"Set your intention" — Canela italic 30px
"This is the first thing your sisters will see." — charcoal/50 14px

[Multiline textarea — Ivory, rounded-xl, 120px tall]
  placeholder: "A private space to reflect on trusting Allah through hardship."
  max: 120 chars
  char counter always visible bottom-right: "0 / 120"
  required

[Visibility — label "Who can join?" 12px charcoal/60]
[Toggle card — Ivory, rounded-2xl]
  [🔒 Private]  Invite-only. Sisters need a code.  ← default selected (Terracotta Rose border)
  [🌍 Open]     Anyone can join from Discover.

[Continue →] — full-width pill, disabled until intention typed
```

**Step 3 — Review**
```
[← back]  [Progress: 3/3]

"Your Circle is ready" — Canela italic 30px
"Review before creating." — charcoal/50 14px

[Preview card — Ivory, rounded-2xl, padding 20px]
  [CircleAvatar — auto-generated from name initials]
  "Sisters in Tawakkul" — Canela italic 22px charcoal
  [Faith & Belief] topic chip — Soft Olive
  "A private space to reflect on trusting
   Allah through hardship." — charcoal/60 14px italic
  🔒 Private · Just you right now

[← Edit] ghost link below card — goes back to Step 1

[Create Circle →] — full-width Terracotta Rose pill
  Calls POST /api/circles with { name, intention, topic_tag, is_public }
  Shows loading spinner
  On success → /circle/create/success?id=[id]&code=[invite_code]
  On failure → inline error banner
```

**Data posted:**
```json
{
  "name": "Sisters in Tawakkul",
  "intention": "A private space to reflect on trusting Allah through hardship.",
  "topic_tag": "faith_belief",
  "is_public": false
}
```

---

## PAGE 4 — INVITE CODE REVEAL (`/circle/create/success`)

### Purpose
Surface the admission code immediately after creation. This is the critical sharing moment — without it, the circle stays empty.

### Entry path
Only from `/circle/create` on success. Query params: `?id=[circleId]&code=[inviteCode]`

### Layout
```
[status bar]
[← My Circles — top left ghost link → /circle]

[centered content — vertically centered, cream background]

[Muted Gold geometric circle SVG — 80px]
"Your Circle is ready." — Canela italic 32px charcoal
"Now invite your sisters." — charcoal/50 16px

[Invite Code Card — Ivory, rounded-2xl, padding 24px, Muted Gold border 2px]

  "SHARE THIS CODE" — charcoal/40 11px uppercase letter-spacing

  [Code display]
  A  M  I  N  A  7  — Canela 40px charcoal, spaced characters

  [Copy Code 📋] — ghost pill button below code
    Tap → navigator.clipboard.writeText(code)
    State change: button text → "Copied! ✓" for 2s, Soft Olive color
    Then reverts

[Share buttons — horizontal row, 2 buttons]
  [🔗 Share Invite →] — Terracotta Rose pill, half-width
    Tap → native share sheet (Web Share API):
      title: "Join my Circle on Amina 🌙"
      text: "I started a Circle called "Sisters in Tawakkul"
             Join with this code: AMINA7
             Download Amina: byredlanternstudios.com/amina"
      url: (future deep link — omit in v1)

  [Open Circle →] — Ivory border ghost pill, half-width
    → /circle/[id]

[Bottom note]
"💡 Find this code anytime in Circle Settings → Invite Code."
— charcoal/40 12px centered
```

### Sharing mechanic (critical)
The share sheet pre-fills the message so the sister doesn't have to write anything. She taps Share, picks WhatsApp/iMessage/etc., sends. Her sister gets the code and a download link.

**What the share message INCLUDES:**
- Circle name (creator owns this, she's sharing it)
- The admission code
- Download link

**What the share message NEVER INCLUDES:**
- Member count (it's 1 right now anyway, but still — never)
- Other members
- Post content
- Any Amina content from inside the circle

---

## PAGE 5 — CIRCLE DETAIL (`/circle/[id]`)

### Purpose
The main experience of being in a circle. Three tabs: Posts | Messages | Members.
Default tab: Posts.

### Header (present on all 3 tabs)
```
[← back]  [CircleAvatar 40px]  "Sisters in Tawakkul"   [🔗]  [⚙️ — admin only]
           [Faith & Belief]     "12 sisters"
```
- CircleAvatar: 40px, generated from name
- Circle name: charcoal 16px semibold, max 1 line (truncates)
- Topic tag chip: Soft Olive, 11px
- "12 sisters": charcoal/40 12px
- [🔗 share icon]: opens **Share Invite Sheet** (see Modals section)
- [⚙️ settings icon]: visible only if `userRole === 'creator' || 'admin'`. Tap → `/circle/[id]/settings`

**Intention Banner** (collapsible, sits below header, above tabs):
```
[Muted Gold left border 3px | cream background | padding 12px]
"Our intention:" — charcoal/40 11px uppercase
"A private space to reflect on trusting Allah through hardship."
— charcoal/60 13px italic

[∧ Collapse] — tap to hide, stores in localStorage: `intention_collapsed_[id] = true`
```
Hidden after collapse. Tap the header area to re-expand (or show [∨ See intention] small link).

**Tab bar:**
```
Posts | Messages | Members (12)
```
Active: Terracotta Rose underline 2px
Inactive: charcoal/40

---

### TAB A — POSTS (`/circle/[id]`)

#### Empty state (0 posts)
```
[centered in feed, below tabs]
🌙 — 40px
"This Circle is just getting started."  — Canela italic 20px
"Be the first to share something with your sisters." — charcoal/50 14px
[Share something 🌿] — Terracotta Rose pill → opens Post Composer Sheet
```

#### Feed (has posts)
Vertical scroll. Chronological (newest first? or oldest first?).
**Design decision:** Oldest first (like a conversation thread — sisters read top to bottom like a chat). This is the right call for intimacy. Most social feeds are newest-first; this breaks that pattern intentionally.

**Standard member post card:**
```
[Ivory card, rounded-2xl, padding 16px, margin 4px vertical]

[avatar 32px]  Sister Maryam              [⋯ options menu]
               6h ago

"Alhamdulillah, I finally felt peace in my
 salah today after months of struggling.
 Has anyone else been through this?" — charcoal 15px, 4-line clamp
[read more] link in rose/70 if truncated

[FaithReactions row — compact]
  ameen 🥲 42  🌙 18  🌿 7  🌸 3  ❤️ 12
  Tapping any reaction → Faith Reactions Picker Sheet (add/change/remove)
  Tapping your active reaction again → removes it

[💬 3 comments] — charcoal/40 13px
  Tap → /circle/[id]/posts/[postId]

[media — if content_type = 'image']
  Image renders below text, rounded-xl, tap → full-screen lightbox
```

**Amina system post card (DISTINCT):**
```
[Ivory card, Muted Gold left border 3px, rounded-2xl, padding 16px]

✦ Amina              [🌙 Weekly Prompt]  — gold/20 chip, gold text
This week

"This week's reflection: What is one
 thing you want to let go of, and
 offer to Allah?" — Canela italic 16px charcoal, full text no truncation

[FaithReactions row]
[💬 7 comments]
```
Identified by: `author_id === AMINA_SYSTEM_USER_ID`
Admin cannot delete Amina system posts.

**Image post card:**
```
[Ivory card, rounded-2xl, padding 16px]

[avatar]  Sister Nour  ⋯
          3h ago

[optional text above image — if body exists]
"Found this beautiful reminder today 🌿"

[image — full card width, rounded-xl, aspect-auto, max-height 320px]
  Tap → full-screen lightbox (pinch to zoom, swipe to dismiss)

[FaithReactions]
[💬 comments]
```

**Post Composer (pinned bottom, always visible on Posts tab):**
```
[Ivory bar, rounded-full, 52px tall, pinned above bottom nav]
[small avatar 28px]  "Share with the sisters..."   [attachment icon] [→ send]
```
- Tap anywhere in bar → opens **Post Composer Sheet**
- Attachment icon → opens image picker (iOS photo library)

#### Post Composer Sheet
```
Bottom sheet, 80% screen height, draggable

[drag handle]
"Share with your sisters" — 16px semibold centered

[Multiline text input — Ivory, rounded-xl, min 120px, auto-grow]
  placeholder: "What's on your heart, sister?"
  max: 500 chars
  char counter shows at 400+

[Image attachment area — shows if image selected]
  [thumbnail 80px × 80px, rounded-xl]  [× remove] top right of thumbnail

[Bottom action row]
  [📷 Add image] — Terracotta Rose ghost pill → opens iOS photo picker
  char counter right

[Post →] — Terracotta Rose pill button, top-right of sheet header
  Disabled until text entered or image attached
  On tap:
    1. Halal gate check (inline API call to /api/halal-check)
    2. If clean → POST /api/circles/[id]/posts with { body, media_url if image, content_type }
    3. Optimistic insert: post appears at bottom of feed immediately
    4. Sheet closes
    On halal gate flag:
    → Show warning: "This post may not align with our community standards.
       Would you like to revise it?"
    [Revise] | [Post Anyway — submits with flag for admin review]
```

**Sharing into The Circle from other features:**

From **Amina Chat:**
After a meaningful exchange, show: "Would you like to share this insight with your sisters?"
[Share to Circle 🌿] → opens a circle picker (if member of multiple circles) → then Post Composer Sheet pre-filled with: "Amina reminded me: [summary of the response]"

From **Reflections:**
On reflection detail page: [Share to Circle] option → same flow as above
Pre-fills with: "[reflection title] — [summary]"

From **Du'a Wall:**
Each du'a has [Share] action → shares to external apps (NOT to circles — du'as are wall-specific)

---

### TAB B — MESSAGES (`/circle/[id]/chat`)

Group DM thread. All members in one thread. Real-time via Supabase Realtime.

**Layout:**
```
[messages scroll — bottom-up, newest at bottom]

[message bubble — other sister]
  [avatar 28px]  Sister Maryam
  "Has anyone done Qiyam al-Layl regularly?
   Would love tips 🌙"
  6h ago

[message bubble — current user]
  "I've been trying — even 2 rakats
   consistently has helped my heart so much"
  [right-aligned, Terracotta Rose/10 background]

[message bubble — Amina system]
  [✦ avatar, gold]
  "A gentle reminder from this week's
   guidance: consistency over perfection.
   Even a small act done regularly is beloved."
  [Muted Gold left border, Canela italic]
```

**Message composer (pinned bottom):**
```
[Ivory bar]
[attachment icon]  [text input — "Message the sisters..."]  [🤲 faith reaction shortcut]  [→ send]
```
- Attachment icon → image picker
- Faith reaction shortcut → single tap adds 🥲 Ameen to last message (quick action)
- Long press on any message → Faith Reactions Picker Sheet
- Long press on own message → [Delete message] option

**Real-time:** Uses Supabase Realtime subscription on `circle_messages` table.
New messages appear without refresh. Typing indicator: "Sister Nour is typing..." (if implemented — v1.1).

**Sharing in Messages:**
No external sharing from messages. Messages are the most private layer — they stay inside the circle.
You CAN forward a message to the Posts tab: long press → "Post to Circle" → pre-fills Post Composer with quoted message text.

---

### TAB C — MEMBERS (`/circle/[id]`)

#### Member list
```
"Sisters in this Circle" — 16px semibold, charcoal. "12 total" right-aligned charcoal/40 12px

[member row × N]
  [avatar 40px]  Sister Nour             Admin  ← badge if role = creator/admin
                 "Joined June 2026"
  Tap → Member Profile Sheet
```

#### Member Profile Sheet
```
Bottom sheet, 50% screen height

[avatar 56px centered]
"Sister Nour" — Canela italic 22px centered
"Admin · Joined June 2026" — charcoal/40 14px centered
[Faith & Belief] topic chip (her preference from profile)

[action buttons — only for admins viewing other members]
  [👑 Make Admin] — promote to admin role
  [🚫 Remove from Circle] — with confirmation dialog
```
Members see other members' sheets but can only [Report] or [Send DM — future v2].
Admins see the management buttons.

---

## PAGE 6 — POST DETAIL + COMMENTS (`/circle/[id]/posts/[postId]`)

### Layout
```
[status bar]
[← back]   Post   [⋯ options]

───────────────────────────────
[Full post — Ivory, full-bleed, no card border]

[avatar 40px]  Sister Maryam                       6h ago

"This week has been so hard and I keep asking
 Allah why. But then I remembered something
 Amina said to me — that hardship is a sign
 Allah is speaking to you. SubhanAllah. 🌙"
 — charcoal 15px, FULL text, no truncation

[FaithReactions — expanded pills]
  ameen 🥲  42  |  🌙  18  |  🌿  7  |  🌸  3  |  ❤️  12
  Each pill: Ivory background, rounded-full, "emoji count" format
  Tapping a pill you've reacted to: removes your reaction (filled → outline)
  Tapping a pill you haven't: adds your reaction
  Tapping [+] at end of row: opens Faith Reactions Picker Sheet

───────────────────────────────
"3 Comments" — charcoal/40 12px, left margin

[comment 1]
  [avatar 32px]  Sister Aisha        2h ago
  "Ameen, sister. You are not alone. 🤍"

[comment 2]
  [avatar 32px]  Sister Fatima       1h ago
  "BarakAllahu feeki for sharing this."

[comment 3]
  [avatar 32px]  Sister Khadija      45m ago
  "This made me cry. Shukran for being so honest."

[empty state if 0 comments]
  "No comments yet. Be the first to respond."
  — charcoal/50 14px centered

───────────────────────────────
[Comment composer — pinned bottom]
[avatar 32px]  [Add a comment...   280 chars max]  [→ send]
```

**Comment behavior:**
- Tap → opens keyboard, input focus
- Counter shows at 230+: "52 / 280"
- Submit: optimistic insert (comment appears immediately), rolls back if API fails
- Long press own comment → [Delete comment] confirmation
- Long press other's comment → [Report comment]

**[⋯ Post Options Sheet] — top right:**
If own post:
- [🗑️ Delete post] → confirmation: "Delete this post? This cannot be undone." [Delete | Cancel]
- [✕ Cancel]

If other's post:
- [🚩 Report post] → [Report Sheet]
- [✕ Cancel]

**Sharing from Post Detail:**
On own post only: [Share this reflection →] — bottom of post, subtle link
→ Opens Share Sheet:
```
Pre-filled text (for external share):
"A reflection from The Circle on Amina 🌙

'This week has been so hard...' [truncated at 100 chars]

Find your sisterhood at byredlanternstudios.com/amina"
```
**CRITICAL:** External share text NEVER includes:
- Circle name
- Member count
- Other members' comments
- Display handle of poster (even her own — anonymity preserved)
The post text itself can be shared IF it's the poster's own post.

---

## PAGE 7 — CIRCLE SETTINGS (`/circle/[id]/settings`)

**Access:** Admin and creator only. Non-admins who navigate here directly → redirect to `/circle/[id]`.

### Layout
```
[← back]   Circle Settings

[Section: Circle Info]
  Circle Name       [edit field or tap to edit]
  Intention         [edit textarea]
  Topic Tag         [chip picker — same as create flow]
  [Save Changes] — Terracotta Rose pill
                   Calls PATCH /api/circles/[id]

[Section: Admission]
  Visibility        Private 🔒 / Open 🌍 [toggle]

  Invite Code
  [A M I N A 7] — large display, charcoal
  [Copy 📋]  [Regenerate 🔄]  [Share 🔗]
  "Regenerating invalidates the current code." — warning 12px charcoal/40
  [Regenerate] → confirmation: "This will invalidate the old code.
                 Sisters with the old code cannot join after this."
                 [Regenerate | Cancel]

  Max Sisters       [Number input, default 50, min 2, max 200]
                    "Current: 12 sisters"

[Section: Danger Zone]
  [Archive Circle] — ghost button, charcoal/40 text
    → confirmation sheet:
      "Archive this Circle?
       Sisters can still read old posts but cannot post or message.
       You can unarchive from settings."
      [Archive | Cancel]

  [Delete Circle] — red/60 text, ghost button
    → confirmation sheet with extra step:
      Type circle name to confirm:
      [input: "Type 'Sisters in Tawakkul' to confirm"]
      [Delete Permanently | Cancel]
      "This is permanent. All posts, messages, and members will be removed."
```

**Invite Code sharing on Settings page:**
Same as reveal screen:
- [Copy 📋]: copies to clipboard
- [Share 🔗]: opens native share sheet with same pre-filled message as Page 4
- [Regenerate 🔄]: requires confirmation → regenerates code in DB → updates display

---

## MODALS / SHEETS (not full pages)

### SHARE INVITE SHEET
**Trigger:** [🔗] icon in circle detail header, [Share] on settings page, [Share Invite →] on reveal screen.

```
Bottom sheet — 45% screen height

[drag handle]
"Invite a sister" — 16px semibold centered

[Code display]
"Your admission code:" — charcoal/40 11px uppercase
A  M  I  N  A  7  — Canela 32px charcoal centered
[Copy 📋] button below code

[Share via]
  [Row of app icons — WhatsApp | iMessage | Telegram | More...]
  Tap any → pre-opens that app with message pre-filled

  Pre-filled message:
  "Assalamu alaykum sister! I started a Circle on Amina 🌙
   Join with code: AMINA7
   Amina is a faith-centered reflection app for Muslim women.
   Download: byredlanternstudios.com/amina"

[Close] — text link bottom
```

Tapping specific app icons: uses URL schemes:
- WhatsApp: `whatsapp://send?text=[encoded_message]`
- iMessage / native share: `navigator.share()`
- Telegram: `tg://msg?text=[encoded_message]`

### FAITH REACTIONS PICKER SHEET
**Trigger:** Tapping any reaction area on a post or message (compact or expanded).

```
Floating popover (not bottom sheet — appears directly above the tapped element):

[dark Charcoal/90 background, rounded-2xl, padding 12px]

5 options in horizontal row:
  🥲 Ameen  |  🌙 SubhanAllah  |  🌿 Alhamdulillah  |  🌸 MashaAllah  |  ❤️ Heart

Each option: emoji (24px) + label below (10px white)
Spacing: even gap between all options

If already reacted: that option has Terracotta Rose/20 background highlight

Tap an option:
  If not currently reacted with this → add reaction (optimistic)
  If already reacted with this → remove reaction (optimistic)
  If reacted with different one → swap (remove old, add new)

Dismiss: tap anywhere outside the picker
```

### POST OPTIONS SHEET
**Trigger:** ⋯ button on any post card or post detail.

```
Bottom sheet, short (~25% height)

[drag handle]
"Post options" — charcoal/40 12px centered

If OWN post:
  [🗑️ Delete post]  — charcoal 16px
  [✕ Cancel]        — charcoal/50 14px

If OTHER'S post:
  [🚩 Report post]  — charcoal 16px
  [✕ Cancel]

If ADMIN viewing any post:
  [🗑️ Remove post]  — red/60 16px
  [🚩 Report post]
  [✕ Cancel]
```

### REPORT SHEET
**Trigger:** "Report post" in Post Options Sheet, "Report comment" from comment long-press.

```
Bottom sheet — 60% height

"Why are you reporting this?" — 18px semibold charcoal

[Radio options — Ivory cards, stacked]
  ○ Inappropriate content
  ○ Spam or misleading
  ○ Unkind or harmful to a sister
  ○ Against Islamic values
  ○ Other

[Optional note]
"Add a note (optional)" — 12px charcoal/60
[text input — Ivory, rounded-xl, 2 rows max]

[Submit Report] — Terracotta Rose pill
  Calls POST /api/reports with { target_id, target_type, reason, note }
  Shows success message: "JazakAllah Khayran. We'll review this."
  Sheet closes

[Cancel] — ghost link
```

### MEMBER PROFILE SHEET
(Defined in Tab C above)

---

## SHARING MECHANICS — COMPLETE MAP

### What can be shared and where

| Content | Within Circle | External | Never external |
|---------|--------------|----------|----------------|
| Admission code | ✅ Share Invite Sheet | ✅ Native share (invite only) | — |
| Circle name | In all internal views | ✅ In invite message only | Member list, post count |
| Your own post | To another Circle (future) | ✅ Own text only, anonymised | Circle name in share |
| Another sister's post | ❌ | ❌ | Always |
| Reflection from Amina AI | ✅ Share to Circle | ❌ | — |
| Circle chat messages | ❌ | ❌ | Always — most private |
| Amina weekly prompt | Within circle via faith reactions | ❌ | — |
| Member profiles | ❌ | ❌ | Always |

### Share flows by trigger

**1. Invite a new sister:**
`[🔗] header → Share Invite Sheet → Copy code OR native share sheet`
Result: Sister receives admission code + download link via iMessage/WhatsApp/etc.

**2. Share your own post externally:**
`Post Detail → [Share this reflection →] (own post only) → native share sheet`
Pre-filled: post text (truncated) + "Find your sisterhood at [link]"
Anonymised: no circle name, no display handle, no member info.

**3. Bring Amina AI insight into the Circle:**
`Chat → "Share to Circle" prompt → Circle picker → Post Composer Sheet`
Pre-filled: "Amina reminded me: [AI response summary]"
Posted as a standard post — goes through halal gate.

**4. Share a Reflection to the Circle:**
`Reflections detail → [Share to Circle] → Post Composer Sheet`
Pre-filled: [Reflection title] — [summary]

**5. Regenerate invite code (admin):**
`Settings → Invite Code → [Regenerate 🔄] → Confirmation → new code shown → [Copy / Share]`

### What is NEVER shareable
- Other sisters' posts (you can react, comment, report — not share out)
- Circle chat messages
- Member names, handles, or profiles
- Member count (externally)
- Circle content to other circles (cross-circle sharing — Phase 2)

---

## DATA MODEL SUMMARY (what must exist in DB)

```sql
circle_groups
  id, name, intention, topic_tag, invite_code, is_open, max_members,
  created_by, member_count, status, created_at, updated_at

circle_group_members
  id, circle_id, user_id, display_handle, role, admin_order,
  joined_at, status

circle_posts
  id, circle_id, author_id, content_type, body, media_url,
  halal_verdict, halal_flags, created_at

circle_reactions
  id, target_id, target_type, circle_id, user_id, reaction, created_at

circle_comments
  id, post_id, circle_id, author_id, content, created_at

circle_messages (group chat)
  id, circle_id, author_id, content, media_url, created_at

reports
  id, reporter_id, target_id, target_type, reason, note, status, created_at
```

---

## OPEN ITEMS — TIER 2 (Ro answers)

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Feed order: newest first or oldest first? | Oldest first — conversation feel |
| 2 | Display handle: user-sets on join, or auto-generated "Sister + word"? | User-sets on join (add to Join flow State 2) |
| 3 | Can a sister be in multiple circles? | Yes — no limit in v1 |
| 4 | Amina system account user_id — use `amina@yopmail.com` or create dedicated? | Dedicated system account, store in env |
| 5 | External share of own post — allowed or not? | Allowed, own post only, anonymised text |
| 6 | Cross-circle sharing (share post to another circle) — v1 or v1.1? | v1.1 — too much complexity for v1 |

---

*Product definition locked: 2026-06-22 | Ready for ChatGPT mockups + SwarmClaw build dispatch*
