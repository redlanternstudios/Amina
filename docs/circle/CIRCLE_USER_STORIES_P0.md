# The Circle — P0 User Stories
**Produced by:** PM → ROBBY
**Date:** 2026-06-09
**Sprint:** Day 3
**Status:** READY FOR BUILD

---

## DB Decision
**RESOLVED — shared DB (no separate Circle DB)**
Source: AMINA_NORTH_STAR.md Tier 1. RLS audit is part of DoD on every story.

---

## STORY-001 — Circle Home (4-tab shell)

**As a** user,
**I want** to see my circles, discover new ones, view join requests, and track activity in one tabbed home screen,
**so that** I can navigate all Circle features from a single entry point.

### Acceptance Criteria
- [ ] Four tabs render: My Circles / Discover / Requests / Activity
- [ ] My Circles tab queries `circles` joined with `circle_memberships` for the current user
- [ ] Each circle card shows: circle avatar, name, member count, last activity timestamp
- [ ] Unread badge appears on circle card when there are unread `circle_messages`
- [ ] Discover tab shows public circles the user has not joined
- [ ] Requests tab shows pending `circle_memberships` where user is creator/admin
- [ ] Activity tab shows recent events (new members, posts, reactions) across user's circles
- [ ] Empty states exist for all four tabs

### Definition of Done
- [ ] RLS active on `circles` and `circle_memberships` — non-members cannot see private circle data
- [ ] No hardcoded names in UI copy
- [ ] Passes REVIEW gate
- [ ] QA: unread badge count accurate; tab switching works without data loss

---

## STORY-002 — Circle Detail: Chat Tab

**As a** circle member,
**I want** to send and receive messages in a group chat thread within my circle,
**so that** I can communicate with sisters in a shared, faith-centered space.

### Acceptance Criteria
- [ ] Chat thread queries `circle_messages` for the current circle, ordered ascending by `created_at`
- [ ] Realtime subscription on `circle_messages` — new messages appear without refresh
- [ ] User can send a message; inserts into `circle_messages`
- [ ] Messages show sender avatar, display name, content, and timestamp
- [ ] Faith reactions available on each message: ameen / subhanallah / alhamdulillah / mashallah / heart
- [ ] Media attachments: images and videos from `circle-media` storage bucket
- [ ] Non-members cannot view or post (RLS enforced at query layer)
- [ ] Scroll-to-bottom on new message

### Definition of Done
- [ ] RLS: `circle_messages` SELECT/INSERT limited to active `circle_memberships`
- [ ] No generic emoji reactions — faith reactions only
- [ ] Media upload respects: jpg/png/webp/heic ≤10MB; mp4/mov ≤50MB/60s
- [ ] Messages persist across page reload
- [ ] Passes REVIEW gate + QA

---

## STORY-003 — Circle Detail: Posts Tab

**As a** circle member,
**I want** to see a feed of posts shared by sisters in my circle,
**so that** I can engage with reflections, reminders, and shared content.

### Acceptance Criteria
- [ ] Posts feed queries a `circle_posts` table (see BACKEND task for schema) for the current circle
- [ ] Each post card shows: author avatar, author name, post text, optional image/video, faith reactions, comment count, timestamp
- [ ] Faith reactions: ameen / subhanallah / alhamdulillah / mashallah / heart
- [ ] Tapping a reaction inserts into `circle_reactions`; toggling removes it
- [ ] Non-members cannot view posts (RLS)
- [ ] Infinite scroll or paginated load (20 posts per page)

### Definition of Done
- [ ] RLS on `circle_posts` and `circle_reactions` — members only
- [ ] No generic emoji
- [ ] Passes REVIEW + QA

---

## STORY-004 — Post Composer

**As a** circle member,
**I want** to compose a post with text, optional media, tags, and a circle selector,
**so that** I can share with one or more of my circles.

### Acceptance Criteria
- [ ] Text input (multiline, no character limit displayed)
- [ ] Media picker: image (jpg/png/webp/heic ≤10MB) or video (mp4/mov ≤50MB/60s)
- [ ] Circle selector: multi-select from user's circles (from `circle_memberships`)
- [ ] Tag input (freeform, optional)
- [ ] Submit inserts into `circle_posts` for each selected circle
- [ ] Media uploaded to `circles/{circle_id}/messages/{post_id}/{filename}` in `circle-media` bucket
- [ ] Success: dismisses composer, post appears in feed immediately (optimistic update)
- [ ] Error: toast message, draft preserved

### Definition of Done
- [ ] RLS: INSERT on `circle_posts` only for active members of that circle
- [ ] File size/type validation on client before upload
- [ ] No hardcoded names or generic emoji
- [ ] Passes REVIEW + QA

---

## STORY-005 — DM Inbox

**As a** user,
**I want** to see a list of my 1:1 DM conversations,
**so that** I can navigate to any thread quickly.

### Acceptance Criteria
- [ ] Inbox queries `dm_conversations` joined with `dm_participants` for current user
- [ ] Each row shows: other participant's avatar, display name, last message preview, timestamp, unread count
- [ ] Unread count derived from `dm_messages` read state
- [ ] Rows sorted by most recent message
- [ ] Tapping a row navigates to DM Thread screen
- [ ] Empty state when no DMs
- [ ] New DM button initiates a new conversation (creates `dm_conversations` row + `dm_participants` rows)

### Definition of Done
- [ ] RLS: `dm_conversations` SELECT limited to participants only
- [ ] Unread count accurate per QA check
- [ ] Passes REVIEW + QA

---

## STORY-006 — DM Thread

**As a** user,
**I want** to send and receive private messages in a 1:1 DM thread with full media support,
**so that** I can have private conversations with sisters.

### Acceptance Criteria
- [ ] Thread queries `dm_messages` for the current `dm_conversation_id`, ordered ascending
- [ ] Realtime subscription on `dm_messages` — messages appear without refresh
- [ ] User can send text; inserts into `dm_messages`
- [ ] Media attachments: images (≤10MB) and videos (≤50MB/60s)
- [ ] Media uploaded to `dms/{conversation_id}/{message_id}/{filename}` in `circle-media` bucket
- [ ] Messages show sender avatar, content, timestamp
- [ ] Faith reactions on individual messages
- [ ] Non-participants cannot read messages (RLS)

### Definition of Done
- [ ] RLS: `dm_messages` SELECT/INSERT limited to `dm_participants` of that conversation
- [ ] Messages persist across reload
- [ ] No generic emoji reactions
- [ ] Passes REVIEW + QA

---

## P0 Screen Order (build sequence)
1. STORY-001 Circle Home (shell + tab routing)
2. STORY-005 DM Inbox
3. STORY-006 DM Thread
4. STORY-002 Circle Chat
5. STORY-003 Circle Posts
6. STORY-004 Post Composer

---
*PM output — Day 3 | ROBBY*
