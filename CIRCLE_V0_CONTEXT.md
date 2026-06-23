# AMINA — THE CIRCLE v0 DESIGN CONTEXT
**Paste this block at the start of every v0 Circle session.**
**Last updated: 2026-06-22 | Status: LOCKED**

---

## WHO YOU ARE DESIGNING FOR

Amina is a faith-centered companion app for Muslim women. It is warm, private, and rooted in sisterhood. It is not a generic social app. Every design decision should feel intentional, grounded, and spiritually aligned.

The Circle is Amina's community layer: small, private groups of sisters who reflect together, support one another, and grow in faith.

**Design posture:**
- Calm, not urgent
- Warm, not cold
- Intimate, not broad
- Spiritually resonant, not decorative

---

## BRAND SYSTEM (NON-NEGOTIABLE)

### Colors
```
Cream:         #F7F2EB  — primary background
Ivory:         #F2ECE4  — card backgrounds, secondary surfaces
Charcoal:      #2C2926  — primary text, headers
Terracotta Rose: #C9796A — primary action color, CTAs, active states
Soft Olive:    #8E9878  — topic tags, secondary chips, nature accents
Muted Gold:    #D7BA82  — premium accents, Amina system posts, invite code cards
Rose/Terracotta light: #C9796A at 10% opacity — selected reaction bg, subtle highlights
```

### Typography
```
Display/Headers: Canela (serif, italic for key headings and Amina voice)
Body:            Inter (regular 15px, medium 600 for labels)
```

### Radius + Spacing
```
Cards:   rounded-2xl (16px)
Chips:   rounded-full
Buttons: rounded-full (pill shape)
Inputs:  rounded-xl
Standard card padding: 16px
Page horizontal padding: 16px
```

### What Amina does NOT look like
- No dark mode (cream is the base, always)
- No bold primary colors (no blue, purple, green gradients)
- No heavy drop shadows
- No emojis as decoration in headers
- No Instagram-style bold serif display fonts
- No "tech startup" minimalism — this is warm and considered

---

## LOCKED BOTTOM NAVIGATION

This is fixed. Do not deviate.

```
Position 1:  Home         🏠   /home
Position 2:  Circle       🔮   /circle
Position 3:  Reflections  🔖   /reflections
Position 4:  Du'a Wall    🤲   /dua-wall
Position 5:  Profile      👤   /profile
```

**Active tab color:** Terracotta Rose (#C9796A)
**Inactive tab color:** Charcoal at 40% opacity

**CRITICAL: Never show Guidance in the bottom nav. Guidance is accessible only via Home quick chips.**

---

## CIRCLE ARCHITECTURE — WHAT IS ACTUALLY BUILT

The following is real. Do NOT invent components or routes outside this list.

### Database tables (confirmed in Supabase)
- `circle_groups` — id, name, intention, topic_tag, is_public, invite_code, created_by, created_at, cover_image_url
- `circle_group_members` — id, circle_id, user_id, display_handle, role (admin/member), joined_at
- `circle_posts` — id, circle_id, author_id, content, image_url, created_at
- `circle_reactions` — id, target_id, target_type (post/comment), user_id, reaction (ameen/subhanallah/alhamdulillah/mashallah/heart), created_at
- `circle_comments` — id, post_id, circle_id, author_id, content, created_at
- `circle_messages` — id, circle_id, author_id, content, created_at (group chat, separate from posts)

### Routes (confirmed built)
- `/circle` — Circle Home (4 tabs: My Circles, Discover, Requests, Activity)
- `/circle/create` — Create Circle (currently 1-step form, being upgraded to 3-step)
- `/circle/[id]` — Circle Detail (tabs: Posts, Messages, Members)
- `/circle/[id]/chat` — Group Messages
- `/circle/[id]/posts` — Posts list (may redirect to [id] tab)
- `/circle/[id]/settings` — Admin settings

### Routes being built NOW (design these as new screens)
- `/circle/create/success` — Invite Code Reveal (NEW — most important screen)
- `/circle/join` — Join by Code (NEW — 3-state flow)
- `/circle/[id]/posts/[postId]` — Post Detail + Comments (NEW)

### Key components (confirmed exist in codebase)
- `CircleCard` — member and discover variants
- `CircleAvatar` — shows cover photo if set, else generates colored initial avatar
- `FaithReactions` — compact row of 5 reactions (see exact reactions below)
- `CreateCircleForm` — being upgraded

---

## FAITH REACTIONS — EXACT SPEC

There are exactly 5 faith reactions. Use these exact emojis and labels. Never replace with generic hearts/thumbs.

```
ameen         🥲   label: "Ameen"          arabic: "آمين"
subhanallah   🌙   label: "SubhanAllah"
alhamdulillah 🌿   label: "Alhamdulillah"
mashallah     🌸   label: "MashaAllah"
heart         ❤️   label: "Heart"
```

**Compact display (in feed):** Show each reaction as emoji + count inline, horizontal row
**Expanded display (in post detail):** Show as pill chips: "ameen 🥲 42"
**Selected state background:** Terracotta Rose at 10% opacity
**Picker popover:** Dark charcoal floating card above the post, shows all 5 with labels

---

## POST CARD SPEC — STANDARD MEMBER POST

```
[Ivory card, rounded-2xl, padding 16px]

[CircleAvatar 32px]  {display_handle from circle_group_members}     ⋯
                      {X hours/minutes ago}

{post content — 3 line clamp with "read more" if longer}

[Optional: full-width image if image_url set, rounded-xl, 12px top margin]

[FaithReactions compact row]
ameen 🥲 42   🌙 18   🌿 7   🌸 3   ❤️ 12

[💬 3 replies]  ← tappable → routes to /circle/[id]/posts/[postId]
[🔖 Save]       ← bookmark icon, saves post to personal Reflections
```

**CRITICAL RULES FOR POST CARDS:**
- Display name is ALWAYS from `circle_group_members.display_handle` — never "Sister" hardcoded, never the real name
- Metric row shows: faith reactions + reply count ONLY
- NO "shares" count, NO "views" count, NO "reposts"
- Sharing another sister's post externally is NOT allowed in v1
- "Replies" not "Comments" — this is the correct terminology for Circle posts

---

## AMINA SYSTEM POST CARD — DISTINCT VISUAL TREATMENT

Amina AI posts a weekly reflection prompt to each circle. These look DIFFERENT from member posts.

```
[Ivory card, 3px Muted Gold left border, rounded-2xl, padding 16px]

✦ Amina                           [weekly prompt chip — Muted Gold/20 bg, 11px uppercase]
This week

{weekly reflection question in Canela italic 16px charcoal}
"What is one thing you want to let go of, and offer to Allah?"

[FaithReactions compact row]
[💬 X replies]
```

**Identification:** Post where `author_id` = `AMINA_SYSTEM_USER_ID` (env var). No other visual cues needed.

---

## CIRCLE DETAIL PAGE TABS

**Correct tab order:** `Posts | Messages | Members`

**WRONG — do not use:** Reflections | Members | Settings

"Reflections" as a tab name conflicts with the global Reflections page. Do not use it inside The Circle.

Settings is NOT a tab. Settings is accessed via a ⚙️ gear icon in the header, visible to admin/creator only.

---

## CIRCLE DETAIL HEADER — FULL SPEC

```
[← back]  [CircleAvatar 40px]  {Circle Name 16px semibold charcoal}    [🔗 share]  [⚙️ settings — admin only]
           [{member_count} sisters · {topic_tag} chip (Soft Olive)]

[Intention Banner — cream bg, Muted Gold left border 3px, rounded-xl, padding 12px]
"Our intention: {intention text in charcoal/60 13px italic}"
[Collapsible — collapsed by default after first view]
```

---

## CIRCLE AVATAR RULES

- If `cover_image_url` is set on the circle → show the image (circle cropped, 40px in list, 56px in detail header)
- If `cover_image_url` is null → show auto-generated initial avatar: first letter of circle name in Canela italic, on a Muted Gold/30 background, circle shape
- Admin can upload a cover image in Circle Settings

---

## POST OPTIONS SHEET (⋯ tap on a post)

**Own post:**
```
Bottom sheet (cream bg, rounded-t-2xl):
🗑️  Delete post
✕   Cancel
```

**Another sister's post:**
```
Bottom sheet:
🚩  Report post
✕   Cancel
```

**Admin on any post:**
```
Bottom sheet:
🗑️  Remove post
🚩  Report to Amina
✕   Cancel
```

---

## MEMBER PROFILE SHEET (tap on a member in Members tab)

```
Bottom sheet — cream bg, rounded-t-2xl

[CircleAvatar 56px centered]
{display_handle in Canela italic 22px centered}
{role} · Joined {formatted date}
[{topic_tag chip — Soft Olive}]

[If viewer is admin and member is not self:]
[👑 Make Admin]     — Muted Gold/20 bg, charcoal text
[Remove from Circle] — Terracotta Rose/10 bg, rose text

[If viewer is member (not admin):]
[Report this sister] — charcoal/20 bg, charcoal/60 text
```

---

## SHARE INVITE SHEET — EXACT SPEC

Triggered by 🔗 icon in circle detail header.

```
Bottom sheet — cream bg, rounded-t-2xl

"Invite a sister" — Canela italic 24px charcoal centered

[Invite Code Card — Ivory, rounded-2xl, Muted Gold border]
  "SHARE THIS CODE WITH YOUR SISTERS" — 11px uppercase charcoal/40
  
  {invite_code in Canela italic 36px charcoal, spaced: A M I N A 7}
  
  [Copy 📋] — ghost pill button

[Share via row — 4 app icons]
[WhatsApp]  [iMessage]  [Telegram]  [More...]
Each icon in a 48px circle, Ivory bg, charcoal icon

[Pre-written message preview card — Ivory rounded-xl]
"Assalamu alaykum sister! 🌙
 I started a Circle called '{circle_name}' on Amina.
 Join us with code: {invite_code}"

[Close] — charcoal/40 text button, centered
```

---

## REPORT SHEET — EXACT SPEC

```
Bottom sheet — cream bg, rounded-t-2xl

"Why are you reporting this?" — Canela italic 22px charcoal

[5 radio options — Ivory cards, rounded-xl, each 56px tall]
○ Inappropriate content
○ Spam or misleading
○ Unkind or harmful to a sister
○ Against Islamic values
○ Other

[Optional note]
[Textarea placeholder: "Add any details that might help..."]
[rounded-xl, Ivory bg, charcoal text, 80px tall]

[Submit Report] — Terracotta Rose full-width pill
[Cancel] — charcoal/40 centered text button
```

---

## POST COMPOSER SHEET — EXACT SPEC

Opens as bottom sheet when sister taps compose button in feed.

```
Bottom sheet — cream bg, rounded-t-2xl, 80% screen height

[Post →]                              ← top right, Terracotta Rose when text present

"Share with your sisters"            ← Canela italic 20px charcoal

[Text area — no border, cream bg, 16px, full width]
Placeholder: "Share a reflection with the sisters in this circle..."
Pre-fillable: if coming from Amina AI "share to circle" flow, text is pre-populated

[Large dashed card — Ivory, rounded-2xl, dashed border charcoal/20]
  "📷 Add an image"
  "Share a photo or graphic with your post"
  charcoal/40 centered

[Add image 📷] pill button — bottom left, Ivory bg charcoal text
[{char count} / 500] — bottom right, charcoal/40

Max: 500 characters
```

---

## SCREENS NEEDED — BUILD ORDER

Use this list to know what screens still need to be designed in v0.

### ✅ Designed (may need corrections per CTP)
- Circle Home (`/circle`) — 2 tabs: My Circles + Discover
- Circle Detail Feed (`/circle/[id]`)  
- Create Circle Form (1-step old version)
- Members Tab + Member Profile Sheet
- Faith Reactions Picker
- Post Options Sheet
- Report Sheet
- Share Invite Sheet
- Post Composer Sheet

### ❌ NOT DESIGNED YET — Design these next in v0

**1. Invite Code Reveal** (`/circle/create/success`) — HIGHEST PRIORITY
After a sister creates a circle, she lands here to see her code and share it.
```
Screen: cream bg
Top left: "← My Circles" ghost link

[Center content — vertically centered]
[Muted Gold concentric arcs SVG, 80px]
"Your Circle is ready." — Canela italic 32px charcoal
"Now invite your sisters." — charcoal/50 16px

[Invite Code Card — Ivory, rounded-2xl, Muted Gold border 1px]
  "SHARE THIS CODE WITH YOUR SISTERS" — 11px uppercase charcoal/40
  {invite_code in Canela italic 36px, spaced: A M I N A 7}
  [Copy Code 📋] — ghost pill below code
                   shows "Copied! ✓" in Soft Olive for 2s

[Two buttons side by side]
  [Share via ↗]  — ghost/outline pill, Terracotta Rose text
  [Open My Circle →]  — Terracotta Rose filled pill

[Bottom note — charcoal/40 12px centered]
"💡 This code never expires. You can find it anytime in Circle Settings."
```

**2. Join by Code** (`/circle/join`) — 3 states

STATE 1 — Code Entry:
```
Header: [← back]  "Join a Circle" — Canela italic 30px  
Sub: "Enter the code your sister shared with you." — charcoal/50 14px

[6-box OTP input — each box Ivory, rounded-xl, 48px × 56px, large Canela text]
Auto-uppercase. Auto-advance on each char. Paste support.

[Paste Code] — rose/60 text link below boxes

[Find Circle →] — full-width Terracotta Rose pill
Disabled (charcoal/20 bg) until 6 chars entered
```

STATE 2 — Circle Preview (valid code):
```
[OTP boxes remain, all filled, rose text]

[Slide-up Ivory card, rounded-2xl, shadow-sm]
  [CircleAvatar 48px]
  "Sisters in Tawakkul" — charcoal 18px semibold
  [Faith & Belief chip — Soft Olive]
  "A private space to reflect on trusting Allah..." — charcoal/60 14px italic
  "🔒 Private · 12 sisters" — charcoal/40 12px

[Join this Circle →] — full-width Terracotta Rose pill
[Not for me] — charcoal/40 text link centered below
```

STATE 3 — Confirmed:
```
[Centered, OTP input gone]
[Muted Gold concentric arcs SVG, 64px]
"Welcome, Sister." — Canela italic 32px charcoal
"You've joined Sisters in Tawakkul.
 May this Circle be a source of barakah for you." — charcoal/60 14px centered

[Open The Circle →] — full-width Terracotta Rose pill
[Go to My Circles] — charcoal/40 text link centered
```

**3. Post Detail + Comments** (`/circle/[id]/posts/[postId]`):
```
Header: [← back]  "Post"  [⋯ options]

[Full post card — Ivory, rounded-none, full-bleed]
[avatar 40px]  {display_handle} — charcoal 15px semibold    {timestamp}
{Full post text — not truncated, charcoal 15px}
[Image full width if present]

[FaithReactions — expanded pill row]
"ameen 🥲 42 · subhanallah 🌙 18 · alhamdulillah 🌿 7"

[Divider]
"3 Replies" — charcoal/40 12px uppercase tracking

[Comment rows]
[avatar 32px]  {display_handle} · 2h ago
{comment text — charcoal 15px}

[Empty state if 0 replies:]
"No replies yet. Be the first to respond."

[Bottom composer — pinned, ivory bg, border-t]
[avatar 32px]  [Add a reply...  placeholder]   [→ rose send icon]
```

**4. Create Circle — 3-Step Flow** (redesign of existing `/circle/create`):

Step 1:
```
[Progress bar: 1 of 3 — 33% filled, Terracotta Rose]
"Name your Circle" — Canela italic 28px
"Give your sisterhood an identity." — charcoal/50 14px

[Circle Name input — Ivory rounded-xl, 56px tall, 16px text]
placeholder: "Sisters in Tawakkul"
[0 / 40 char count — bottom right of input]

[Topic tag row — horizontal scroll of chips]
[Faith & Belief] [Prayer & Worship] [Family] [New Muslim]
[Mental Health] [Gratitude] [Growth]
Unselected: Ivory bg, charcoal/60 text
Selected: Soft Olive bg, white text

[Continue →] — full-width Terracotta Rose pill
Disabled until name entered AND tag selected
```

Step 2:
```
[Progress bar: 2 of 3 — 66%]
"Set your intention" — Canela italic 28px
"This is the first thing sisters will see." — charcoal/50 14px

[Textarea — Ivory rounded-xl, 120px tall]
placeholder: "A private space to reflect on trusting Allah through hardship."
[0 / 120 char count]

[Visibility toggle — two pill options]
🔒 Private  (Terracotta Rose — selected by default)
🌍 Open

[Continue →] — Terracotta Rose pill
```

Step 3:
```
[Progress bar: 3 of 3 — 100%]
"Your Circle is ready" — Canela italic 28px

[Preview card — Ivory, rounded-2xl, padding 20px]
  [CircleAvatar — generated from name initial]
  "{name}" — charcoal 18px semibold
  [{topic_tag} chip — Soft Olive]
  "{intention}" — charcoal/60 14px italic
  "🔒 Private · Just you right now" — charcoal/40 12px

[Create Circle →] — full-width Terracotta Rose pill
```

**5. Circle Home Empty State** (improvement to existing `/circle`):
```
[Header]
"The Circle" — Canela italic 28px      [+ New]
"Your sisterhood." — charcoal/50 14px

[Tab bar: My Circles | Discover]

[Empty state centered — My Circles tab]
[Muted Gold geometric circle SVG, 64px]
"You haven't joined a Circle yet." — charcoal 18px semibold
"A Circle is a small, private sisterhood.
 Reflect together, support one another,
 grow in faith." — charcoal/50 14px centered

[Join a Circle 🔑] — Terracotta Rose pill
[Create a Circle ✦] — outline/ghost pill, charcoal border
```

---

## WHAT TO NEVER DESIGN

- "3 shares" or any shares counter on post cards
- "Repost" or "Forward" on post cards
- Settings as a tab inside the circle detail
- "Reflections" as a tab inside the circle detail (it conflicts with the global Reflections page)
- Guidance in the bottom nav
- Dark mode or dark backgrounds (exception: Faith Reactions picker popover uses dark charcoal)
- Star ratings, thumbs up/thumbs down
- "Like" counts (replaced by faith reactions)
- Generic user avatars (always use CircleAvatar component with initials fallback)

---

## PRIVACY MODEL — DESIGN CONSTRAINTS

These constraints must be reflected in what UI elements appear:

| Action | Allowed | Design implication |
|--------|---------|-------------------|
| Share invite code to recruit sisters | ✅ | Share invite sheet, prominent CTA |
| Share your own post externally | ✅ v1 | Own post: show share icon |
| Share another sister's post externally | ❌ | No share option on others' posts |
| View circle content without joining | ❌ | Preview card on join flow only |
| Cross-circle post sharing | ❌ v1 | No cross-circle UI |

Post cards in the feed: metrics row shows ONLY faith reactions + reply count. No share count. No view count.

---

*Paste this entire document as context before generating any Circle screen in v0.*
*Last CTP: 2026-06-22 | Next review: after 3-step Create Circle build is complete*
