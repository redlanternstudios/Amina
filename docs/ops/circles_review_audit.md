# REVIEW — Circles API Audit

## Reaction Count Leak Audit

**Constraint:** `circle_reactions` table is BINARY ONLY. Reaction counts must NEVER appear in any API response, anywhere, under any circumstance.

### Files Checked

| File | Reaction count leak? | Result |
|---|---|---|
| `app/api/circles/route.ts` | None — returns invite_code or stripped | ✅ PASS |
| `app/api/circles/join/route.ts` | None — calls atomic `join_circle` RPC, no reaction data | ✅ PASS |
| `app/api/circles/preview/route.ts` | None — RPC returns metadata only (name, intention, topic, counts) | ✅ PASS |
| `app/api/circles/[id]/route.ts` | None — `has_reacted` boolean ONLY, never a count | ✅ PASS |
| `app/api/circles/[id]/posts/route.ts` | None — returns post content + display_name only | ✅ PASS |
| `app/api/circles/[id]/posts/[postId]/react/route.ts` | None — returns `{has_reacted: boolean}` ONLY | ✅ PASS |

### Additional constraints verified
- ✅ `circle_reactions` SELECT RLS policy: `user_id = auth.uid()` — user can only see THEIR OWN reactions
- ✅ No `count()`, `COUNT`, `length`, `reaction_count`, or `num_reactions` in any route file
- ✅ No aggregate queries on `circle_reactions` in any route
- ✅ `has_reacted` is derived from `.maybeSingle()` existence check, never from `.select('*', {count: 'exact'})`

**Verdict: Zero reaction count leaks. All 7 endpoints clean. PASS.**
