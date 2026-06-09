# AMINA PM DECISION 001 — DB ARCHITECTURE FOR THE CIRCLE
**Status:** RESOLVED
**Date:** 2026-06-08
**Decision owner:** PM
**Gate:** Circle build stories are BLOCKED until this file exists and is resolved.

---

## THE QUESTION

Should The Circle (community feature) use the **shared RedLantern Supabase DB** (`endovljmaudnxdzdapmf`) or a **separate dedicated Amina DB**?

---

## OPTIONS EVALUATED

### Option A — Shared DB (single project, prefixed tables)
- All Amina tables use `amina_*` prefix in the existing shared DB
- RLS audit required as part of every story's Definition of Done
- Split to dedicated DB only when: (1) Amina has real users, or (2) a security requirement forces it
- **Pros:** Faster to ship, no cross-DB query complexity, proven pattern for dogfood phase
- **Cons:** Shared infra risk, requires strict RLS discipline

### Option B — Separate dedicated Amina DB
- New Supabase project created exclusively for Amina
- Clean isolation from HireWire/ByRed data
- **Pros:** Clean isolation, no RLS cross-contamination risk
- **Cons:** Slower to stand up, no users to justify it yet, over-engineered for dogfood phase

---

## DECISION

**OPTION A — Shared DB during dogfood phase.**

**Rationale:**
- Amina has 0 real users. Isolation complexity is premature.
- RLS enforced per-table as merge gate (not honor system).
- Split is a future Tier 2 decision triggered by real users or security incident — not now.
- Consistent with Tier 1 agent authority in `AMINA_NORTH_STAR_v1.0.md`.

---

## CONSTRAINTS THIS DECISION IMPOSES

1. Every Circle table MUST be prefixed `amina_*`
2. Every new table MUST have RLS enabled before it merges — this is a hard merge gate
3. No HireWire table may be modified by any Amina story without Tier 2 approval
4. RLS scaffold must be built and confirmed present before the first Circle data story is allowed to merge

---

## WHAT UNLOCKS

- Track A: The Circle build stories
- `amina_circle_groups`, `amina_circle_memberships`, `amina_circle_posts`, `amina_circle_reactions` table specs
- BACKEND can begin RLS scaffold immediately

---

*Written by: PM | Enforced by: ROBBY | Referenced by: AMINA_NORTH_STAR_v1.0.md*
