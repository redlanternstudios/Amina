-- =============================================================================
-- CONSOLIDATED CIRCLE MIGRATION — Amina RedLantern Studios
-- =============================================================================
-- This script consolidates migrations 003 through 007 into a single
-- deployable migration. It resolves the 003/007 conflict by using the
-- REBUILT schema from 007 (intimate groups, invite-only) as the base,
-- and adapts the 004-005 migrations to use the new table structure.
--
-- Order within this file:
--   1. Extension & schema guard
--   2. BASE SCHEMA (from 007 — circles, circle_members, circle_posts, circle_reactions)
--   3. DELTA (from 005 — deleted_at, circle_notifications)
--   4. DELTA (from 004 — moderation_queue, adapted circle_invites)
--   5. DELTA (from 005 — adapted circle_invites with is_active, use_count)
--   6. DELTA (from 006 — storage bucket)
--   7. Security definer helpers (from 007)
-- =============================================================================

-- ===== 1. GUARD =====
-- Safe to re-run; all statements use IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS
-- =============================================================================

-- =============================================================================
-- 2. BASE SCHEMA — 007: Circles as Invite-Only Intimate Groups
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    intention TEXT NOT NULL,
    topic TEXT NOT NULL CHECK (
        topic IN (
            'faith_worship',
            'marriage_family',
            'mental_health',
            'sisterhood',
            'quran_study',
            'life_transitions',
            'new_muslims'
        )
    ),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    member_limit INT NOT NULL DEFAULT 15 CHECK (member_limit <= 20),
    is_open BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.circle_members (
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.circle_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.circle_reactions (
    post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id_created_at ON public.circle_posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circles_invite_code ON public.circles(invite_code);
CREATE INDEX IF NOT EXISTS idx_circles_is_open ON public.circles(is_open) WHERE is_open = true;

-- RLS — Circles
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "circles_select" ON public.circles;
CREATE POLICY "circles_select" ON public.circles
    FOR SELECT USING (
        is_open = true
        OR EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circles_insert" ON public.circles;
CREATE POLICY "circles_insert" ON public.circles
    FOR INSERT WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "circles_update" ON public.circles;
DROP POLICY IF EXISTS "circles_delete" ON public.circles;
CREATE POLICY "circles_update" ON public.circles
    FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "circles_delete" ON public.circles
    FOR DELETE USING (creator_id = auth.uid());

-- RLS — Circle Members
DROP POLICY IF EXISTS "circle_members_select" ON public.circle_members;
CREATE POLICY "circle_members_select" ON public.circle_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_members_insert" ON public.circle_members;
CREATE POLICY "circle_members_insert" ON public.circle_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "circle_members_delete" ON public.circle_members;
CREATE POLICY "circle_members_delete" ON public.circle_members
    FOR DELETE USING (user_id = auth.uid());

-- RLS — Circle Posts
DROP POLICY IF EXISTS "circle_posts_select" ON public.circle_posts;
CREATE POLICY "circle_posts_select" ON public.circle_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_posts_insert" ON public.circle_posts;
CREATE POLICY "circle_posts_insert" ON public.circle_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_posts_delete" ON public.circle_posts;
CREATE POLICY "circle_posts_delete" ON public.circle_posts
    FOR DELETE USING (user_id = auth.uid());

-- RLS — Circle Reactions
DROP POLICY IF EXISTS "circle_reactions_select" ON public.circle_reactions;
CREATE POLICY "circle_reactions_select" ON public.circle_reactions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "circle_reactions_insert" ON public.circle_reactions;
CREATE POLICY "circle_reactions_insert" ON public.circle_reactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = (
                SELECT circle_id FROM public.circle_posts
                WHERE id = post_id
            )
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_reactions_delete" ON public.circle_reactions;
CREATE POLICY "circle_reactions_delete" ON public.circle_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Trigger: auto-add creator as admin
CREATE OR REPLACE FUNCTION public.handle_circle_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (NEW.id, NEW.creator_id, 'admin');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_created ON public.circles;
CREATE TRIGGER trg_circle_created
    AFTER INSERT ON public.circles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_circle_created();

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS circles_updated_at ON public.circles;
CREATE TRIGGER circles_updated_at
    BEFORE UPDATE ON public.circles
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- last_activity_at
ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.update_circle_last_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.circles SET last_activity_at = NEW.created_at
    WHERE id = NEW.circle_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_post_created ON public.circle_posts;
CREATE TRIGGER trg_circle_post_created
    AFTER INSERT ON public.circle_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_circle_last_activity();

-- =============================================================================
-- 3. DELTA from 005 — Soft Delete & Circle Notifications
-- =============================================================================

-- Soft delete column (from 005_circle_soft_delete.sql + 005_circle_invites_notifications.sql)
ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Circle Notifications
CREATE TABLE IF NOT EXISTS public.circle_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'invite_received',
    'invite_accepted',
    'member_joined',
    'member_left',
    'role_changed',
    'circle_updated',
    'new_message'
  )),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_notifications_user_unread
  ON public.circle_notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_circle_notifications_circle
  ON public.circle_notifications(circle_id, created_at DESC);

ALTER TABLE public.circle_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.circle_notifications;
CREATE POLICY "Users can view own notifications" ON public.circle_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.circle_notifications;
CREATE POLICY "System can insert notifications" ON public.circle_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.circle_notifications;
CREATE POLICY "Users can update own notifications" ON public.circle_notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.circle_notifications;
CREATE POLICY "Users can delete own notifications" ON public.circle_notifications
  FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.circle_notifications;

-- =============================================================================
-- 4. DELTA from 004 — Moderation Queue & Circle Invites (adapted to new schema)
-- =============================================================================

-- Circle Invites (adapted from old 004_circle_invites.sql)
-- NOTE: references `circle_members` (new) instead of `circle_memberships` (old)
CREATE TABLE IF NOT EXISTS public.circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_invites_code ON public.circle_invites(code);
CREATE INDEX IF NOT EXISTS idx_circle_invites_circle_id ON public.circle_invites(circle_id);

ALTER TABLE public.circle_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can view invites" ON public.circle_invites;
CREATE POLICY "Auth users can view invites" ON public.circle_invites
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can create invites" ON public.circle_invites;
CREATE POLICY "Admins can create invites" ON public.circle_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update invites" ON public.circle_invites;
CREATE POLICY "Admins can update invites" ON public.circle_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete invites" ON public.circle_invites;
CREATE POLICY "Admins can delete invites" ON public.circle_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

-- Moderation Queue
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  verdict      TEXT NOT NULL CHECK (verdict IN ('flagged', 'rejected')),
  reasons      TEXT[] NOT NULL DEFAULT '{}',
  reviewed     BOOLEAN NOT NULL DEFAULT false,
  reviewer_id  UUID REFERENCES auth.users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_moderation_queue_unreviewed
  ON public.moderation_queue (reviewed, created_at DESC)
  WHERE reviewed = false;

CREATE INDEX IF NOT EXISTS idx_moderation_queue_user
  ON public.moderation_queue (user_id, created_at DESC);

-- =============================================================================
-- 5. DELTA from 005 — Circle Invites additions (merged into above table, 
--    so only add is_active / use_count columns if missing, plus alternative
--    invite table with is_active column)
-- =============================================================================
-- The 005_circle_invites_notifications.sql defined circle_invites with 
-- is_active and use_count instead of max_uses/used_count.
-- We merge by adding is_active column (default true) — max_uses/used_count
-- from 004 give us the same semantics.
ALTER TABLE public.circle_invites ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.circle_invites ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;

-- =============================================================================
-- 6. DELTA from 006 — Storage Bucket
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'circle-media',
  'circle-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "circle_media_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'circle-media');

CREATE POLICY IF NOT EXISTS "circle_media_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'circle-media');

CREATE POLICY IF NOT EXISTS "circle_media_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'circle-media' AND auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "circle_media_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner);

-- =============================================================================
-- 7. SECURITY DEFINER HELPERS (from 007)
-- =============================================================================

-- Generate invite code
CREATE OR REPLACE FUNCTION public.generate_circle_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INT := 0;
    pos INT := 0;
BEGIN
    result := '';
    FOR i IN 1..8 LOOP
        pos := 1 + floor(random() * length(chars))::INT;
        result := result || substr(chars, pos, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- is_circle_member — SECURITY DEFINER RPC for route-level checks
CREATE OR REPLACE FUNCTION public.is_circle_member(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_id = p_circle_id AND user_id = p_user_id
  );
$$;

-- join_circle — atomic join with SELECT FOR UPDATE
CREATE OR REPLACE FUNCTION public.join_circle(p_circle_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member_count INT;
    v_member_limit INT;
    v_existing BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.circle_members 
        WHERE circle_id = p_circle_id AND user_id = p_user_id
    ) INTO v_existing;
    
    IF v_existing THEN
        RETURN jsonb_build_object('error', 'Already a member', 'status', 409);
    END IF;
    
    SELECT member_limit INTO v_member_limit 
    FROM public.circles WHERE id = p_circle_id 
    FOR UPDATE;
    
    SELECT COUNT(*) INTO v_member_count
    FROM public.circle_members WHERE circle_id = p_circle_id;
    
    IF v_member_count >= v_member_limit THEN
        RETURN jsonb_build_object('error', 'Circle is full', 'status', 403);
    END IF;
    
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (p_circle_id, p_user_id, 'member');
    
    RETURN jsonb_build_object('status', 200, 'circle_id', p_circle_id);
END;
$$;

-- get_circle_preview — SECURITY DEFINER bypass for unauthenticated invite-code lookup
CREATE OR REPLACE FUNCTION public.get_circle_preview(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_circle RECORD;
    v_member_count INT;
BEGIN
    SELECT id, name, intention, topic, member_limit
    INTO v_circle
    FROM public.circles
    WHERE invite_code = p_invite_code;
    
    IF v_circle.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Circle not found', 'status', 404);
    END IF;
    
    SELECT COUNT(*) INTO v_member_count
    FROM public.circle_members
    WHERE circle_id = v_circle.id;
    
    RETURN jsonb_build_object(
        'name', v_circle.name,
        'intention', v_circle.intention,
        'topic', v_circle.topic,
        'member_count', v_member_count,
        'member_limit', v_circle.member_limit,
        'status', 200
    );
END;
$$;
