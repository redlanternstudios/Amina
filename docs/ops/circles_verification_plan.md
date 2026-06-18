# Circles Backend — Verification Plan

## Mission
Verify all 7 API endpoints + RLS before marking Phase 3 complete.

## Verification Checklist

### 🔴 REACTION COUNT LEAK DETECTION (P0 — BLOCKER IF FAILS)
- [x] Search all route files for `count`, `COUNT`, `length`, `reaction_count`, `num_reactions`
- [x] Confirm `has_reacted` is the ONLY reaction-related field returned
- [x] Confirm `/api/circles/preview` returns NO posts, NO reactions, only name/intention/topic/member_count/member_limit
- [x] Confirm `circle_reactions` RLS: SELECT only returns current user's reactions

### 🔴 RLS VERIFICATION (run with 2 separate auth sessions)
- [ ] Non-member gets 403 on `GET /api/circles/[id]`
- [ ] Non-member gets 403 on `POST /api/circles/[id]/posts`
- [ ] Non-member gets 403 on `POST /api/circles/[id]/posts/[postId]/react`
- [ ] Leaving circle → immediate 403 on all membership-gated routes
- [ ] Open circle (`is_open=true`) visible to non-members (RLS: is_open=true OR member check)

### 🔴 INVITE CODE
- [ ] Valid code returns preview
- [ ] Invalid code returns 404
- [ ] 10 concurrent code generation attempts all return unique codes (charset: ABCDEFGHJKLMNPQRSTUVWXYZ23456789, 8 chars)

### 🔴 MEMBER LIMIT ATOMICITY
- [ ] Join at limit (member_count == member_limit) returns 403
- [ ] Concurrent joins stop at exactly member_limit (SELECT FOR UPDATE in join_circle RPC)
- [ ] Already a member returns 409

### 🟡 MEMBERSHIP
- [ ] Creator auto-added as admin on circle creation
- [ ] Admin sees `invite_code` in GET /api/circles response
- [ ] Member does NOT see `invite_code` in GET /api/circles response

### 🟡 POSTS
- [ ] Content >2000 chars rejected with 400
- [ ] Empty content rejected with 400
- [ ] Post appears in GET /api/circles/[id] immediately
- [ ] Cursor pagination works (limit param, next_cursor, has_more)

### 🟡 REACTIONS
- [ ] First POST to `/react` creates reaction, returns `{has_reacted: true}`
- [ ] Second POST to `/react` deletes reaction, returns `{has_reacted: false}`
- [ ] React to non-existent post returns 404
- [ ] Non-member cannot react (403)

## Required Test Sessions
- Session A: circle creator/admin
- Session B: invited member
- Session C: non-member (different auth session)
- Session D: concurrent join requests (use curl parallel or similar)
