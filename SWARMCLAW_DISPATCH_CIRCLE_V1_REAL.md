# SWARMCLAW DISPATCH — THE CIRCLE V1 REAL
Issued: 2026-06-24
Conductor: ROBBY (lifecycle, receipts, phase gates)
Source of truth: AMINA_CIRCLE_SCOPE_LOCK_V2.md (LOCKED). If anything here conflicts with the scope lock, the scope lock wins.
Supersedes for scope: SWARMCLAW_DISPATCH_CIRCLE_SOCIAL_V3.md
No hyphens in any output. Truth labels mandatory: VERIFIED, PARTIAL, MISSING, PLANNED.

---

## CTP PROMPT CONTRACT

GOAL: ship The Circle V1 Real, a calm sacred sisterhood feed whose only job is to power the retention loop: post → faith reaction or du'a → gentle notification → return → reciprocate. Build exactly the locked scope. Nothing more.

CONSTRAINTS:
- Build ONLY section 2 of the scope lock. Anything not listed is OUT. No silent additions.
- Design system LOCKED. Read tailwind.config.ts. Do not invent colors. font-display italic for headings, body font for body.
- No business logic in frontend. API routes own mutations. RLS at DB plus auth in routes as defense in depth.
- Schema is MOSTLY there. Extend, do not recreate. Read existing migrations first.
- AI is NOT in this build. No soften, no turn into du'a. If you reach for AI, stop.
- Trust and safety gates launch. A report button with no queue, no action, no receipt is a FAILURE, not a feature.
- Anonymous to peers, attributable to system. user_id always stored.

FORMAT: phased builds, exact file paths, acceptance criteria, merge gate per phase.

FAILURE (any of these = build rejected):
- Posts with no post_type, or "use my name" still showing Sister (the handle bug).
- A like count or per person leaderboard anywhere.
- Report or block with no review queue and no receipt.
- Crisis content with no 988 resource surface and no review gate.
- An empty feed on a new user's first open.
- Any AI generated content in V1.

---

## BRANCH AND FLOW
- Branch: feature/circle-v1-real off the current v0 branch (origin/v0/rsemeah-e1b773cc).
- Per phase: build → run acceptance criteria → REVIEW diff → QA against live test account (amina@yopmail.com) → merge gate → next phase.
- Final: open PR into the v0 branch so v0 syncs. Do not merge to main without REVIEW + TRUTH sign off.

---

## READ BEFORE BUILDING
1. AMINA_CIRCLE_SCOPE_LOCK_V2.md (full).
2. Existing circle migrations under supabase/migrations (circle_groups, members, reactions, comments, moderation_queue, invites_notifications).
3. Existing routes under app/api/circles and pages under app/(app)/circle.
4. AGENT_THOUGHT_PROCESS_v2.0.md and AMINA_NORTH_STAR_v1.0.md (decision tiers).

---

## PHASE PLAN

### PHASE 0 — DATA FOUNDATION (DATA + ARCHITECT)
Owner: DATA. Review: ARCHITECT, SECURITY.
Build the schema changes in section 4 of the scope lock:
- circle_posts: add post_type, replies_enabled, also_on_dua_wall, status. Fix display_handle logic.
- circle_reactions: expand reaction enum to ameen, making_dua, with_you, allah_sees_you.
- circle_post_comments: add status.
- NEW tables: circle_reports, circle_blocks, circle_crisis_flags.
- notifications: support reaction_received, reply_received, dua_answered.
- reflection_room: flag a circle_groups row is_reflection_room true.
- RLS for every new table. Blocked and removed content hidden via RLS.
MERGE GATE: migrations apply clean on the Amina Supabase project (endovljmaudnxdzdapmf), RLS verified, no orphan columns. TRUTH confirms tables real.

### PHASE 1 — POST ENGINE (BACKEND + FRONTEND)
Stories S2. 
- Typed composer (Reflection, Du'a Request), anonymous or handle, handle bug fixed, optional also post to Du'a Wall.
- API: posts route honors post_type, display_handle, also_on_dua_wall.
MERGE GATE: AC S2 pass on live account. Non anonymous post shows real handle. VERIFIED by QA.

### PHASE 2 — FEED (BACKEND + FRONTEND)
Story S1.
- Aggregated Today's Circle home across the user's circles plus the Reflection Room. Reverse chronological. Du'a requests with few responses float up.
- Never empty: Reflection Room and Amina seed posts always populate.
MERGE GATE: a brand new account with zero personal circles still sees a warm non empty feed. AC S1 pass.

### PHASE 3 — FAITH REACTIONS + REPLIES (FRONTEND + BACKEND)
Stories S3, S4.
- Four reactions, soft aggregate, no counts, no leaderboard. Toggle idempotent.
- Sister Replies with replies_enabled honored in UI and API (reactions only mode).
- Each reaction and reply fires the matching notification row.
MERGE GATE: AC S3 and S4 pass. No like count visible anywhere. Reactions only post rejects replies at API.

### PHASE 4 — REFLECTION ROOM + NOTIFICATIONS (BACKEND + CONTENT)
Stories S5, S6.
- One always on room, daily Amina seed prompt via is_amina_post, all users read and post.
- Notifications wired for reaction_received, reply_received, dua_answered. CONTENT writes gentle copy. No streak or nag types may exist.
MERGE GATE: AC S5 and S6 pass. CONTENT confirms no guilt copy. Seed job produces a daily prompt.

### PHASE 5 — TRUST AND SAFETY (SECURITY + BACKEND + COMPLIANCE)
Story S7. THIS GATES LAUNCH.
- Report in two taps writes circle_reports open. Block bidirectional hide writes circle_blocks.
- Moderator queue view over circle_reports plus moderation_queue. SLA in scope lock section 7.
- Crisis classifier (rule plus light model) on every post and reply. Crisis severity surfaces the existing Amina chat 988 resource and raises a review gate. Reuse the chat crisis protocol, do not reinvent.
- Receipts on every moderation action, block, crisis flag.
- COMPLIANCE: confirm the privacy policy covers Circle social content and sensitive categories; if not, flag to Ro. Confirm anonymous is described honestly.
MERGE GATE: SECURITY sign off. AC S7 pass. Receipts verified. No action path without a receipt.

### PHASE 6 — INSTRUMENTATION + VERIFY (ANALYTICS + TRUTH + QA)
- ANALYTICS: instrument the success metrics in scope lock section 11. North star = support received per du'a request within 24 hours. Do NOT instrument time in app as a success metric.
- TRUTH: full audit, claims vs reality, every story classified VERIFIED or held.
- QA: full loop test on live account. Post, receive reaction, get notification, return, reciprocate.
MERGE GATE: TRUTH audit clean. Loop verified end to end.

---

## DECISION AUTHORITY
- Tier 1 (agent decides): implementation detail, file structure, query shape, component layout.
- Tier 2 (one line recommendation to Ro): any deviation from the locked scope, any new dependency, any copy that touches faith content tone.
- Tier 3 (escalate to Ro): scope change, anything that weakens a safety gate, anything that adds AI to V1, anything that exposes a count or leaderboard.

## REPORTING CADENCE
- ROBBY posts a phase gate receipt after each phase: what shipped, AC result, blockers, next phase.
- OBSERVE owns the 24 hour watch after the PR lands in v0.
- Stakeholder update to Ro: what shipped, what is blocked, what is next. No play by play.

## BLOCKERS TO RAISE IMMEDIATELY
- Groq AI key is dead. Not needed for V1, but confirm no Circle path silently calls AI.
- Duplicate circle route trees exist (/circle, /circles, app/circles). Collapse to /circle as part of Phase 2. Flag if any internal link breaks.
- Auth flow fix (FIX_AMINA_AUTH.sh) must land first, or QA cannot hold a session to test the loop.

BEGIN AT PHASE 0. Build to the scope lock. Drift requires Ro's approval.
