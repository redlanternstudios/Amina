# SWARMCLAW DISPATCH — AMINA: CIRCLE LOGIN REDIRECT HOTFIX
Issued: 2026-06-25
Conductor: ROBBY (lifecycle, receipts, gate)
Priority: HIGH — blocks Circle V1 retention loop
Branch: feature/circle-v1-real (or current active Circle branch)
No hyphens in any output. Truth labels mandatory: VERIFIED, PARTIAL, MISSING, PLANNED.

---

## BUG REPORT

**Observed:** User navigates to The Circle while logged out. Auth flow runs. After login, user lands on `/dashboard` instead of `/circle`.

**Retention impact:** CRITICAL. Circle retention loop (post → reaction → notification → return → reciprocate) never activates if the entry point bounces users out. This is a Day 8-14 retention killer.

**Root cause hypothesis (most likely, in order):**
1. Post-login redirect is hardcoded to `/dashboard` — `redirectTo` param not passed or not honored in auth callback
2. Next.js middleware unconditionally redirects authenticated users to `/dashboard` regardless of destination
3. Duplicate route tree collision — `/circle` vs `/circles` vs `app/circles` causing route resolution failure

---

## CTP PROMPT CONTRACT

GOAL: Identify exact root cause, fix the auth redirect chain centrally (not per-route), collapse duplicate route tree, verify no other route is broken.

CONSTRAINTS:
- Fix must be central (middleware or callback handler), not per-route patches
- Must not break dashboard, chat, profile, or any other protected route post-login
- No scope additions — this is a bug fix only
- No new dependencies

FAILURE (build rejected if any of these):
- Fix is applied per-route instead of centrally
- Dashboard login path is broken after fix
- Infinite redirect loop exists on any route after fix
- Duplicate route tree (`/circle` vs `/circles`) still exists after this pass
- TRUTH cannot verify the fix on the live test account

---

## PHASE 0 — DIAGNOSE (ARCHITECT + BACKEND)

**Read these files before touching anything:**

1. `middleware.ts` (root level) — look for:
   - Hardcoded `/dashboard` as post-auth redirect destination
   - Auth check that redirects ALL authenticated users to dashboard
   - Whether `/circle` is in the protected routes list

2. `app/auth/callback/route.ts` — look for:
   - Where the post-login destination is resolved
   - Whether `next` or `redirectTo` query param is read and honored
   - What the fallback destination is when param is absent

3. Route tree audit — run:
   ```bash
   find app -type d -name "circle*" -o -type d -name "circles*"
   find app -path "*/circle*" -name "page.tsx"
   ```
   Document every circle-related route. Flag duplicates.

**Output of Phase 0:**
- Named root cause (one of the three hypotheses above, or new finding)
- Exact file + line number where the redirect is wrong
- List of all duplicate circle routes

MERGE GATE: Root cause documented. ARCHITECT signs off on diagnosis before any code changes.

---

## PHASE 1 — AUTH REDIRECT FIX (BACKEND)

**Fix pattern — choose based on Phase 0 diagnosis:**

### If root cause is hardcoded redirect in middleware.ts:
```typescript
// middleware.ts — replace hardcoded destination with preserved next param
// BEFORE (approximate — read actual code first):
return NextResponse.redirect(new URL('/dashboard', req.url))

// AFTER:
const next = req.nextUrl.searchParams.get('next') ?? '/dashboard'
return NextResponse.redirect(new URL(next, req.url))
```

### If root cause is auth callback not honoring redirectTo:
```typescript
// app/auth/callback/route.ts
// After exchange succeeds:
const next = requestUrl.searchParams.get('next') ?? '/dashboard'
return NextResponse.redirect(new URL(next, origin))
```

### If root cause is the Circle page not passing next param to auth:
```typescript
// In the Circle page or its auth guard:
router.push(`/sign-in?next=/circle`)
// NOT:
router.push('/sign-in')
```

**Fix must be central.** If the same bug would affect `/profile` or `/chat`, the fix must cover all protected routes, not just `/circle`.

**Verify `NEXT_PUBLIC_SITE_URL`** is set in Vercel env and matches the production domain. Supabase redirect URLs must be allowlisted in the Supabase dashboard.

MERGE GATE: Fix applied. Not merged yet. Move to Phase 2.

---

## PHASE 2 — ROUTE TREE COLLAPSE (FRONTEND + BACKEND)

The existing V1 Real dispatch already flagged this: duplicate circle route trees exist (`/circle`, `/circles`, `app/circles`).

**Task:**
- Identify all circle-related routes from Phase 0 audit
- Confirm canonical route is `/circle` (singular)
- Redirect or remove `/circles` (plural) route if it exists
- Update any internal links, `router.push`, `href`, `Link` pointing to wrong route
- Update middleware protected routes list if `/circles` is listed separately

**Do not change any circle UI or functionality — route consolidation only.**

MERGE GATE: Only one `/circle` route tree exists. All internal links resolve correctly.

---

## PHASE 3 — REGRESSION TEST (QA + TRUTH)

Test on live account (amina@yopmail.com / Amina123!) — do NOT use a new account for this.

**Test matrix:**

| Starting route | Action | Expected landing | Pass/Fail |
|---|---|---|---|
| `/circle` (logged out) | Login | `/circle` | |
| `/dashboard` link | Login | `/dashboard` | |
| `/chat` (logged out) | Login | `/chat` | |
| `/` | Login | `/dashboard` or `/circle` (confirm default) | |
| Already logged in → visit `/circle` | No action | `/circle` (no redirect) | |
| Auth callback URL directly | Load | No loop | |

**All rows must pass.** Any failure = hold merge, escalate to ROBBY.

**TRUTH signs off:** labels each AC as VERIFIED or BLOCKED. No ASSUMED entries in the receipt.

---

## PHASE 4 — MERGE + RECEIPT (ROBBY)

After all ACs pass:
- Commit message: `fix(auth): preserve next param through login redirect — collapses /circles to /circle`
- Merge into `feature/circle-v1-real`
- ROBBY posts receipt: root cause confirmed, files changed, AC results, regression clean

---

## DECISION AUTHORITY

- Tier 1 (agent decides): exact implementation of the redirect fix within the pattern above
- Tier 2 (one line to Ro): if root cause is something other than the three hypotheses — new finding gets flagged before fix
- Tier 3 (escalate to Ro): if fix requires changes to Supabase Auth settings (allowlisted URLs), Vercel env, or any scope addition

---

## BLOCKERS TO RAISE IMMEDIATELY

- If `NEXT_PUBLIC_SITE_URL` is missing or wrong in Vercel → flag to Ro before deploying
- If Supabase allowed redirect URLs do not include the production domain → flag to Ro
- If the route tree audit reveals more than 3 duplicate directories → flag scope of cleanup before proceeding

---

BEGIN AT PHASE 0. Do not touch code before root cause is confirmed. Fix must be central. Drift requires Ro's approval.
