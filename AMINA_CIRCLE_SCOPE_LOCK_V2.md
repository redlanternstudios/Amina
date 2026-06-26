# AMINA — THE CIRCLE — SCOPE LOCK V2 (V1 REAL)
Status: LOCKED
Locked: 2026-06-24
Owner: Ro (founder, final authority)
Classification today: PROTOTYPE with strong UI. Target of this scope: PRODUCT READY V1.
Optimization target: retention loop + ROI. Not feature completeness.

No hyphens in any output. Truth labels apply: VERIFIED, PARTIAL, MISSING, PLANNED.

---

## 0. THE RETENTION THESIS (why this scope exists)

The Circle retains through ONE loop:

> A woman posts → sisters respond with du'a or a faith reaction → she receives a gentle, value aligned notification → she returns to reciprocate.

That loop, landing inside the 21 day habit window, is the entire engine. Every item in V1 either feeds that loop or is cut. Free Circle is the growth and habit engine. Premium monetizes depth later.

---

## 1. LOCKED DECISIONS

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | Reaction model | 4 faith reactions: Ameen, Making du'a, With you, Allah sees you. Soft aggregate of support ("7 sisters making du'a"). No like counts. No per person leaderboard. |
| 2 | Feed architecture | Aggregated "Today's Circle" home, reverse chronological, with one humane tweak: du'a requests with few responses float up. Per circle views live beneath the home. |
| 3 | Du'a Wall vs Circle Du'a Request | Keep both, distinct roles. Du'a Wall = broad ummah surface (also cold start filler). Circle Du'a Request = trusted small group. Bridge: a Circle Du'a Request may optionally also post to the Du'a Wall. |
| 4 | Reflection Rooms | Exactly ONE always on curated room in V1, seeded daily with an Amina prompt plus real anonymized community responses. Beats cold start. |
| 5 | AI features (soften, turn into du'a) | DEFERRED to V2. Retention loop does not need AI. Removes dead key risk and theological fabrication risk. |
| 6 | Notifications | IN V1. Reaction and reply notifications are the retention engine. Gentle only. Never guilt or streak. |
| 7 | Trust and safety | IN V1. Gates launch. Report, block, review queue, crisis detection on posts. |
| 8 | Handle bug | Fix `is_anonymous ? 'Sister' : 'Sister'` so "use my name" attaches the real display handle. |

---

## 2. IN SCOPE (V1 REAL) — LOCKED

1. Aggregated Today's Circle home feed
2. Two post types: Reflection, Du'a Request
3. Four faith reactions with soft aggregate
4. Sister Replies with a reactions only toggle (replies off)
5. Anonymous to peers, attributable to system and moderators
6. Gentle notifications: reaction received, reply received, du'a answered
7. One always on Reflection Room (daily seeded)
8. Invite link (already built, keep)
9. Share card (already built, keep)
10. Trust and safety layer: report, block, moderation review queue, crisis detection
11. Handle bug fix

## 3. OUT OF SCOPE — DEFERRED

V2: Soft Moments, Saved Reminders, Private Support Notes (DMs), Mood Check In, all AI softening and Turn into du'a, Prompt Response engine as a typed post, full Reflection Room taxonomy, seasonal and Ramadan circles, member profile sheets, voice reflections, circle activity summaries.

V3: scholar reviewed packs, local masjid circles, paid guided circles, community moderator tooling, premium templates, invite only cohorts. Unchanged from the product doc.

Anything not in section 2 is OUT. No silent additions. Scope changes require a new SCOPE_LOCK version.

---

## 4. ENTITY MODEL (reconciled with built schema)

Existing tables (VERIFIED on v0 branch): `circle_groups`, `circle_group_members`, `circle_posts`, `circle_reactions`, circle post comments (migration 008), `moderation_queue` (migration 004), notifications (partial, migration 005).

Required changes for V1:

### circle_posts
- ADD `post_type` enum: `reflection` | `dua_request`. Default `reflection`. (Currently MISSING.)
- KEEP `content`, `is_anonymous`, `is_amina_post`.
- FIX `display_handle`: store the member display handle when `is_anonymous = false`; store `Sister` when true. Remove the no op ternary.
- ADD `replies_enabled` boolean default true (powers reactions only toggle).
- ADD `also_on_dua_wall` boolean default false (the bridge).
- ADD `status` enum: `posted` | `hidden` | `removed` | `deleted`. Default `posted`.

### circle_reactions
- EXPAND `reaction` enum from `heart` only to: `ameen` | `making_dua` | `with_you` | `allah_sees_you`.
- KEEP `target_type` (post). One reaction per user per post per type. A user may add more than one type.

### circle_post_comments (Sister Replies)
- KEEP. ADD `status` enum: `posted` | `hidden` | `removed`. Honor parent post `replies_enabled`.

### circle_reports (NEW — required)
- `id`, `reporter_user_id`, `target_type` (post | comment | member), `target_id`, `reason` enum (harm_or_safety | harassment | inappropriate | spam | other), `note` text, `status` enum (open | reviewing | actioned | dismissed), `created_at`, `resolved_at`, `resolved_by`, `resolution` text. This is the receipt trail.

### circle_blocks (NEW — required)
- `id`, `blocker_user_id`, `blocked_user_id`, `circle_id` nullable (null = global block), `created_at`. Blocked content is hidden bidirectionally.

### circle_crisis_flags (NEW — required)
- `id`, `post_id` or `comment_id`, `classifier` (rule or model), `severity` enum (watch | elevated | crisis), `created_at`, `actioned` boolean, `actioned_by`, `action` text. Crisis severity triggers the support resource surface and a review gate.

### notifications
- WIRE for V1 event types: `reaction_received`, `reply_received`, `dua_answered`. Each row: `user_id`, `type`, `actor_label` (Sister or handle), `target_id`, `read` boolean, `created_at`.

### reflection_room (NEW — V1, single room)
- A `circle_groups` row flagged `is_reflection_room = true`, always on, all users auto members for read. Daily Amina seed post via existing `is_amina_post`.

---

## 5. STATE MODELS

### Post lifecycle
draft (client only) → posted → [hidden by reporter flow | removed by moderator | deleted by author] . Crisis flag does not change status; it raises a review gate and surfaces resources. Removed and deleted are terminal. Hidden is reversible by moderator.

### Report lifecycle
open → reviewing → [actioned | dismissed]. Every transition writes a receipt (who, when, why) to `circle_reports`. No report may sit in open with no owner past the review SLA (see section 7).

### Circle membership lifecycle
invited → joined → [left | removed by owner | blocked]. Removed and blocked revoke read and write immediately via RLS.

### Reaction lifecycle
none → added → removed (toggle). Idempotent. No counts exposed beyond soft aggregate.

---

## 6. CONTROL LAYERS (allowed, blocked, review, log)

- ALLOWED without gate: reflection post, du'a request post, faith reaction, reply when `replies_enabled`, save invite, create circle, join by code.
- BLOCKED: posting to a circle the user is not a member of, reacting or replying when blocked, replying when `replies_enabled = false`, joining a full circle, writing to a removed or deleted post.
- REVIEW GATE (human or queue): any post or reply flagged by the crisis classifier at `elevated` or `crisis`, any reported content, any anonymous post that the classifier flags for harassment.
- MUST LOG (receipts): every moderation action, every block, every crisis flag and its action, every removal. Receipt minimum: timestamp, actor, target, action, reason, outcome.

Truth chain: user content is source truth. Moderation and crisis layers are subordinate and never silently rewrite a woman's words. AI is not in V1, so no generated content enters the truth chain.

---

## 7. TRUST AND SAFETY LAYER (gates launch — non negotiable)

1. Report: any post, comment, or member reportable in two taps. Writes `circle_reports` open.
2. Block: a sister can block another (or an anonymous author by post). Bidirectional hide. Writes `circle_blocks`.
3. Review queue: `moderation_queue` plus `circle_reports` surfaced to a moderator view. SLA: crisis severity reviewed within 1 hour, all other reports within 24 hours. No silent backlog.
4. Crisis detection: rule plus light model classifier on every post and reply for self harm, abuse, and suicidal content. On `crisis`, surface the same gentle 988 and trusted person resource Amina chat already uses, and raise a review gate. Reuse the existing chat crisis protocol, do not reinvent it.
5. Honest safety promise: copy says "a private, invite based space designed for Muslim women," not an absolute guarantee we cannot technically keep.
6. Anonymity rule: anonymous to peers, fully attributable to system and moderators. `user_id` always stored.

A report button with no queue, no action, and no receipt is theater and fails this scope.

---

## 8. RETENTION LOOP SPEC (must work as one system)

Trigger events that create a notification:
- A sister reacts to your post → `reaction_received` ("A sister is making du'a for you").
- A sister replies → `reply_received` ("A sister responded gently to your reflection").
- Your du'a request crosses a soft threshold of Ameens → `dua_answered` ("Your du'a request received Ameens").

Rules:
- Gentle only. Never "you have not posted," never streak, never "invite more."
- Invite prompts fire only on calm or positive moments (after creating a circle, after a gratitude note, after saving an invite), never on a distress or du'a request post.
- The home feed must never be empty for a new user: the always on Reflection Room and Amina seed posts guarantee warmth on first open.

---

## 9. USER STORIES + ACCEPTANCE CRITERIA + DoD

Each story DoD: UI built, data model real, logic in API route, error and empty states handled, RLS enforced, receipt where stateful, verified against a live test account.

### S1 — Aggregated home feed
As a sister, I open The Circle and see a warm, never empty feed across my circles plus the Reflection Room.
AC: Given I am a member of zero or more circles, When I open `/circle`, Then I see reverse chronological posts from all my circles plus the Reflection Room, with du'a requests that have few responses floated up. Empty personal circles never produce an empty screen because the Reflection Room and Amina seed posts always populate.
DoD: aggregation query, gentle ranking, skeleton and empty safe states, RLS scoped to membership.

### S2 — Typed post composer (Reflection, Du'a Request)
As a sister, I choose what my heart is carrying and post a Reflection or a Du'a Request, anonymously or with my handle.
AC: post_type persisted; anonymous stores handle Sister; non anonymous stores my real display handle (bug fixed); Du'a Request offers an optional also post to Du'a Wall.
DoD: composer UI, post_type column, handle fix verified, bridge flag wired.

### S3 — Four faith reactions
As a sister, I respond to a post with Ameen, Making du'a, With you, or Allah sees you.
AC: toggle per type; soft aggregate shown ("7 sisters making du'a"); no like count; no leaderboard; reaction writes notification to author.
DoD: enum expanded, UI, idempotent toggle, notification fired.

### S4 — Sister Replies with reactions only toggle
As an author, I can allow replies or set my post to reactions only.
AC: when replies_enabled false, reply UI hidden and API rejects replies; when true, sisters may reply; reply writes a gentle notification.
DoD: replies_enabled column honored in UI and API, reply notification fired.

### S5 — Reflection Room (always on)
As a new sister with no circles, I still find a living room on day one.
AC: one always on room, daily Amina seed prompt, real anonymized responses visible, all users can read and post.
DoD: room flag, daily seed via is_amina_post, auto read membership.

### S6 — Gentle notifications
As a sister, I am drawn back by support, never by guilt.
AC: reaction_received, reply_received, dua_answered delivered; copy is gentle; no streak or nag types exist in the system.
DoD: notifications wired for the three types, read state, gentle copy locked.

### S7 — Report, block, review queue, crisis detection
As a sister, I can report or block, and harmful content is caught.
AC: report in two taps writes circle_reports open; block hides bidirectionally; moderator view lists open reports and queue; crisis classifier runs on every post and reply; crisis severity surfaces 988 resource and raises a review gate; every action writes a receipt.
DoD: circle_reports, circle_blocks, circle_crisis_flags tables; report and block UI; moderator queue view; classifier wired; SLA documented; receipts verified.

---

## 10. RISK CLASSIFICATION

- HIGH risk (review gates, receipts, abort paths required): anonymous posting, du'a requests describing distress, crisis content, reports. 
- MEDIUM: reactions, replies, invite flow.
- LOW: reading the feed, saving an invite, creating a circle.

High risk items may not ship without their control layer in section 6 and 7.

---

## 11. SUCCESS METRICS (value aligned, not attention based)

North star: support received per du'a request (share of du'a requests that get at least one faith reaction or reply within 24 hours).
Supporting: 21 day return rate, save and invite rate on calm moments, share of new users who see a non empty feed on first open (target 100 percent), median time to first reaction received.
Explicitly NOT optimized: time in app, daily session length, raw post volume.

---

## 12. NON GOALS (say it plainly)

Not Instagram. Not a like counter. Not AI generated du'a in V1. Not a public feed. Not a gender verified guarantee. Not engagement maximization. Not streaks or guilt.

---

END OF SCOPE LOCK V2. This document is the single source of truth for The Circle V1. Build to this. Drift requires a new version and Ro's approval.
