# The Circle — v0 Design Prompts (P0 Screens)
**Produced by:** DESIGN → ROBBY
**Date:** 2026-06-09
**Status:** READY FOR v0.dev

## Brand Constants (apply to ALL screens)
- Background: Soft Cream `#F7F2EB`
- Primary accent: Dusty Rose `#D6AAA3`
- Secondary accent: Soft Olive `#8E9878`
- Gold: Muted Gold `#D7BA82`
- Typography: Canela (display/headings) + Inter (body/UI)
- Tone: warm, sisterly, faith-first
- All names are dynamic (no hardcoded names)
- Faith reactions only: ameen · subhanallah · alhamdulillah · mashallah · heart

---

## PROMPT 1 — Circle Home

```
Design a mobile app screen called "The Circle" in a warm, faith-centered aesthetic.

Background: #F7F2EB (Soft Cream). Primary accent: #D6AAA3 (Dusty Rose). Secondary: #8E9878 (Soft Olive). Gold: #D7BA82.
Font: Canela for headings, Inter for body.

Header:
- "The Circle" title in Canela, charcoal
- Search icon (top right)
- Notification bell icon

Below header: 4 horizontal tabs — "My Circles" (active) / "Discover" / "Requests" / "Activity"
Active tab has a Dusty Rose underline.

My Circles tab content (vertical scroll):
- 3 circle cards, each with:
  - Left: circle avatar (round, 48px, warm gradient or soft illustration)
  - Circle name in Inter semibold
  - Member count in small muted text (e.g. "14 sisters")
  - Last activity timestamp (e.g. "2 min ago")
  - Right: unread badge (Dusty Rose pill with white number) on 2 of the cards
- Bottom of list: "Start a Circle" button — Soft Olive background, white text, rounded pill

Bottom navigation bar: 5 icons — Home / Circle (active, Dusty Rose) / Chat / Reflections / Profile
Mobile, iOS-style, no system chrome.
```

---

## PROMPT 2 — Circle Detail: Chat Tab

```
Design a mobile group chat screen inside "The Circle" feature of a faith-centered app for Muslim women.

Background: #F7F2EB. Accent: #D6AAA3. Secondary: #8E9878. Font: Canela headings, Inter body.

Header:
- Back arrow (left)
- Circle name in Canela medium
- Circle avatar (round, 36px)
- Member count ("14 sisters") in muted Inter text
- Info icon (right)

Tabs below header: "Chat" (active, Dusty Rose underline) | "Posts"

Message thread (vertical scroll, newest at bottom):
- 4 messages alternating users
- Each message: sender round avatar (32px), sender first name in Inter semibold (12px), message bubble (ivory background, charcoal text, rounded corners), timestamp
- User's own messages: right-aligned, Dusty Rose bubble, white text
- Each message has a row of faith reactions below: ameen · subhanallah · alhamdulillah · mashallah · heart (small pill buttons, Soft Olive text, cream background). One reaction is "active" (Dusty Rose fill).

Input bar at bottom:
- Ivory background, rounded pill
- Placeholder: "Share with your circle..."
- Paperclip icon (left), mic icon
- Send button: Dusty Rose circle with white arrow

No generic emoji anywhere. Warm, sisterly, calm.
```

---

## PROMPT 3 — Post Composer

```
Design a mobile post composer sheet (modal, slides up from bottom) for a faith-centered app for Muslim women.

Background: #F7F2EB. Accent: #D6AAA3. Secondary: #8E9878. Gold: #D7BA82. Font: Canela / Inter.

Sheet handle at top (gray pill).

Header row:
- "X" close button (left)
- "New Post" in Canela medium (center)
- "Share" button — Dusty Rose pill (right), disabled until text entered

User avatar (40px, round) + name row beneath header.

Main text area:
- Large multiline input, placeholder: "Share a reflection, reminder, or thought with your sisters..."
- Inter regular, charcoal

Below text area:
- Media row: image thumbnail placeholder (dotted outline, soft olive camera icon) + "Add photo or video" label
- Tag row: "+Add a tag" chip (Soft Olive outline)
- Circle selector: "Sharing to:" label + multi-select circle chips (e.g. circle names as pills — Dusty Rose outline when selected)

Bottom toolbar row:
- Image icon · Video icon · Tag icon (all charcoal/40 opacity)
- Character count (right, muted)

Keyboard shown (system). Warm, uncluttered, faith-first.
```

---

## PROMPT 4 — DM Inbox

```
Design a mobile DM (direct messages) inbox screen for a faith-centered app for Muslim women.

Background: #F7F2EB. Accent: #D6AAA3. Font: Canela heading, Inter body.

Header:
- "Messages" in Canela display
- Compose/pencil icon (top right)

Search bar below header: ivory background, rounded, "Search conversations..."

Conversation list (vertical scroll):
- 4 conversation rows, each with:
  - Left: round avatar (48px, warm photo or soft gradient)
  - Name in Inter semibold
  - Last message preview in Inter regular, muted (truncated to 1 line)
  - Timestamp top-right (e.g. "just now", "3 min ago")
  - Unread badge (Dusty Rose circle with white count) on 2 rows

- Row separator: very subtle (charcoal/5 opacity)

Empty state (show below fold): soft illustration or moon icon, "No messages yet. Reach out to a sister." — muted text.

Bottom navigation bar: 5 icons — Home / Circle / Chat (active, Dusty Rose) / Reflections / Profile.
Calm, clean, warm.
```

---

## PROMPT 5 — DM Thread

```
Design a mobile 1:1 DM thread screen for a faith-centered app for Muslim women.

Background: #F7F2EB. Accent: #D6AAA3. Font: Canela / Inter.

Header:
- Back arrow
- Round avatar (36px) + name in Canela medium
- "Active now" status in muted Inter 11px
- Video call icon + info icon (right)

Message thread (vertical scroll):
- 6 messages alternating user and recipient
- Recipient messages: left-aligned, ivory bubble, charcoal text, recipient avatar (24px, left)
- User messages: right-aligned, Dusty Rose bubble, white text
- Each message has timestamp below (muted, 10px)
- 2 messages have faith reaction pills below: ameen · subhanallah · alhamdulillah · mashallah · heart

Date separator between messages: "Today" in muted centered Inter 11px

Input bar at bottom:
- Ivory background, rounded pill, 2px border charcoal/10
- Placeholder: "Message..."
- Attachment icon (left)
- Send button: Dusty Rose circle, white up-arrow icon

Warm, private, calm. No generic emoji.
```

---

## PROMPT 6 — User Profile (Circle context)

```
Design a user profile screen for a faith-centered app for Muslim women, shown in the context of The Circle feature.

Background: #F7F2EB. Accent: #D6AAA3. Olive: #8E9878. Gold: #D7BA82. Font: Canela / Inter.

Header:
- Back arrow (left)
- "Profile" in Canela medium (center)
- Three-dot menu (right)

Profile section:
- Large round avatar (80px), centered, with a subtle Dusty Rose ring
- Display name in Canela 22px
- Short bio in Inter regular 14px, muted, centered (e.g. "Alhamdulillah for everything 🌙")
- Location tag: "London, UK" in Soft Olive 12px
- Row of stats: Circles (number) · Posts (number) · Sisters (number) — separated by soft dividers

Action buttons row:
- "Send DM" — Dusty Rose filled pill
- "Follow" — Soft Olive outline pill

Section: "Circles" — horizontal scroll of 3 circle cards (avatar + name, compact)

Section: "Recent Posts" — 2 post preview cards (text snippet + faith reactions count)

All names and data are placeholder/dynamic. Warm, sisterly, faith-first.
```

---
*DESIGN output — Day 3 | ROBBY*
