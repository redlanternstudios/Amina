# AMINA SCOPE LOCK V2

**Date:** 2026-06-16
**Status:** LOCKED — 8 items
**CRITICAL BLOCKER:** Groq free tier exhausted (497k/500k TPD). Upgrade at console.groq.com/settings/billing before any task execution.

---

## Locked Items

### NAV-001 — Navigation Cleanup
**Depends on:** None
**AC:** Remove Muslim Texas nav item, Drops nav item, all theblondemuslim.com references from marketing layout and route files
**Status:** READY (blocked on Groq billing)

### SAFETY-001 — Islamic Safety Layer Fix
**Depends on:** None
**AC:** (1) Remove emoji from CRISIS_RESPONSE, (2) Add IPV_KEYWORDS array + IPV_RESPONSE constant + detectIPV function, (3) Move applySafetyLayer call server-side into chat/route.ts before Groq call
**Status:** READY (blocked on Groq billing)

### ONBOARD-001 — Onboarding Flow
**Depends on:** amina_profiles schema confirmed
**Status:** QUEUED

### STREAM-001 — Streaming Chat
**Depends on:** ONBOARD-001, ai SDK v4 upgrade
**Status:** QUEUED

### REFLECT-001 — Reflection Prompts
**Depends on:** Stable chat route + amina_reflections schema
**Status:** QUEUED

### PAY-001 — Payment Flow
**Depends on:** Auth flow stable + middleware created
**Status:** QUEUED

### CIRCLE-001 — Circles Content Track
**Depends on:** None (content track, parallel, no engineering deps)
**Status:** QUEUED

---

## Build Order

1. NAV-001 + SAFETY-001 (parallel, no deps)
2. ONBOARD-001 (after amina_profiles schema)
3. STREAM-001 (after ONBOARD + ai SDK v4)
4. REFLECT-001 (after stable chat route + reflections schema)
5. PAY-001 (after stable auth + middleware)
6. CIRCLE-001 (parallel, content only)

## Blocker

**Groq billing:** Free tier exhausted at 497k/500k TPD. All agents failing. Ro must upgrade at console.groq.com/settings/billing before any task execution.
