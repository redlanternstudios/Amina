-- Migration: Add is_amina_post column to circle_posts
-- Enables visual distinction for Amina's auto-seeded welcome posts

ALTER TABLE public.circle_posts 
  ADD COLUMN IF NOT EXISTS is_amina_post boolean NOT NULL DEFAULT false;

-- Index for fast lookup of Amina posts
CREATE INDEX IF NOT EXISTS idx_circle_posts_amina 
  ON public.circle_posts (circle_id, is_amina_post) 
  WHERE is_amina_post = true;
