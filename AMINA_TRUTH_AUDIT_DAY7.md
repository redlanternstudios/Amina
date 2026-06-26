# AMINA — TRUTH AUDIT (Day 7)
Date: 2026-06-24 · Scope: built state of `amina/` + live Supabase `endovljmaudnxdzdapmf`
Method: filesystem map, git log, live table/row counts, migration ledger diff, RLS policy check.

---

## 1. OBJECTIVE
Classify what is actually built in Amina right now, separate real from assumed, and list the cleanup that must happen before Circle V1 Real build proceeds.

---

## 2. REALITY CHECK (what is wrong / risky)

### BROKEN — will fail build or runtime
1. **Conflicting dynamic route slugs (HARD BUILD ERROR).** `app/api/circles/[id]/...` and `app/api/circles/[circleId]/posts/[postId]/comments/...` use two different slug names at the same path position. Next.js refuses to build this: *"You cannot use different slug names for the same dynamic path."* **VERIFIED on disk.** This blocks `next build` / Vercel deploy.
2. **`circle_join_requests`: RLS enabled, ZERO policies.** Table is effectively unreadable/unwritable by anon+auth roles. Any join-request flow that touches it silently fails. **VERIFIED via pg_policy.** Launch-gating for a social product.

### DRIFT — truth chain broken
3. **Local migrations do NOT match the live DB ledger.** Disk has a renumbered set (`001_initial` → `008_circle_post_comments` + `CONSOLIDATED_CIRCLE_MIGRATION.sql` + dated dupes). Live `supabase_migrations` has none of those names — it has `circle_schema (20260611)`, `004_moderation_queue`, `circle_groups_and_schema_v1 (20260616)`, `005_dua_wall_schema (20260620)`. The local folder is a fiction relative to production. **VERIFIED.** Running `supabase db push` from this folder is unsafe.
4. **Duplicate migration numbers on disk:** two `004_*`, three `005_*`, two `008_*`, plus `CONSOLIDATED`. No single source of truth for schema.
5. **Two parallel Circle data models live in the same DB.**
   - V1: `circles` (0 rows) + `circle_memberships` (0 rows) → built, never used.
   - V2: `circle_groups` (1 row) + `circle_group_members` (2 rows) → the one actually in use.
   Git log confirms "V2 membership check" patches. V1 is orphaned but still wired in `app/circles/` routes. **VERIFIED.**
6. **Three profile tables, fragmented:** `user_profile` (8, HireWire), `amina_profiles` (11), `circle_profiles` (13). No single identity. A user exists 3 times. **VERIFIED.**

### ORPHANED / DUPLICATE CODE
7. **Two Circle UI trees:** `app/circles/[id]` + `app/circles/create` (old) vs `app/(app)/circle/...` (current). Old tree is dead weight and confuses routing.
8. **Three reaction endpoints:** `/circles/[id]/react`, `/circles/[id]/reactions`, `/reactions`. Mixed auth helpers (`getApiUser` vs `createClient`). Only one should survive.
9. **Two comment endpoints** (the slug-conflict pair, #1) + duplicate join (`/circles/join` and `/circles/[id]/join`) + duplicate du'a-ameen (`[duaId]` and `[id]`).
10. **`route.ts.bak` checked into git** at `app/api/circles/[id]/join/`. Build artifact in source.

### ARCHITECTURE
11. **Shared single Supabase project across 6 products** (Amina, HireWire, By Red OS, Lantern, Deixis, Circle) — ~160 tables in one `public` schema. No tenant isolation. App Store / privacy review will see HireWire + By Red CRM data sitting beside Amina user data. ASSUMPTION on review impact; structure is VERIFIED.

---

## 3. FEATURE CLASSIFICATION (verified by row counts + code)

| Feature | Code | Live data | Class |
|---|---|---|---|
| Amina chat | present | 1 convo / 1 msg | PROTOTYPE (built, near-zero usage) |
| Circle feed (V2) | present | 1 group, 2 members, 3 posts | PROTOTYPE (real wiring, thin data) |
| Faith reactions | present (3 endpoints) | 2 reactions | PROTOTYPE — needs endpoint collapse |
| Comments | present | 0 comments | PROTOTYPE — blocked by slug build error |
| Du'a Wall | present | 0 posts / 0 ameens | CONCEPT-shipped (built, never exercised) |
| Streaks | present | 0 rows | CONCEPT-shipped |
| Reflections | present | 0 rows | CONCEPT-shipped |
| Moderation / Trust & Safety | `moderation_queue` table (0), `circle_reports` table | 0 rows, no proven flow | CONCEPT — this is the launch gate, not yet real |
| Auth flow | fixed in commit #12 (merged) + `FIX_AMINA_AUTH.sh` | n/a | PARTIAL — see #12 conflict below |

**Auth note:** commit `de16dc5 fix(auth): direct sign in entry, add auth guard` is already merged to main, and `middleware.ts` has a correct auth guard. But `FIX_AMINA_AUTH.sh` (root, Jun 25) checks out a *different* v0 branch and re-patches the same files. Running it now risks re-opening a resolved fix or branching off stale code. **Confirm the merged fix is live before running that script — likely redundant now.**

---

## 4. EXECUTION — cleanup order (do before Circle V1 Real Phase 3)

**P0 — unblock build & safety (today)**
1. Resolve slug conflict: pick `[id]` everywhere under `app/api/circles/`. Delete the `[circleId]` comment route, keep the `[id]` version (or merge GET from the circleId one into it). Re-run `next build` to confirm green.
2. Add RLS policies to `circle_join_requests` (or drop the table if V2 join doesn't use it — confirm which against the join route).
3. Delete `app/api/circles/[id]/join/route.ts.bak`.

**P1 — kill duplicates / orphans**
4. Collapse 3 reaction endpoints → 1. Standardize on one auth helper.
5. Remove dead V1 UI tree `app/circles/` (keep `app/(app)/circle/`).
6. Decide V1 vs V2 circle model. V2 is the live one — write a migration to drop `circles` + `circle_memberships` (0 rows, safe) OR formally deprecate. Remove V1 code refs.
7. Dedup join + du'a-ameen endpoints.

**P2 — restore migration truth**
8. Reconcile local migrations to the live ledger: pull real schema (`supabase db pull`) into one clean baseline, delete the renumbered/duplicate/CONSOLIDATED files. Folder must match production before any new push.

**P3 — before launch (gate)**
9. Build and prove the Trust & Safety flow (report → moderation_queue → action → receipt). Currently 0 rows and no proven path. This is the Phase 5 launch gate from the V2 scope lock — it is CONCEPT, not built.
10. Decide DB isolation: separate Supabase project (or at minimum separate schema) for Amina before App Store submission.

---

## 5. RESULT (when done)
- `next build` passes; deploy unblocked.
- One circle model, one reaction endpoint, one comment endpoint, no dead routes.
- Local migrations = production reality.
- Join requests actually work (RLS).
- Clear, honest gap list for launch: Trust & Safety + DB isolation are the two real blockers, not feature count.

---

## 6. EDGE CASES / WATCH
- Dropping `circles`/`circle_memberships`: confirm no FK from `circle_posts`/`circle_reactions` points at them (they likely point at `circle_groups`) before dropping.
- Collapsing reaction endpoints: check the client (`FaithReactions.tsx`) for which URL it calls — align before deleting.
- `FIX_AMINA_AUTH.sh` targets branch `origin/v0/rsemeah-e1b773cc`; main already has the auth fix. Do not run blind — diff first.
- Shared DB: any destructive migration here also touches HireWire/By Red/Lantern. Scope every DROP to `circle*`/`amina*`/`dua*` only.

---

*Classification labels: VERIFIED = checked against live DB or disk this session. ASSUMPTION = inferred. CONCEPT/PROTOTYPE/PLAYBOOK/PRODUCT-READY per RLS integrity standard.*
