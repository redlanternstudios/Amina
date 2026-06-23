# AMINA PM DECISION — 002
**Date:** 2026-06-22 | **Day:** 5 | **Owner:** Ro | **Status:** LOCKED

---

## DECISION: Final Bottom Navigation

**Locked nav structure:**

| Position | Label | Route | Icon |
|----------|-------|--------|------|
| 1 | Home | `/home` | 🏠 |
| 2 | Circle | `/circle` | 🔮 |
| 3 | Reflections | `/reflections` | 🔖 |
| 4 | Du'a Wall | `/dua-wall` | 🤲 |
| 5 | Profile | `/profile` | 👤 |

**What changed:**
- Guidance removed from bottom nav (was position 2 in codebase)
- Circle moved to position 2 (was position 4)
- Du'a Wall added at position 4 (was missing from codebase entirely)
- Reflections icon updated from 📝 to 🔖

**Guidance routing:**
- Still accessible at `/guidance`
- Surfaced via Home quick chips ("Learn 📖" chip routes to `/guidance`)
- Not a tab — this is intentional product decision

**Rationale:**
The nav now maps to the core product soul:
- Home = personal companion (Amina AI)
- Circle = sisterhood (community)
- Reflections = saved growth (journal)
- Du'a Wall = shared prayer (uplift others)
- Profile = identity + settings

**Immediate actions taken (2026-06-22):**
- [x] `BottomNav.tsx` updated to final spec
- [x] `/dua-wall` stub route created (prevents 404)
- [ ] Du'a Wall full build — see AMINA_UI_AUDIT_DAY5.md PROMPT 9 + 10
- [ ] v0 prototype nav updated to match (manual — Ro action)

**Files changed:**
- `amina/components/BottomNav.tsx`
- `amina/app/(app)/dua-wall/page.tsx` (new stub)
