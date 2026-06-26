-- ============================================
-- Migration 007: Circles / Intimate Groups (Rebuild)
-- Product: Amina
-- Description: Complete rebuild of Circles as invite-only
-- intimate groups. Privacy-critical.
-- 
-- Design decisions:
-- - invite_code based (no public discovery by default)
-- - binary reactions only — counts NEVER exposed to API
-- - topic-restricted to 7 Islamic sisterhood categories
-- - member_limit with atomic CONCURRENT safety (SELECT FOR UPDATE)
-- - creator auto-added as admin
-- ============================================

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
-- Counts are NEVER exposed to any API response.
CREATE TABLE IF NOT EXISTS public.circle_reactions (
    post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id_created_at ON public.circle_posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circles_invite_code ON public.circles(invite_code);
CREATE INDEX IF NOT EXISTS idx_circles_is_open ON public.circles(is_open) WHERE is_open = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;

-- CIRCLES: SELECT
-- Members see circles they belong to. Open circles are visible to all.
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

-- CIRCLES: INSERT
DROP POLICY IF EXISTS "circles_insert" ON public.circles;
CREATE POLICY "circles_insert" ON public.circles
    FOR INSERT
    WITH CHECK (creator_id = auth.uid());

-- CIRCLES: UPDATE / DELETE
DROP POLICY IF EXISTS "circles_update" ON public.circles;
DROP POLICY IF EXISTS "circles_delete" ON public.circles;
CREATE POLICY "circles_update" ON public.circles
    FOR UPDATE
    USING (creator_id = auth.uid());
CREATE POLICY "circles_delete" ON public.circles
    FOR DELETE
    USING (creator_id = auth.uid());

-- CIRCLE MEMBERS: SELECT
DROP POLICY IF EXISTS "circle_members_select" ON public.circle_members;
CREATE POLICY "circle_members_select" ON public.circle_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()
        )
    );

-- CIRCLE MEMBERS: INSERT
DROP POLICY IF EXISTS "circle_members_insert" ON public.circle_members;
CREATE POLICY "circle_members_insert" ON public.circle_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- CIRCLE MEMBERS: DELETE
DROP POLICY IF EXISTS "circle_members_delete" ON public.circle_members;
CREATE POLICY "circle_members_delete" ON public.circle_members
    FOR DELETE
    USING (user_id = auth.uid());

-- CIRCLE POSTS: SELECT
DROP POLICY IF EXISTS "circle_posts_select" ON public.circle_posts;
CREATE POLICY "circle_posts_select" ON public.circle_posts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

-- CIRCLE POSTS: INSERT
DROP POLICY IF EXISTS "circle_posts_insert" ON public.circle_posts;
CREATE POLICY "circle_posts_insert" ON public.circle_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circle_members
            WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
        )
    );

-- CIRCLE POSTS: DELETE
DROP POLICY IF EXISTS "circle_posts_delete" ON public.circle_posts;
CREATE POLICY "circle_posts_delete" ON public.circle_posts
    FOR DELETE
    USING (user_id = auth.uid());

-- CIRCLE REACTIONS: SELECT (self only)
DROP POLICY IF EXISTS "circle_reactions_select" ON public.circle_reactions;
CREATE POLICY "circle_reactions_select" ON public.circle_reactions
    FOR SELECT
    USING (user_id = auth.uid());

-- CIRCLE REACTIONS: INSERT
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

-- CIRCLE REACTIONS: DELETE
DROP POLICY IF EXISTS "circle_reactions_delete" ON public.circle_reactions;
CREATE POLICY "circle_reactions_delete" ON public.circle_reactions
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- HELPER: GENERATE INVITE CODE
-- ============================================
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

-- ============================================
-- TRIGGER: AUTO-ADD CREATOR AS ADMIN
-- ============================================
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

-- ============================================
-- last_activity_at ON circles (for last-activity ordering)
-- ============================================
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

-- ============================================
-- is_circle_member — SECURITY DEFINER RPC for route-level checks
-- Called by API routes to verify membership before allowing operations
-- ============================================
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

-- ============================================
-- join_circle — atomic join with SELECT FOR UPDATE
-- Prevents overshoot under concurrent requests
-- ============================================
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
    -- Check if already member
    SELECT EXISTS(
        SELECT 1 FROM public.circle_members 
        WHERE circle_id = p_circle_id AND user_id = p_user_id
    ) INTO v_existing;
    
    IF v_existing THEN
        RETURN jsonb_build_object('error', 'Already a member', 'status', 409);
    END IF;
    
    -- Lock the circle row and get limit
    SELECT member_limit INTO v_member_limit 
    FROM public.circles WHERE id = p_circle_id 
    FOR UPDATE;
    
    -- Count current members
    SELECT COUNT(*) INTO v_member_count
    FROM public.circle_members WHERE circle_id = p_circle_id;
    
    -- Check limit
    IF v_member_count >= v_member_limit THEN
        RETURN jsonb_build_object('error', 'Circle is full', 'status', 403);
    END IF;
    
    -- Insert member
    INSERT INTO public.circle_members (circle_id, user_id, role)
    VALUES (p_circle_id, p_user_id, 'member');
    
    RETURN jsonb_build_object('status', 200, 'circle_id', p_circle_id);
END;
$$;

-- ============================================
-- get_circle_preview — SECURITY DEFINER bypass for unauthenticated preview
-- Invite-only circles are NOT visible via RLS to unauthenticated users.
-- This function allows invite-code-based lookup without auth session.
-- Returns ONLY: name, intention, topic, member_count, member_limit
-- NEVER returns: posts, member identities, reaction data
-- ============================================
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
