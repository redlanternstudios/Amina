## PR: frontend/amina/mosque-card-v1 → main

### Summary
Migrates the Circles subsystem from its legacy schema (003) to the rebuilt intimate-groups schema (007), adds MosqueCard for mosque discovery in chat, and moves deprecated circle pages to `__deprecated__/`. All migration SQL is consolidated into a single runnable script.

### What changed

**Schema (Supabase)**
- Consolidated 6 migration files (003–007) into `supabase/consolidated_circle_migration.sql` — single runnable script resolving the 003/007 conflict
- 007 schema supersedes 003: circles are now invite-only intimate groups with topic-restricted categories, `invite_code`, `member_limit`, binary-only reactions
- 004/005 RLS policies adapted from `circle_memberships` → `circle_members`
- Added `deleted_at` soft delete, `circle_notifications`, moderation queue, `circle-media` storage bucket
- Security definer helpers: `is_circle_member()`, `join_circle()`, `generate_circle_invite_code()`, `get_circle_preview()`

**Frontend**
- **MosqueCard component** (`components/chat/MosqueCard.tsx`) — mosque search + display flow in chat
- **Routes migrated**: circle pages re-homed under `/circles/`; old `/circle/` routes moved to `__deprecated__/circle/`
- **Deprecated pages preserved** under `__deprecated__/` for rollback safety
- **New endpoints**: `POST /api/circles/[id]/posts/[postId]/react`, server actions for join/preview
- **Feature flag** added in `lib/feature-flags.ts` for controlled rollout
- BottomNav updated to point to new `/circles` route

**Docs & Ops**
- `AMINA_SCOPE_LOCK_V2.md` — 8-item scope lock
- `docs/ops/circles_review_audit.md` — review audit log
- `docs/ops/circles_verification_plan.md` — test plan
- `supabase/MIGRATION_GUIDE.md` — execution guide with ordering

### Conflict resolution: 003/007
Migration 003 (original circle schema) is fully superseded by 007 (rebuild as intimate groups). The key schema changes:
- `circles` added `intention`, `topic` (7 Islamic categories), `invite_code`, `member_limit`
- `circle_memberships` → `circle_members` (composite PK, no `status` column)
- `circle_messages` table dropped (messaging moved out of scope)
- `circle_reactions` simplified to binary (composite PK, no polymorphic `target_type`)
- `dm_*` and `circle_profiles` tables dropped (separate scope)

### Migration execution
```bash
# Run in Supabase SQL editor or via CLI:
cat supabase/consolidated_circle_migration.sql | supabase db execute
```

Safe to re-run — all statements use `IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP ... IF EXISTS`.

### Test verification
- [ ] Verify consolidated migration runs clean against a staging DB
- [ ] MosqueCard renders in chat with correct mosque data
- [ ] Circle create → join → post → react flow works end-to-end
- [ ] Invite code generation and `get_circle_preview` for unauthenticated users
- [ ] Soft delete: circles with `deleted_at` set are excluded from queries
- [ ] Deprecated routes redirect or show deprecation notice
