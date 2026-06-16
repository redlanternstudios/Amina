-- Migration: 004_moderation_queue
-- Purpose: Store flagged/rejected images from Sightengine for human review.
-- Fail-open policy: images are never silently deleted. They sit here until reviewed.

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

-- RLS: only service role can read/write (admin dashboard only, not user-facing)
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- No user-facing access to moderation data
-- Admin access via service key only (no RLS policy needed for service_role)

-- Index for review queue queries
CREATE INDEX idx_moderation_queue_unreviewed
  ON public.moderation_queue (reviewed, created_at DESC)
  WHERE reviewed = false;

CREATE INDEX idx_moderation_queue_user
  ON public.moderation_queue (user_id, created_at DESC);
