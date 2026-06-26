# SWARMCLAW DISPATCH — AMINA: GEOLOCATION FIX + CITY/STATE ONBOARDING
Issued: 2026-06-25
Conductor: ROBBY (lifecycle, receipts, phase gates)
Branch: v0/redlanternstudios-5e038e20 (current working branch — same branch as Circle V1 Real)
Priority: HIGH — mosque-finder feature on branch is broken without this. Location trust breach confirmed in live session (NYC mosques returned for non-NYC user).
No hyphens in any output. Truth labels mandatory: VERIFIED, PARTIAL, MISSING, PLANNED.

---

## BUG CONFIRMED

**Observed (2026-06-25 live session):**
User said "I need some local mosque to visit." Amina responded with location confidence. Returned Islamic Center at NYU (New York) + Mosque Foundation (Bridgeview, IL). User was not in New York or Illinois.

**Root cause:** Amina's mosque query relies entirely on runtime browser geolocation. No fallback. No stored user location. When geolocation is wrong (VPN, denied permission, inaccurate signal), Amina returns wrong results while communicating false confidence.

**Trust impact:** This is not a UX bug. It is a trust breach. Amina said "I got your location" and was wrong. That breaks the companion relationship. In the Muslim women's community, a tool that confidently gives wrong local mosque info will be called out immediately.

---

## CTP PROMPT CONTRACT

GOAL: Fix the full location trust chain — store city/state in onboarding, use it as the primary source for mosque queries, never assert location confidence without a verified source, instrument the location source for product intelligence.

CONSTRAINTS:
- One new onboarding field only (city + state). No new UI components.
- Mosque query logic updated to check user_profiles first, not last.
- Amina's response copy must reflect uncertainty when source is unverified.
- Must not break existing mosque-finder card that is already on the branch.
- No AI features. No n8n flows needed — this is data + query logic only.

FAILURE (build rejected if any):
- Mosque query still defaults to runtime geolocation without checking stored profile first.
- city/state field exists but is never written to user_profiles on submit.
- Amina can still say "here are mosques near you" when source is geolocation (unverified).
- No PostHog event distinguishing location source.
- Onboarding field blocks progression (must be optional but prompted).

---

## DATA MODEL

### Migration: `20260625_geolocation_user_location.sql`

```sql
-- Add city and state to user_profiles
-- user_profiles table already exists (Amina V1 schema)

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS location_source TEXT
    CHECK (location_source IN ('onboarding', 'conversation', 'geolocation', 'unknown'))
    DEFAULT 'unknown';

-- Index for future regional feature queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);
```

**RLS:** city/state are owned by the user. Users can read and update their own row only. No cross-user location exposure.

---

## PHASE 0 — MIGRATION (DATA + ARCHITECT)

**Agent: DATA. Review: ARCHITECT, SECURITY.**

Apply `20260625_geolocation_user_location.sql` to Amina Supabase project.

Read existing `user_profiles` table structure first:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

Confirm: city, state, location_source columns exist and are nullable (field is optional). Confirm RLS policy allows user to write their own row.

MERGE GATE: Migration applies clean. Column exists. RLS verified. TRUTH labels as VERIFIED before Phase 1.

---

## PHASE 1 — ONBOARDING FIELD (FRONTEND + BACKEND)

**Agent: FRONTEND + BACKEND.**

### What to build:

Add a single onboarding step (or append to existing onboarding) that asks for city and state.

**Copy (exact — CONTENT must not alter faith tone):**
> "Where are you based, sister? This helps Amina find your local masjid and community resources."

**UI:**
- Two fields: City (text input) + State (text input or dropdown — US states + "Outside US" option)
- "Skip for now" link below — this field is OPTIONAL
- Submit writes to `user_profiles` via existing profile update route

**API route:** `PATCH /api/profile` (or equivalent existing route)
- Body: `{ city: string | null, state: string | null, location_source: 'onboarding' }`
- On skip: writes nothing (location_source stays 'unknown')
- Validates: city max 100 chars, state max 100 chars, no script injection

**Do NOT block onboarding completion if skipped.** Skipping is valid. The mosque-finder will handle the fallback gracefully (see Phase 2).

PostHog events to fire:
- `onboarding_location_prompted` — fires when the step is shown
- `onboarding_location_provided` — fires on submit with `{ has_city: true, has_state: true }`
- `onboarding_location_skipped` — fires on skip

MERGE GATE: AC on live test account (amina@yopmail.com):
- [ ] Onboarding step appears
- [ ] Submit writes city + state to user_profiles (verify via Supabase table editor)
- [ ] Skip leaves city/state null, does not block next step
- [ ] location_source = 'onboarding' on submit, stays 'unknown' on skip
- [ ] PostHog events fire (check PostHog live events)

---

## PHASE 2 — MOSQUE QUERY LOGIC (BACKEND)

**Agent: BACKEND.**

Update the mosque query logic (wherever it currently lives — find it first, do not assume path).

```bash
# Find the mosque query
grep -r "mosque\|masjid" app/api --include="*.ts" -l
grep -r "mosque\|masjid" lib --include="*.ts" -l
```

### Location resolution order (MANDATORY — do not invert):

```typescript
// Location resolution hierarchy
async function resolveUserLocation(userId: string, browserCoords?: { lat: number, lng: number }) {
  // 1. Check stored profile first
  const profile = await supabase
    .from('user_profiles')
    .select('city, state, location_source')
    .eq('user_id', userId)
    .single()

  if (profile.data?.city) {
    return {
      source: 'profile',
      query: `${profile.data.city}, ${profile.data.state ?? ''}`.trim(),
      confident: true
    }
  }

  // 2. Fall back to browser geolocation if provided
  if (browserCoords) {
    return {
      source: 'geolocation',
      coords: browserCoords,
      confident: false  // geolocation = not fully trusted
    }
  }

  // 3. No location — Amina must ask
  return {
    source: 'unknown',
    query: null,
    confident: false
  }
}
```

### Amina response copy — MUST vary by source:

| Source | Amina says |
|---|---|
| `profile` (city stored) | "Here are some masajid near you in [city], inshallah." |
| `geolocation` (coords only) | "I found some masajid that may be near you — you may want to confirm these are in your area." |
| `unknown` (no location) | "I don't have your location, sister — can you tell me your city and I'll find something close to you?" |

**CONTENT agent must review and approve all three copy variants before merge.** No hallucinated intimacy when location is uncertain.

PostHog event to fire on every mosque query:
- `mosque_query_executed` with property `location_source: 'profile' | 'geolocation' | 'unknown' | 'conversation'`

MERGE GATE:
- [ ] Test: user with city='San Diego', state='CA' in profile → mosque query returns San Diego masajid (no geolocation permission needed)
- [ ] Test: user with no city → mosque query returns "can you tell me your city" response
- [ ] Test: user with no city but grants geolocation → mosque query returns approximate results with hedged copy
- [ ] No Amina message says "here are mosques near you" when source is 'unknown' or 'geolocation'
- [ ] PostHog `mosque_query_executed` fires with correct location_source property

---

## PHASE 3 — IN-CONVERSATION CITY CAPTURE (BACKEND + FRONTEND)

**Agent: BACKEND.**

When Amina asks "can you tell me your city?" in conversation and the user responds — write it to the profile.

This is the conversation fallback path. It closes the loop for users who skipped onboarding.

**Trigger condition:** Mosque query fires with source = 'unknown'. Amina asks for city. User provides it.

**Write path:**
- Detect city/state in user's next message (lightweight intent detection — not full NLP, just "San Diego, CA" or "I'm in Atlanta" patterns)
- `PATCH /api/profile` with `{ city, state, location_source: 'conversation' }`
- Proceed with mosque query using the newly stored value
- Amina confirms: "Got it, sister — finding masajid near you in [city]."

PostHog event: `onboarding_location_provided` with `{ source: 'conversation' }`

MERGE GATE:
- [ ] User skips onboarding location, later says "I'm in Houston" in mosque conversation
- [ ] Profile updates: city='Houston', location_source='conversation'
- [ ] Next mosque query uses stored city, not geolocation

---

## PHASE 4 — PROFILE EDIT + INSTRUMENTATION (FRONTEND + ANALYTICS)

**Agent: FRONTEND + ANALYTICS.**

### Profile edit:
Add city/state to the existing profile edit screen so users can update their location after onboarding.
- Two fields: same as onboarding
- Submit: same PATCH route
- "Clear location" option: sets city/state to null

### Instrumentation check (ANALYTICS):
Confirm all PostHog events from Phases 1-3 are firing correctly:
- `onboarding_location_prompted`
- `onboarding_location_provided` (with source property)
- `onboarding_location_skipped`
- `mosque_query_executed` (with location_source property)

Build a PostHog funnel: prompted → provided → mosque_query_executed(source=profile). This is the location trust funnel. Target: >60% of prompted users provide location within first 7 days.

MERGE GATE:
- [ ] City/state visible and editable on profile screen
- [ ] Clear location sets both fields to null
- [ ] All 4 PostHog events confirmed firing in live events dashboard

---

## PHASE 5 — CONTENT REVIEW + TRUTH AUDIT (CONTENT + TRUTH)

**Agent: CONTENT. Review: TRUTH.**

CONTENT reviews all three Amina response copy variants (profile, geolocation, unknown) from Phase 2. Confirms:
- No false intimacy when location is unverified
- Copy is warm without being overconfident
- "Sister" address is consistent with Amina's voice

TRUTH runs full audit:
- [ ] city/state persists to user_profiles: VERIFIED or MISSING
- [ ] Mosque query prefers profile over geolocation: VERIFIED or MISSING
- [ ] Amina never asserts confident location when source is geolocation or unknown: VERIFIED or MISSING
- [ ] All PostHog events firing: VERIFIED or MISSING
- [ ] No path where Amina can still return wrong-city results with confident copy: VERIFIED or MISSING

MERGE GATE: TRUTH audit clean. All items VERIFIED. No MISSING entries.

---

## DECISION AUTHORITY

- Tier 1 (agent decides): exact field positions in onboarding, query implementation details, PostHog event property names
- Tier 2 (one line to Ro): if city/state onboarding requires redesigning the existing onboarding flow significantly (flag before touching)
- Tier 3 (escalate to Ro): any change that makes the location field required (it must stay optional), any copy that differs meaningfully from the three approved variants above

---

## DEPENDENCY ON EXISTING WORK

The mosque-finder card is already on `v0/redlanternstudios-5e038e20`. This dispatch extends it — do not rebuild it. Read the existing mosque-finder implementation before touching the query logic in Phase 2.

This dispatch runs IN PARALLEL with the Circle V1 Real retroactive review (task-008, 009, 010) — no blocking dependency between them. Both land in the same branch, same PR.

---

## BLOCKERS TO RAISE IMMEDIATELY

- If `user_profiles` table does not exist or has a different schema than expected → flag to ROBBY before migration
- If the mosque-finder query is in n8n (not in the codebase) → flag to Ro — logic ownership changes
- If the existing onboarding flow has no step structure (no way to add a step) → flag to Ro before touching UI

---

BEGIN AT PHASE 0. Do not touch mosque query logic until migration is confirmed. Do not merge until TRUTH audit clears Phase 5. Drift requires Ro's approval. Bismillah.
