# Circle Feature — API Route Verification Report

**Date:** 2026-06-13  
**Status:** VERIFIED ✅  
**Verifier:** RUNTIME

---

## 1. API Routes Inventory

All **8 route files** exist and are implemented:

| Route File | Methods | Status |
|------------|---------|--------|
| `app/api/circles/route.ts` | `GET`, `POST` | ✅ |
| `app/api/circles/[id]/route.ts` | `GET`, `PUT`, `PATCH`, `DELETE` | ✅ |
| `app/api/circles/[id]/invite/route.ts` | `GET`, `POST`, `PATCH` | ✅ |
| `app/api/circles/[id]/join/route.ts` | `POST`, `PATCH` | ✅ |
| `app/api/circles/[id]/members/route.ts` | `GET`, `POST`, `DELETE` | ✅ |
| `app/api/circles/[id]/messages/route.ts` | `GET`, `POST` | ✅ |
| `app/api/circles/[id]/posts/route.ts` | `GET`, `POST` | ✅ |
| `app/api/circles/[id]/reactions/route.ts` | `GET`, `POST` | ✅ |

---

## 2. Routes Present vs. Expected

| Feature | Endpoint | Status |
|---------|----------|--------|
| List my circles | `GET /api/circles` | ✅ |
| Discover circles | `GET /api/circles?type=discover` | ✅ |
| Create circle | `POST /api/circles` | ✅ |
| Get circle detail | `GET /api/circles/[id]` | ✅ |
| Update circle | `PUT/PATCH /api/circles/[id]` | ✅ |
| Soft-delete circle | `DELETE /api/circles/[id]` | ✅ |
| Send invite | `POST /api/circles/[id]/invite` | ✅ |
| List my invites | `GET /api/circles/[id]/invite?type=my` | ✅ |
| Accept/decline invite | `PATCH /api/circles/[id]/invite` | ✅ |
| Join circle | `POST /api/circles/[id]/join` | ✅ |
| Approve join request | `PATCH /api/circles/[id]/join` | ✅ |
| List members | `GET /api/circles/[id]/members` | ✅ |
| Add member | `POST /api/circles/[id]/members` | ✅ |
| Remove member | `DELETE /api/circles/[id]/members` | ✅ |
| List messages | `GET /api/circles/[id]/messages` | ✅ |
| Send message | `POST /api/circles/[id]/messages` | ✅ |
| List posts | `GET /api/circles/[id]/posts` | ✅ |
| Create post | `POST /api/circles/[id]/posts` | ✅ |
| Get reactions | `GET /api/circles/[id]/reactions` | ✅ |
| Toggle reaction | `POST /api/circles/[id]/reactions` | ✅ |

**Result: PASS** — All features covered. Invite acceptance via `PATCH /api/circles/[id]/invite`.

---

## 3. Frontend API Cross-Reference

| Source File | API Call | Exists? |
|-------------|----------|:-------:|
| `(app)/circle/[id]/page.tsx` | `GET /api/circles/[id]/messages` | ✅ |
| `(app)/circle/[id]/chat/page.tsx` | `GET /api/circles/[id]/messages` | ✅ |
| `(app)/circle/[id]/chat/page.tsx` | `POST /api/circles/[id]/messages` | ✅ |
| `(app)/circle/[id]/posts/page.tsx` | `GET /api/circles/[id]/posts` | ✅ |
| `(app)/circle/[id]/posts/page.tsx` | `POST /api/circles/[id]/posts` | ✅ |
| `(app)/circle/[id]/settings/page.tsx` | `GET /api/circles/[id]` | ✅ |
| `(app)/circle/[id]/settings/page.tsx` | `DELETE /api/circles/[id]` | ✅ |
| `app/circles/[id]/page.tsx` | `GET /api/circles/[id]` | ✅ |
| `app/circles/page.tsx` | `GET /api/circles` | ✅ |
| `JoinCircleModal.tsx` | `POST /api/circles/[id]/join` | ✅ |
| `InviteMembersModal.tsx` | `POST /api/circles/[id]/invite` | ✅ |

**Result: PASS** — No orphan frontend references.

---

## 4. Findings

### ⚠️ Missing Media Upload Route (Medium)
Storage bucket migration exists (`005_circle_storage_bucket.sql`) but no API route connects it. `circle_posts` has `media_url` and UI renders images — users cannot upload them.

### ⚠️ Response Shape Mismatch (Medium)
`(app)/circle/[id]/page.tsx` reads flat fields directly. `app/circles/[id]/page.tsx` expects `data.circle`. API returns flat — second page will break.

### 🟡 Duplicate Detail Pages (Low)
`(app)/circle/[id]/` and `app/circles/[id]/` are both active with different layouts. Needs consolidation.

### 🟡 Messages Response Inconsistency (Low)
API returns flat `Message[]` array but `(app)/circle/[id]/page.tsx` expects `data.messages`.

---

## 5. Summary

| Check | Verdict |
|-------|---------|
| All expected API routes exist | ✅ PASS |
| Orphan frontend refs | ✅ PASS |
| Invite flow | ✅ PASS |
| Missing routes | ⚠️ Media upload |
| Response shape match | ⚠️ Mismatch on old detail page |
