-- Comments on circle posts
CREATE TABLE IF NOT EXISTS public.circle_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.circle_posts(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circle_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES public.circle_post_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_circle_post_comments_post_id ON public.circle_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_circle_post_comments_parent ON public.circle_post_comments(parent_comment_id);

-- RLS
ALTER TABLE public.circle_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active members can read comments"
  ON public.circle_post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_post_comments.circle_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Active members can post comments"
  ON public.circle_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.circle_group_members
      WHERE circle_id = circle_post_comments.circle_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can soft-delete own comments"
  ON public.circle_post_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Add comment_count to circle_posts for feed display
ALTER TABLE public.circle_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to increment/decrement comment_count on circle_posts
CREATE OR REPLACE FUNCTION update_circle_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_circle_post_comment_count ON public.circle_post_comments;
CREATE TRIGGER trg_circle_post_comment_count
AFTER INSERT OR DELETE ON public.circle_post_comments
FOR EACH ROW EXECUTE FUNCTION update_circle_post_comment_count();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.circle_post_comments;
