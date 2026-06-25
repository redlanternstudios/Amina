-- Migration: circle_groups RLS + policy enforcement
-- This table already exists in the live DB. This migration adds the missing policies.

-- Enable RLS (idempotent)
ALTER TABLE public.circle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present (idempotent re-run safety)
DROP POLICY IF EXISTS "members can view their circles" ON public.circle_groups;
DROP POLICY IF EXISTS "members can view circle members" ON public.circle_group_members;
DROP POLICY IF EXISTS "members can view posts" ON public.circle_posts;
DROP POLICY IF EXISTS "members can create posts" ON public.circle_posts;
DROP POLICY IF EXISTS "authors can delete own posts" ON public.circle_posts;
DROP POLICY IF EXISTS "members can view reactions" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can react" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can remove own reaction" ON public.circle_reactions;
DROP POLICY IF EXISTS "members can view comments" ON public.circle_comments;
DROP POLICY IF EXISTS "members can comment" ON public.circle_comments;
DROP POLICY IF EXISTS "members can delete own comments" ON public.circle_comments;
DROP POLICY IF EXISTS "members can view messages" ON public.circle_messages;
DROP POLICY IF EXISTS "members can send messages" ON public.circle_messages;

-- circle_groups: visible to members only (plus creator, plus public circles)
CREATE POLICY "members can view their circles"
  ON public.circle_groups FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated users can create circles"
  ON public.circle_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "admin can update circle"
  ON public.circle_groups FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin can delete circle"
  ON public.circle_groups FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- circle_group_members: members see all members of their circles
CREATE POLICY "members can view circle members"
  ON public.circle_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members AS cgm2
      WHERE cgm2.circle_id = circle_group_members.circle_id
        AND cgm2.user_id = auth.uid()
    )
  );

CREATE POLICY "users can join circles"
  ON public.circle_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin can remove members"
  ON public.circle_group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members AS cgm2
      WHERE cgm2.circle_id = circle_group_members.circle_id
        AND cgm2.user_id = auth.uid()
        AND cgm2.role = 'admin'
    )
  );

-- circle_posts: members only
CREATE POLICY "members can view posts"
  ON public.circle_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can create posts"
  ON public.circle_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authors can delete own posts"
  ON public.circle_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_posts.circle_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- circle_reactions
CREATE POLICY "members can view reactions"
  ON public.circle_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_posts cp
      JOIN public.circle_group_members cgm ON cgm.circle_id = cp.circle_id
      WHERE cp.id = circle_reactions.target_id
        AND cgm.user_id = auth.uid()
    )
  );

CREATE POLICY "members can react"
  ON public.circle_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members can remove own reaction"
  ON public.circle_reactions FOR DELETE
  USING (user_id = auth.uid());

-- circle_comments
CREATE POLICY "members can view comments"
  ON public.circle_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_comments.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can comment"
  ON public.circle_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_comments.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "authors can delete own comments"
  ON public.circle_comments FOR DELETE
  USING (author_id = auth.uid());

-- circle_messages
CREATE POLICY "members can view messages"
  ON public.circle_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members can send messages"
  ON public.circle_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()
    )
  );
