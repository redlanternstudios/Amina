# Circle Feature — Backend Fix Evidence

**Product:** AMINA | **Date:** 2026-06-12 | **Branch:** backend/amina/circle-fixes

## Audit Summary

All 6 API route files at `app/api/circles/` audited and fixed against actual schema.

### Schema Reference

| Table | Columns |
|-------|---------|
| circles | id, name, description, avatar_url, creator_id, is_public, created_at |
| circle_memberships | circle_id, user_id, role, status, joined_at |
| circle_messages | id, circle_id, user_id, message, media_url, media_type, created_at |
| circle_posts | id, circle_id, user_id, content, media_url, media_type, tags, created_at |
| circle_reactions | id, target_id, target_type, user_id, reaction, created_at |

### Fixes Applied

| File | Auth | Schema Fixes | Membership |
|------|------|-------------|------------|
| **circles/route.ts** | ✅ GET+POST | `creator_id`, `is_public`, `circle_memberships` | Active filter; discoverable excludes joined; creator auto-joins |
| **circles/[id]/route.ts** | ✅ + creator guard on PATCH/DELETE | `circle_memberships`, `creator_id` | Admin/creator role check |
| **circles/[id]/messages/route.ts** | ✅ + member guard | `message` col, `media_url`, `media_type` | Active member required |
| **circles/[id]/posts/route.ts** | ✅ + member guard | `circle_reactions`, `media_url`, `media_type`, `tags` | Active member required |
| **circles/[id]/members/route.ts** | ✅ + admin/leader guard | `circle_memberships`, `status: active` | Active filter; admin/leader mutation guard |
| **circles/[id]/join/route.ts** | ✅ + creator guard on PATCH | `circle_memberships` replaces `join_requests` | Public→active, Private→pending status |

### Issues Fixed (13)

1. `circle_members` → `circle_memberships` throughout
2. `created_by` → `creator_id` everywhere
3. `is_private` → `is_public` everywhere
4. `cover_url`/`cover_image_url` removed (not in schema)
5. `circle_join_requests` eliminated — uses `circle_memberships.status`
6. `circle_post_reactions` eliminated — uses `circle_reactions` + JS grouping
7. `title` removed from message/post inserts
8. `content` → `message` in circle_messages insert
9. Auth + membership guards on all 6 endpoints
10. Creator guard on circle PATCH/DELETE
11. Admin/leader guard on member management
12. Duplicate membership + banned status checks on join
13. try/catch + structured error handling on all routes

### Final Verification

```
route.ts:        auth x2, circle_memberships x2, creator_id ✓, is_public ✓
[id]/route.ts:   auth x3, circle_memberships x2, creator_id ✓
[id]/messages:   auth x2, member guard ✓, message col ✓
[id]/posts:      auth x2, member guard ✓, circle_reactions ✓
[id]/members:    auth x3, circle_memberships x5, status filter ✓
[id]/join:       auth x3, circle_memberships x2, no join_requests ✓
```

**Result: CLEAN** — Zero legacy references. All endpoints authenticated. All schema matches actual database.
