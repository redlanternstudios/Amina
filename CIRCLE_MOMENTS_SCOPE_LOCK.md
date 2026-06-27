# CIRCLE DAILY MOMENTS — SCOPE LOCK
Version: 1.0
Locked: 2026-06-25
Status: LOCKED — no changes without explicit scope amendment from Ro

No hyphens in any output. Truth labels mandatory: VERIFIED/PARTIAL/MISSING/PLANNED.

---

## WHAT THIS IS

Daily Moments is The Circle's retention anchor. It is the 24-hour ephemeral media format that creates a morning ritual for sisters, powers the Day 8-14 retention loop, and defines whether The Circle feels like a private sisterhood or Islamic Instagram.

The mechanic is correct. The design guardrails are the product.

This scope lock defines the five non-negotiable constraints that govern Daily Moments. These are not UX preferences. They are theological and product integrity decisions. Changing any of them requires a written scope amendment with explicit rationale reviewed by Ro.

---

## THE FIVE NON-NEGOTIABLES

### 1. NO VIEW COUNTS. EVER.

No view count is displayed anywhere in the Daily Moments UI.
- Not total views
- Not a named list of who viewed
- Not a "seen by X" indicator
- Not an aggregate number at any zoom level

**Why this is locked:** The moment view counts exist, the behavioral driver shifts from witnessing to performing. The entire theological framing of Daily Moments (sharing FROM abundance, not performing FOR validation) collapses with a single view count. This decision is permanent.

**QA enforcement:** QA agent must explicitly verify no view count appears in any state of the moments UI before any moments-related PR merges.

**What happens when users request view counts:** The response is: "Daily Moments is designed around witnessing, not performance. View counts are not part of the product." No scope amendment will be opened for this.

---

### 2. PRIVATE CIRCLES ONLY. NO EXPLORE.

Moments are scoped exclusively to the sister's private circles.
- No moments appear in an explore tab
- No cross-circle moment visibility
- No public moments
- No "trending moments" or discovery surfaces of any kind

**Why this is locked:** The belonging-not-comparison dynamic only holds inside trusted, intimate circles of 5-20 known sisters. The moment moments escape to explore or public surfaces, the performance and comparison drivers activate. This is not speculation — it is what happened to every Islamic social platform before Amina.

**Future V2 consideration:** If a public or cross-circle surface is ever considered, it requires a separate scope lock, a theological review, and explicit sign-off from Ro. It is not a natural V1.1 feature. It is a structural product direction change.

---

### 3. AMINA SEEDS EVERY CIRCLE EVERY MORNING. NON-NEGOTIABLE.

Amina posts a daily moment to every active circle by 5:30am local time (prayer-time aware).

- If no circle member has posted a moment, Amina's moment is still there
- Amina's moment is always first in the moments row
- Amina's moments are written in Canela voice, rooted in Quran or authentic hadith
- Rotation: 60-day minimum before any moment text repeats
- CONTENT agent owns and reviews all Amina moment content before it enters rotation

**Why this is locked:** Cold start kills the daily habit before it forms. With Amina seeding every circle, the moments row is never empty. Sisters always have something to respond to. The cold start problem is solved by design, not by user volume.

**If Amina seeding fails:** This is a P0 bug. A circle with an empty moments row at 6am is a broken experience. ROBBY alerts Ro. Fix before the session ends.

---

### 4. THEOLOGICAL FRAMING DOCUMENT REQUIRED BEFORE LAUNCH.

Daily Moments does not ship without a theological framing document that is either:
- Published on the Amina website or in the app's About/FAQ section, OR
- Ready to publish immediately if a public critique emerges

This document must:
- Explain the design philosophy (witnessing, not performing; sharing from abundance)
- Reference the Islamic principle of niyyah (intention)
- Explain why Daily Moments is structurally different from Instagram Stories (small trusted circles, no view counts, no public surfaces, Ameen response mechanic)
- Acknowledge the riya concern directly and explain how the design addresses it
- Be reviewable by a credible Islamic voice before publication

**Why this is locked:** The Muslim community moves fast on reputation. One tweet from a known sheikh saying "Amina is causing riya among Muslim women" reaches hundreds of thousands within hours. The response must be pre-authored, not written reactively. A reactive response to a credible Islamic critique is always weaker than a proactive theological framework already visible in the product.

**This is a launch gate.** Daily Moments does not ship to production without this document cleared by Ro.

---

### 5. VOICE NOTE IS A FIRST-CLASS MOMENT FORMAT.

Voice note must be presented as equal to photo in the moment creation screen.
- The creation prompt does not default to camera
- Voice and camera are presented side-by-side or voice is listed first
- A moment that is only a voice note is complete — not a partial post
- The creation prompt says "What did Allah show you today?" (not "Add to your story")

**Why this is locked:** Many Muslim women do not share images of themselves in digital spaces, even private ones, due to modesty or personal choice. A moments mechanic that defaults to camera silently excludes exactly the sisters who most need a private spiritual community. Voice note is often more intimate and more authentic than photos. Designing voice as equal to photo from launch is structurally inclusive.

**UX note for v0:** The moment composer has two equally prominent options: voice note and camera. No hierarchy between them. The prompt text is "What did Allah show you today?" — exact copy, do not alter.

---

## ADDITIONAL DESIGN RULES (SUPPORTING GUARDRAILS)

These are not amendments to the five core guardrails but are required design decisions for Daily Moments:

**Circle header moments row:** The CircleAvatar row at the top of the circle feed shows sisters with active moments. Sisters with no active moment appear without a ring — not highlighted as absent. Amina always appears in the row with a ring.

**Moment creation trigger:** Accessible from the moments row (tap Amina or a sister with a ring + prompt to add yours) and from a dedicated compose button within the circle feed.

**Response mechanic:** After viewing a moment, the sister is prompted to send an Ameen or a du'a response. One tap. This is the reciprocity mechanic — not passive consumption.

**Expiration:** Moments expire at end of day (midnight local time). The sister can save a received moment to her personal Reflections — it stays for her privately, is never re-shared.

**Circle size guidance (not a hard gate):** Moments work best with 3-15 sisters in a circle. Below 3, Amina invites the sister to invite rather than showing an empty moments row.

**Moment creation experience:** No progress bar, no tap-to-advance between sisters at V1 launch. Simple: tap a sister's ring to view her moment full-screen, Ameen response prompt appears at the end. V1.1 adds the polished viewer (progress bars, sequential swipe) once density data confirms the pattern.

---

## SPIRITUAL EXPERIENCE KPI

This is the metric that matters most. Not DAU. Not post rate. Not reaction rate.

**"After seeing your sisters' moments today, how did you feel?"**

At Day 14, every active Circle member who has used Daily Moments gets this single-question prompt. Target: >70% positive.

If this metric is below 60% at Day 30, Daily Moments is failing regardless of engagement volume. TRUTH agent flags this to Ro. A sub-60% result triggers a root cause analysis before any V1.1 moments expansion.

---

## WHAT CAN CHANGE WITHOUT A SCOPE AMENDMENT

- Visual design of the moments row and composer (within Amina brand system)
- Amina moment rotation content (CONTENT agent owns, TRUTH reviews)
- Response copy variants (within approved tone)
- The exact timing of the Amina daily moment (5:30am is a target, not a hard constraint — prayer time awareness is the priority)
- The exact visual treatment of sister rings in the header row

---

## WHAT REQUIRES A WRITTEN SCOPE AMENDMENT

- Any view count, any "seen by" indicator, any viewer list
- Any cross-circle moment visibility
- Any public or explore surface for moments
- Making location optional vs. required in the Amina seeding logic
- Changing the theological framing document from a launch gate to a post-launch item
- Removing voice note as a first-class format
- Changing the response mechanic from active Ameen to passive consumption
- Raising the spiritual experience KPI threshold or removing the measurement entirely

---

## DEPLOYMENT DEPENDENCY

Daily Moments scope depends on:
- VERIFIED: Circle V1 entity model (circle_posts, faith_reactions, circle_members) — must exist first
- PLANNED: `circle_moments` table with `author_id`, `circle_id`, `content_type` (voice/image/text), `content_url`, `expires_at`, `created_at` columns
- PLANNED: AMINA_SYSTEM_USER_ID defined in environment — used as author_id for Amina daily moments
- PLANNED: Scheduled job (n8n or Supabase pg_cron) that seeds Amina moments by 5:30am local per circle
- PLANNED: circle-media bucket in Supabase Storage (already in V1 queue — confirm before moments build starts)

Moments build does NOT start until Circle V1 schema is VERIFIED on branch.

---

## AMENDMENT LOG

All scope changes must be appended here with date, what changed, and Ro's sign-off.

| Date | Change | Reason | Ro Sign-Off |
|---|---|---|---|
| 2026-06-25 | Initial scope lock | 10x CTP confirmed Daily Moments as retention anchor with five critical guardrails | Pending |

---

BEGIN BUILD ONLY AFTER RO SIGNS OFF ON THIS LOCK. SWARMCLAW DISPATCH TO FOLLOW.
