-- ============================================================
-- CONSOLIDATED CIRCLE FEATURE MIGRATION
-- Generated: 2026-06-17
-- Product: Amina
-- Target: Supabase project endovljmaudnxdzdapmf
-- Run this entire script in Supabase SQL Editor (service_role)
-- Migration files consolidated: 002-007
--
-- Canonical ordering (conflicts resolved):
--   002_chat_persistence_fix.sql (kept as-is)
--   007_circle_rebuild_intimate_groups.sql (CANONICAL — supersedes 003_circle_schema + 003_intimate_groups)
--   005_circle_invites_notifications.sql (CANONICAL — supersedes 004_circle_invites + 005_soft_delete)
--   004_moderation_queue.sql (kept as-is, no conflicts)
--   006_circle_storage_bucket.sql (kept as-is, requires storage extension)
-- ============================================================

-- ============================================================
-- 002_CHAT_PERSISTENCE_FIX
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_ollama_error_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  error_message text,
  created_at timestamptz default now()
);

alter table public.chat_ollama_error_logs enable row level security;

create policy "chat_ollama_error_logs_insert" on public.chat_ollama_error_logs
  for insert with check (auth.uid() = user_id);

create policy "chat_ollama_error_logs_select_own" on public.chat_ollama_error_logs
  for select using (auth.uid() = user_id);

create index if not exists idx_chat_errors_user on public.chat_ollama_error_logs(user_id, created_at desc);

-- ============================================================
-- 007_CIRCLE_REBUILD_INTIMATE_GROUPS (CANONICAL)
-- Supersedes: 003_circle_schema, 003_circles_intimate_groups
-- ============================================================

-- 1. CIRCLES TABLE
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

-- 2. CIRCLE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (circle_id, user_id)
);

-- 3. CIRCLE POSTS TABLE
CREATE TABLE IF NOT EXISTS public.circle_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CIRCLE REACTIONS TABLE (BINARY ONLY)
CREATE TABLE IF NOT EXISTS public.circle_reactions (
    post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id_created_at ON public.circle_posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circles_invite_code ON public.circles(invite_code);
CREATE INDEX IF NOT EXISTS idx_circles_is_open ON public.circles(is_open) WHERE is_open = true;

-- RLS
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;

-- CIRCLES
DROP POLICY IF EXISTS "circles_select" ON public.circles;
CREATE POLICY "circles_select" ON public.circles
    FOR SELECT
    USING (
        is_open = true
        OR EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circles_insert" ON public.circles;
CREATE POLICY "circles_insert" ON public.circles
    FOR INSERT
    WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "circles_update" ON public.circles;
DROP POLICY IF EXISTS "circles_delete" ON public.circles;
CREATE POLICY "circles_update" ON public.circles
    FOR UPDATE
    USING (creator_id = auth.uid());
CREATE POLICY "circles_delete" ON public.circles
    FOR DELETE
    USING (creator_id = auth.uid());

-- CIRCLE MEMBERS
DROP POLICY IF EXISTS "circle_members_select" ON public.circle_members;
CREATE POLICY "circle_members_select" ON public.circle_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_members_insert" ON public.circle_members;
CREATE POLICY "circle_members_insert" ON public.circle_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "circle_members_delete" ON public.circle_members;
CREATE POLICY "circle_members_delete" ON public.circle_members
    FOR DELETE
    USING (user_id = auth.uid());

-- CIRCLE POSTS
DROP POLICY IF EXISTS "circle_posts_select" ON public.circle_posts;
CREATE POLICY "circle_posts_select" ON public.circle_posts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_posts_insert" ON public.circle_posts;
CREATE POLICY "circle_posts_insert" ON public.circle_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "circle_posts_delete" ON public.circle_posts;
CREATE POLICY "circle_posts_delete" ON public.circle_posts
    FOR DELETE
    USING (user_id = auth.uid());

-- CIRCLE REACTIONS
DROP POLICY IF EXISTS "circle_reactions_select" ON public.circle_reactions;
CREATE POLICY "circle_reactions_select" ON public.circle_reactions
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "circle_reactions_insert" ON public.circle_reactions;
CREATE POLICY "circle_reactions_insert" ON public.circle_reactions
    FOR INSERT
    WITH CHECK (
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
    FOR DELETE
    USING (user_id = auth.uid());

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.generate_circle_invite_code()
RETURNS TEXT LANGUAGE plpgsql AS \$\$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INT := 0;
    pos INT := 0;
BEGIN
    FOR i IN 1..8 LOOP
        pos := 1 + floor(random() * length(chars))::INT;
        result := result || substr(chars, pos, 1);
    END LOOP;
    RETURN result;
END;
\$\$;

-- TRIGGER: AUTO-ADD CREATOR AS ADMIN
CREATE OR REPLACE FUNCTION public.handle_circle_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS \$\$
BEGIN
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (NEW.id, NEW.creator_id, 'admin');
    RETURN NEW;
END;
\$\$;

DROP TRIGGER IF EXISTS trg_circle_created ON public.circles;
CREATE TRIGGER trg_circle_created
    AFTER INSERT ON public.circles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_circle_created();

-- last_activity_at ON circles
ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.update_circle_last_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS \$\$
BEGIN
    UPDATE public.circles SET last_activity_at = NEW.created_at
    WHERE id = NEW.circle_id;
    RETURN NEW;
END;
\$\$;

DROP TRIGGER IF EXISTS trg_circle_post_created ON public.circle_posts;
CREATE TRIGGER trg_circle_post_created
    AFTER INSERT ON public.circle_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_circle_last_activity();

-- SECURITY DEFINER RPCS
CREATE OR REPLACE FUNCTION public.is_circle_member(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER AS \$\$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_id = p_circle_id AND user_id = p_user_id
  );
\$\$;

CREATE OR REPLACE FUNCTION public.join_circle(p_circle_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS \$\$
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
    FROM public.circles WHERE id = p_circle_id FOR UPDATE;
    SELECT COUNT(*) INTO v_member_count
    FROM public.circle_members WHERE circle_id = p_circle_id;
    IF v_member_count >= v_member_limit THEN
        RETURN jsonb_build_object('error', 'Circle is full', 'status', 403);
    END IF;
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (p_circle_id, p_user_id, 'member');
    RETURN jsonb_build_object('status', 200, 'circle_id', p_circle_id);
END;
\$\$;

CREATE OR REPLACE FUNCTION public.get_circle_preview(p_invite_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS \$\$
DECLARE
    v_circle RECORD;
    v_member_count INT;
BEGIN
    SELECT id, name, intention, topic, member_limit
    INTO v_circle FROM public.circles
    WHERE invite_code = p_invite_code;
    IF v_circle.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Circle not found', 'status', 404);
    END IF;
    SELECT COUNT(*) INTO v_member_count
    FROM public.circle_members WHERE circle_id = v_circle.id;
    RETURN jsonb_build_object(
        'name', v_circle.name, 'intention', v_circle.intention,
        'topic', v_circle.topic, 'member_count', v_member_count,
        'member_limit', v_circle.member_limit, 'status', 200
    );
END;
\$\$;

-- ============================================================
-- 005_CIRCLE_INVITES_NOTIFICATIONS (CANONICAL)
-- Supersedes: 004_circle_invites, 005_circle_soft_delete
-- ============================================================

-- SOFT DELETE for circles
alter table public.circles add column if not exists deleted_at timestamptz;

-- CIRCLE INVITES
create table if not exists public.circle_invites (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  code text not null unique,
  max_uses integer default 0,
  use_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_circle_invites_code on public.circle_invites(code);
create index if not exists idx_circle_invites_circle on public.circle_invites(circle_id);
alter table public.circle_invites enable row level security;

create policy "Members can view circle invites" on public.circle_invites
  for select using (
    exists (
      select 1 from public.circle_members
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

create policy "Admins can create invite codes" on public.circle_invites
  for insert with check (
    exists (
      select 1 from public.circle_members
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

create policy "Admins can update invite codes" on public.circle_invites
  for update using (
    exists (
      select 1 from public.circle_members
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

-- CIRCLE NOTIFICATIONS
create table if not exists public.circle_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  circle_id uuid references public.circles(id) on delete cascade,
  type text not null check (type in (
    'invite_received', 'invite_accepted', 'member_joined',
    'member_left', 'role_changed', 'circle_updated', 'new_message'
  )),
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_circle_notifications_user_unread
  on public.circle_notifications(user_id, read, created_at desc);
create index if not exists idx_circle_notifications_circle
  on public.circle_notifications(circle_id, created_at desc);

alter table public.circle_notifications enable row level security;

create policy "Users can view own notifications" on public.circle_notifications
  for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.circle_notifications
  for insert with check (auth.uid() is not null);
create policy "Users can update own notifications" on public.circle_notifications
  for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on public.circle_notifications
  for delete using (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.circle_notifications;

-- ============================================================
-- 004_MODERATION_QUEUE (standalone, no conflicts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    text NOT NULL,
  verdict      text NOT NULL CHECK (verdict IN ('flagged', 'rejected')),
  reasons      text[] NOT NULL DEFAULT '{}',
  reviewed     boolean NOT NULL DEFAULT false,
  reviewer_id  uuid REFERENCES auth.users(id),
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_moderation_queue_unreviewed
  ON public.moderation_queue (reviewed, created_at DESC)
  WHERE reviewed = false;
CREATE INDEX idx_moderation_queue_user
  ON public.moderation_queue (user_id, created_at DESC);

-- ============================================================
-- 006_CIRCLE_STORAGE_BUCKET (requires storage extension)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'circle-media',
  'circle-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "circle_media_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'circle-media');

CREATE POLICY "circle_media_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'circle-media');

CREATE POLICY "circle_media_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'circle-media' AND auth.uid() = owner);

CREATE POLICY "circle_media_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner);
