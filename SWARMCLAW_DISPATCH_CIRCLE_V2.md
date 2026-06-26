# SWARMCLAW DISPATCH — AMINA: THE CIRCLE V2
Issued: 2026-06-19 | Branch: feature/circle-v2 | Supersedes: V1
Final instruction: Merge to main and commit all changes upon completion of all phases.

## MISSION BRIEF
Premium-only private social world: admission code gating, dual-admin resilience, halal-gated live feed (text/image/video/repost), internal/external sharing. Full rebuild from V1 — new tables added alongside existing.

NON-NEGOTIABLES:
- No business logic in frontend/API routes — n8n owns halal gate, succession, content state
- Halal gate runs BEFORE publish. Never auto-approve on gate failure.
- RLS at DB layer AND API middleware (defense in depth)
- Admission code: plaintext never stored/logged/returned after initial creation
- External share page: never expose Circle name, member count, or admission info
- Feed: chronological only, no algorithm

## PHASE 0 — BRANCH SETUP (Agent: DEPLOY or ARCHITECT)
git checkout main && git pull origin main && git checkout -b feature/circle-v2

## PHASE 1 — DATABASE MIGRATIONS (Agent: ARCHITECT or DATABASE)

Migration 20260619_010_circles_v2.sql:
CREATE TABLE IF NOT EXISTS circles_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  admission_code_hash TEXT NOT NULL,
  admission_code_expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','orphaned')),
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

Migration 20260619_011_circle_members_v2.sql:
CREATE TABLE circle_members_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  admin_order INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), left_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  UNIQUE(circle_id, user_id)
);

Migration 20260619_012_circle_posts.sql:
CREATE TABLE circle_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles_v2(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('text','image','video','repost')),
  body TEXT, media_url TEXT, media_thumbnail_url TEXT, shared_media_url TEXT,
  repost_source_id UUID REFERENCES circle_posts(id) ON DELETE SET NULL,
  halal_status TEXT NOT NULL DEFAULT 'pending' CHECK (halal_status IN ('pending','approved','flagged','rejected')),
  halal_checked_at TIMESTAMPTZ, halal_flag_reason TEXT,
  share_external_enabled BOOLEAN NOT NULL DEFAULT false,
  starred_count INTEGER NOT NULL DEFAULT 0, repost_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

Migration 20260619_013_circle_comments.sql:
CREATE TABLE circle_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES circle_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL, starred BOOLEAN NOT NULL DEFAULT false,
  halal_status TEXT NOT NULL DEFAULT 'pending' CHECK (halal_status IN ('pending','approved','flagged','rejected')),
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

Migration 20260619_014_circle_admission_log.sql:
CREATE TABLE circle_admission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles_v2(id),
  admitted_user_id UUID NOT NULL REFERENCES auth.users(id),
  admitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  admitted_by UUID REFERENCES auth.users(id), code_used_hash TEXT NOT NULL
);

Migration 20260619_015_circle_succession_offers.sql:
CREATE TABLE circle_succession_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles_v2(id),
  offered_to UUID NOT NULL REFERENCES auth.users(id),
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired'))
);
CREATE UNIQUE INDEX idx_circle_succession_pending ON circle_succession_offers(circle_id) WHERE status = 'pending';

Migration 20260619_016_circle_rls.sql — enable RLS + policies on all 4 tables:
- circles_v2: member_read (active members only), insert (created_by=uid), update_admin (admin role only)
- circle_members_v2: list (members of same circle), insert_self (uid=user_id), update_self
- circle_posts: read_approved (active member + halal_status=approved + status=published), read_own, insert (member), delete_own
- circle_comments: read (active member + approved + visible), insert (author)

Migration 20260619_017_circle_indexes.sql:
- idx on circle_members_v2(circle_id, user_id), (circle_id, status), (circle_id, admin_order) WHERE active
- idx on circle_posts(circle_id, created_at DESC) WHERE approved+published, (author_id), (repost_source_id)
- idx on circle_comments(post_id, created_at), circle_admission_log(circle_id, admitted_at)

Migration 20260619_018_circle_rpcs.sql:
CREATE OR REPLACE FUNCTION increment_circle_member_count(p_circle_id UUID) RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$ UPDATE circles_v2 SET member_count = member_count + 1 WHERE id = p_circle_id; $$;
CREATE OR REPLACE FUNCTION decrement_circle_member_count(p_circle_id UUID) RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$ UPDATE circles_v2 SET member_count = GREATEST(0, member_count - 1) WHERE id = p_circle_id; $$;

Enable Realtime: ALTER PUBLICATION supabase_realtime ADD TABLE circle_posts, circle_comments, circle_members_v2, circle_succession_offers;

## PHASE 2 — SUPABASE STORAGE (Agent: ARCHITECT or DATABASE)
Buckets:
- circle-media (PRIVATE): circle-media/circles/{circle_id}/{post_id}/original.{ext}
- circle-shared-media (PUBLIC): circle-shared-media/circles/{post_id}/original.{ext}
- circle-thumbnails (PUBLIC): circle-thumbnails/circles/{circle_id}/{post_id}/thumb.jpg

Storage RLS:
- circle_media_upload: INSERT check — uid is active member of circle_id from path
- circle_media_read: SELECT — uid is active member of circle_id from path
- circle_shared_media_read + circle_thumbnails_read: public SELECT

Storage webhook: circle-media INSERT → {N8N}/webhook/circle-media-upload

## PHASE 3 — UTILITY LIBRARY (Agent: BUILDER)
File: lib/circles/admissionCode.ts
- generateAdmissionCode(): nanoid 8 chars, alphabet '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' (no ambiguous)
- hashAdmissionCode(code): bcrypt.hash(code.toUpperCase().trim(), 10)
- verifyAdmissionCode(code, hash): bcrypt.compare(code.toUpperCase().trim(), hash)
- isCodeExpired(expiresAt): compare to now()
- maskCode(code): '•'.repeat(5) + code.slice(-3)
Install: npm install bcryptjs nanoid && npm install --save-dev @types/bcryptjs

## PHASE 4 — API MIDDLEWARE (Agent: BUILDER)
File: lib/middleware/premiumRequired.ts
- requirePremium(userId): check profiles.subscription_tier === 'premium', else 403 PREMIUM_REQUIRED
- requireCircleAdmin(userId, circleId): check circle_members_v2 role=admin+active, else 403 ADMIN_REQUIRED
- requireCircleMember(userId, circleId): check circle_members_v2 active, else 403 NOT_MEMBER

## PHASE 5 — API ROUTES (Agent: BUILDER)
Route tree:
  POST/GET  /api/circles                          — create + list my circles
  POST      /api/circles/join                     — join by code
  GET       /api/circles/[circleId]               — metadata
  GET       /api/circles/[circleId]/feed          — paginated chronological feed (cursor-based, limit 50)
  POST      /api/circles/[circleId]/posts         — create post (drafts to 'pending' gate)
  DELETE    /api/circles/[circleId]/posts/[id]    — remove own post
  POST      /api/circles/[circleId]/posts/[id]/repost
  POST      /api/circles/[circleId]/posts/[id]/report
  PATCH     /api/circles/[circleId]/posts/[id]/share  — toggle external share
  GET/POST  /api/circles/[circleId]/comments/[postId]
  PATCH     /api/circles/[circleId]/comments/[commentId]/star
  GET       /api/circles/[circleId]/members
  DELETE    /api/circles/[circleId]/members/[userId]
  PATCH     /api/circles/[circleId]/members/[userId]/role
  POST      /api/circles/[circleId]/admission-code  — rotate code (admin only)
  POST      /api/circles/[circleId]/leave
  POST      /api/circles/[circleId]/succession/respond

Key rules:
- POST /circles: generate code via generateAdmissionCode(), hash it, insert circles_v2, insert creator as admin admin_order=1. Return circleId + plainCode ONE TIME ONLY.
- POST /join: verify code via verifyAdmissionCode(), check expiry, upsert member, log to circle_admission_log, increment_circle_member_count RPC
- POST /posts: validate content_type, image<10MB, video<50MB, insert as halal_status=pending status=draft. n8n gate fires via webhook — no manual trigger.
- POST /leave: update status=left, decrement_circle_member_count. Succession fires via webhook.
- POST /admission-code: admin only, generate+hash new code, optional expiresInHours. Return plainCode.
- POST /succession/respond: accept→promote user to admin + activate circle + mark offer accepted. decline→mark declined, n8n re-runs succession.

External share page: app/shared/[postId]/page.tsx
- Uses service role client (no auth required)
- Guards: share_external_enabled=true AND halal_status=approved AND status=published, else notFound()
- NEVER expose: circle name, member count, admission info
- Shows: post body, shared_media_url (copy in public bucket), author.display_name, "Shared from Amina" header
- CTA: App Store link

## PHASE 6 — N8N FLOWS (Agent: AUTOMATION)
Required creds: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PERSPECTIVE_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, N8N_WEBHOOK_SECRET

Flow 1 circle-text-gate: webhook on circle_posts INSERT/UPDATE (pending, text/repost) → Perspective API (TOXICITY/SEVERE_TOXICITY/IDENTITY_ATTACK/SEXUALLY_EXPLICIT) → thresholds >0.7 reject, 0.5-0.7 flag, <0.5 approve → PATCH circle_posts halal_status+status → notify author if rejected. API error → flag not approve.

Flow 2 circle-image-gate: storage webhook circle-media INSERT (jpg/png/webp/gif) → Rekognition DetectModerationLabels(75) → EXPLICIT_NUDITY/GRAPHIC_VIOLENCE reject, SUGGESTIVE flag → PATCH post

Flow 3 circle-video-gate: storage webhook circle-media INSERT (mp4/mov/webm) → download → ffmpeg extract frames every 5s → parallel Rekognition (max 10 concurrent) → aggregate verdict → generate thumbnail frame_0001.jpg → upload to circle-thumbnails → PATCH post thumbnail_url + verdict. Delete temp files.

Flow 4 circle-repost-gate: webhook circle_posts INSERT repost → fetch source post → if source not approved/removed → reject new post reason=source_unavailable. If new post has body → run Perspective inline. PATCH with verdict.

Flow 5 circle-comment-gate: webhook circle_comments INSERT pending → Perspective → PATCH halal_status + status=visible if approved → notify if rejected

Flow 6 circle-cascade-removal: webhook circle_posts UPDATE status→removed → PATCH all reposts status=removed reason=source_removed → PATCH all comments status=removed

Flow 7 circle-pending-sweeper: schedule every 10min → SELECT posts WHERE pending AND created_at < now()-10min → emit to appropriate gate flow by content_type

Flow 8 circle-admin-succession: webhook circle_members_v2 UPDATE status→left/removed → if role was not admin STOP → count active admins, if ≥1 STOP → SET circle status=orphaned → find next candidate (ORDER BY most_recent_post DESC NULLS LAST, joined_at ASC) → if no candidate schedule archive 7d → INSERT succession_offer expires_at=now()+72hr → notify candidate → on offer declined re-run excluding declined users

Flow 9 circle-share-enable: webhook circle_posts UPDATE share_external_enabled→true → confirm approved+published else revert false → copy media from circle-media to circle-shared-media → PATCH shared_media_url

Flow 10 circle-share-disable: webhook share_external_enabled→false → DELETE from circle-shared-media → PATCH shared_media_url=null

Flow 11 circle-premium-lapse: schedule daily 02:00 → find free-tier users who are circle members → if lapsed >7 days remove from all circles + trigger succession + notify → if within 7-day grace send upgrade reminder

Supabase DB Webhooks:
- circle_posts INSERT+UPDATE → {N8N}/webhook/circle-post-change
- circle_members_v2 UPDATE → {N8N}/webhook/circle-member-change
- circle_comments INSERT → {N8N}/webhook/circle-comment-change
- circle_succession_offers UPDATE → {N8N}/webhook/circle-succession-change

## PHASE 7 — REALTIME HOOKS (Agent: BUILDER)
File: lib/circles/useCircleFeed.ts
- State: posts, newPostCount, cursor, hasMore, loading
- loadFeed(reset): fetches /api/circles/{id}/feed?cursor&limit=20, deduplicates on append
- Realtime subscription on circle_posts INSERT (approved+published → increment newPostCount) + UPDATE (pending→approved → increment count | status=removed → remove from state)
- Returns: posts, newPostCount, hasMore, loading, loadMore(), refresh()

File: lib/circles/usePostGateStatus.ts
- Realtime subscription on circle_posts UPDATE filter id=eq.{postId} → tracks halal_status live

## PHASE 8 — FRONTEND COMPONENTS (Agent: FRONTEND)
Components (components/circle/):
- CircleFeed.tsx — useCircleFeed, NewPostsBanner (tap to refresh), infinite scroll
- PostCard.tsx — renders by content_type, HalalPendingBadge for own pending posts
- PostComposer.tsx — tabs: Text/Image/Video/Repost, state machine: IDLE→COMPOSING→UPLOADING_MEDIA→SUBMITTING→PENDING_GATE→PUBLISHED/REJECTED
- MediaUploader.tsx — uploads to circle-media bucket, returns storage path
- RepostCard.tsx — nested source post display (source circle masked as "Another Circle" for cross-circle)
- CommentThread.tsx — expandable, per-comment star button
- MemberList.tsx — admin sees remove/promote controls
- AdmissionCodePanel.tsx — masked display (•••••ABC), rotate button → one-time modal with copy + "I've saved this" checkbox. Plaintext gone on dismiss.
- SuccessionOffer.tsx — in-app banner: accept/decline admin succession offer
- ExternalShareToggle.tsx — author-only, toggles share_external_enabled
- PremiumGatePrompt.tsx — free users see this instead of create/join. Message: "Circles are premium — your private social world with your people." CTA: Upgrade to Premium

Pages (app/(app)/circles/):
- page.tsx — My Circles grid
- create/page.tsx — name+description form → one-time code reveal modal
- [circleId]/page.tsx — feed view
- [circleId]/members/page.tsx — member list
- [circleId]/settings/page.tsx — admin: rotate code, archive, edit
- join/page.tsx — circleId + code entry

## OPEN QUESTIONS (Lock before Phase 8)
1. Member leave: posts stay anonymized as "Former Member" (deletable on explicit request)
2. Max Circle size: 500 members
3. Video max length: 90 seconds
4. Cross-circle repost: YES via repost mechanic, source circle masked as "Another Circle"
5. Succession order: activity-first (most recently posted offered first)

## FINAL STEP — GIT MERGE AND COMMIT (Agent: DEPLOY or GIT)
git add -A
git commit -m "feat(circle): The Circle v2 — halal gate, admin succession, external share"
git checkout main
git merge feature/circle-v2 --no-ff -m "merge: The Circle v2 into main"
git push origin main
git branch -d feature/circle-v2
git push origin --delete feature/circle-v2
