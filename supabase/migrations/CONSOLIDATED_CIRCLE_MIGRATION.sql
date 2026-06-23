-- ============================================================================
-- CONSOLIDATED CIRCLE MIGRATION — Amina
-- ============================================================================
-- This file consolidates the following migration files into one runnable script:
--   002_chat_persistence_fix.sql
--   007_circle_rebuild_intimate_groups.sql  (canonical — supersedes v3 circle schema)
--   004_circle_invites.sql                  (invite codes table)
--   004_moderation_queue.sql                (moderation queue table)
--   005_circle_invites_notifications.sql    (notifications, soft delete column)
--   005_circle_soft_delete.sql              (soft delete column + RLS update)
--   006_circle_storage_bucket.sql           (storage bucket + policies)
--
-- Schema resolution:
--   v3 (003_circle_schema.sql, Jun 12) SUPERSEDED by v7 (007_circle_rebuild_intimate_groups.sql, Jun 16).
--   003_circles_intimate_groups.sql is IDENTICAL to 007 — a copy/rename artifact.
--
--   v3 created: circles, circle_memberships, circle_messages, circle_posts,
--       circle_reactions (5-type), dm_conversations, dm_participants,
--       dm_messages, circle_profiles
--   v7 creates: circles (rebuild), circle_members, circle_posts, circle_reactions (binary)
--   v7 wins — narrower, invite-code-based, privacy-first intimate groups model.
--
-- All statements use IF NOT EXISTS / DROP IF EXISTS guards for idempotency.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Chat Persistence Fix
-- Source: 002_chat_persistence_fix.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION public.touch_conversation_updated_at()
RETURNS trigger AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.touch_conversation_updated_at();

CREATE OR REPLACE VIEW public.conversation_previews AS
SELECT
  c.id,
  c.user_id,
  c.title,
  c.topic_tag,
  c.updated_at,
  m.content AS last_message,
  m.role AS last_role
FROM public.conversations c
LEFT JOIN LATERAL (
  SELECT content, role
  FROM public.messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) m ON true;

-- ============================================================================
-- SECTION 2: Circles / Intimate Groups (v7 — canonical)
-- Source: 007_circle_rebuild_intimate_groups.sql
-- ============================================================================

-- 2a. CIRCLES TABLE
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

ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2b. CIRCLE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (circle_id, user_id)
);

-- 2c. CIRCLE POSTS TABLE
CREATE TABLE IF NOT EXISTS public.circle_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2d. CIRCLE REACTIONS TABLE (binary — presence only, counts NEVER exposed)
CREATE TABLE IF NOT EXISTS public.circle_reactions (
    post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- 2e. INDEXES
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id_created_at ON public.circle_posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circles_invite_code ON public.circles(invite_code);
CREATE INDEX IF NOT EXISTS idx_circles_is_open ON public.circles(is_open) WHERE is_open = true;

-- 2f. ROW LEVEL SECURITY
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;

-- Circles: SELECT
DROP POLICY IF EXISTS "circles_select" ON public.circles;
CREATE POLICY "circles_select" ON public.circles
    FOR SELECT USING (
        is_open = true
        OR EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = id AND user_id = auth.uid()
        )
    );

-- Circles: INSERT
DROP POLICY IF EXISTS "circles_insert" ON public.circles;
CREATE POLICY "circles_insert" ON public.circles
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Circles: UPDATE / DELETE
DROP POLICY IF EXISTS "circles_update" ON public.circles;
DROP POLICY IF EXISTS "circles_delete" ON public.circles;
CREATE POLICY "circles_update" ON public.circles
    FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "circles_delete" ON public.circles
    FOR DELETE USING (creator_id = auth.uid());

-- Circle Members: SELECT
DROP POLICY IF EXISTS "circle_members_select" ON public.circle_members;
CREATE POLICY "circle_members_select" ON public.circle_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
        )
    );

-- Circle Members: INSERT
DROP POLICY IF EXISTS "circle_members_insert" ON public.circle_members;
CREATE POLICY "circle_members_insert" ON public.circle_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Circle Members: DELETE
DROP POLICY IF EXISTS "circle_members_delete" ON public.circle_members;
CREATE POLICY "circle_members_delete" ON public.circle_members
    FOR DELETE USING (user_id = auth.uid());

-- Circle Posts: SELECT
DROP POLICY IF EXISTS "circle_posts_select" ON public.circle_posts;
CREATE POLICY "circle_posts_select" ON public.circle_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

-- Circle Posts: INSERT
DROP POLICY IF EXISTS "circle_posts_insert" ON public.circle_posts;
CREATE POLICY "circle_posts_insert" ON public.circle_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

-- Circle Posts: DELETE
DROP POLICY IF EXISTS "circle_posts_delete" ON public.circle_posts;
CREATE POLICY "circle_posts_delete" ON public.circle_posts
    FOR DELETE USING (user_id = auth.uid());

-- Circle Reactions: SELECT (self only)
DROP POLICY IF EXISTS "circle_reactions_select" ON public.circle_reactions;
CREATE POLICY "circle_reactions_select" ON public.circle_reactions
    FOR SELECT USING (user_id = auth.uid());

-- Circle Reactions: INSERT (member of post's circle)
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

-- Circle Reactions: DELETE
DROP POLICY IF EXISTS "circle_reactions_delete" ON public.circle_reactions;
CREATE POLICY "circle_reactions_delete" ON public.circle_reactions
    FOR DELETE USING (user_id = auth.uid());

-- 2g. FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION public.generate_circle_invite_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_circle_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (NEW.id, NEW.creator_id, 'admin');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_created ON public.circles;
CREATE TRIGGER trg_circle_created
    AFTER INSERT ON public.circles
    FOR EACH ROW EXECUTE FUNCTION public.handle_circle_created();

CREATE OR REPLACE FUNCTION public.update_circle_last_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.circles SET last_activity_at = NEW.created_at
    WHERE id = NEW.circle_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_post_created ON public.circle_posts;
CREATE TRIGGER trg_circle_post_created
    AFTER INSERT ON public.circle_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_circle_last_activity();

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
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2h. SECURITY DEFINER RPCS

CREATE OR REPLACE FUNCTION public.is_circle_member(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = p_circle_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.join_circle(p_circle_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_circle_preview(p_invite_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_circle RECORD;
    v_member_count INT;
BEGIN
    SELECT id, name, intention, topic, member_limit INTO v_circle
    FROM public.circles WHERE invite_code = p_invite_code;
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
$$;

-- ============================================================================
-- SECTION 3: Circle Invites (lifecycle-managed invite codes)
-- Source: 004_circle_invites.sql (adapted to v7's circle_members)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.circle_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_invites_code ON public.circle_invites(code);
CREATE INDEX IF NOT EXISTS idx_circle_invites_circle ON public.circle_invites(circle_id);

ALTER TABLE public.circle_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "circle_invites_select" ON public.circle_invites;
CREATE POLICY "circle_invites_select" ON public.circle_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

DROP POLICY IF EXISTS "circle_invites_insert" ON public.circle_invites;
CREATE POLICY "circle_invites_insert" ON public.circle_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

DROP POLICY IF EXISTS "circle_invites_update" ON public.circle_invites;
CREATE POLICY "circle_invites_update" ON public.circle_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_id = circle_invites.circle_id
        AND user_id = auth.uid()
        AND role IN ('admin')
    )
  );

-- ============================================================================
-- SECTION 4: Circle Notifications
-- Source: 005_circle_invites_notifications.sql (adapted to v7)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.circle_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'invite_received', 'invite_accepted', 'member_joined',
    'member_left', 'role_changed', 'circle_updated', 'new_message'
  )),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_notifications_user_unread
  ON public.circle_notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circle_notifications_circle
  ON public.circle_notifications(circle_id, created_at DESC);

ALTER TABLE public.circle_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "circle_notifications_select" ON public.circle_notifications;
CREATE POLICY "circle_notifications_select" ON public.circle_notifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "circle_notifications_insert" ON public.circle_notifications;
CREATE POLICY "circle_notifications_insert" ON public.circle_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "circle_notifications_update" ON public.circle_notifications;
CREATE POLICY "circle_notifications_update" ON public.circle_notifications
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "circle_notifications_delete" ON public.circle_notifications;
CREATE POLICY "circle_notifications_delete" ON public.circle_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 5: Moderation Queue
-- Source: 004_moderation_queue.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  verdict      TEXT NOT NULL CHECK (verdict IN ('flagged', 'rejected')),
  reasons      TEXT[] NOT NULL DEFAULT '{}',
  reviewed     BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_id  UUID REFERENCES auth.users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies; admin access via service key

CREATE INDEX IF NOT EXISTS idx_moderation_queue_unreviewed
  ON public.moderation_queue (reviewed, created_at DESC)
  WHERE reviewed = FALSE;
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user
  ON public.moderation_queue (user_id, created_at DESC);

-- ============================================================================
-- SECTION 6: Storage Bucket — circle-media
-- Source: 006_circle_storage_bucket.sql
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'circle-media', 'circle-media', TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "circle_media_select_authenticated" ON storage.objects;
CREATE POLICY "circle_media_select_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'circle-media');

DROP POLICY IF EXISTS "circle_media_insert_authenticated" ON storage.objects;
CREATE POLICY "circle_media_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'circle-media');

DROP POLICY IF EXISTS "circle_media_update_own" ON storage.objects;
CREATE POLICY "circle_media_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'circle-media' AND auth.uid() = owner);

DROP POLICY IF EXISTS "circle_media_delete_own" ON storage.objects;
CREATE POLICY "circle_media_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner);

-- ============================================================================
-- END OF CONSOLIDATED CIRCLE MIGRATION
-- ============================================================================

-- MIGRATION 008 — Circle Post Comments
-- Table: circle_post_comments
-- Adds comment_count column to circle_posts
-- Trigger: auto-update comment_count on insert/delete
-- RLS: default deny, explicit grants
-- Realtime: enabled

-- ============================================================
-- CIRCLE POST COMMENTS
-- Nested replies supported via parent_id (self-referential FK)
-- ============================================================
create table if not exists public.circle_post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.circle_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.circle_post_comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for fast comment lookups
create index if not exists idx_circle_post_comments_post_id
  on public.circle_post_comments(post_id, created_at);

create index if not exists idx_circle_post_comments_parent_id
  on public.circle_post_comments(parent_id);

create index if not exists idx_circle_post_comments_user_id
  on public.circle_post_comments(user_id);

-- ============================================================
-- COMMENT COUNT column on circle_posts
-- ============================================================
alter table public.circle_posts
  add column if not exists comment_count integer not null default 0;

-- ============================================================
-- FUNCTION: increment/decrement comment_count
-- ============================================================
create or replace function public.update_circle_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.circle_posts
    set comment_count = comment_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.circle_posts
    set comment_count = greatest(0, comment_count - 1)
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- ============================================================
-- TRIGGERS on circle_post_comments
-- ============================================================
drop trigger if exists on_circle_post_comment_inserted on public.circle_post_comments;
create trigger on_circle_post_comment_inserted
  after insert on public.circle_post_comments
  for each row execute procedure public.update_circle_post_comment_count();

drop trigger if exists on_circle_post_comment_deleted on public.circle_post_comments;
create trigger on_circle_post_comment_deleted
  after delete on public.circle_post_comments
  for each row execute procedure public.update_circle_post_comment_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.circle_post_comments enable row level security;

-- Active circle members can read comments on posts in their circles
create policy "Active members can read circle post comments"
  on public.circle_post_comments for select
  using (
    exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

-- Active circle members can insert their own comments
create policy "Active members can insert comments"
  on public.circle_post_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

-- Users can update their own comments
create policy "Users can update own comments"
  on public.circle_post_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own comments (parent_id set null, cascade handles children)
create policy "Users can delete own comments"
  on public.circle_post_comments for delete
  using (auth.uid() = user_id);

-- Circle admins/creator can delete any comment on posts in their circles
create policy "Admins can delete any comment in their circle"
  on public.circle_post_comments for delete
  using (
    exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role in ('admin', 'creator')
    )
  );

-- ============================================================
-- REALTIME publication
-- ============================================================
alter publication supabase_realtime add table public.circle_post_comments;

-- ============================================================
-- TRIGGER: touch updated_at on comment update
-- ============================================================
drop trigger if exists circle_post_comments_updated_at on public.circle_post_comments;
create trigger circle_post_comments_updated_at before update on public.circle_post_comments
  for each row execute procedure public.touch_updated_at();
