-- Migration 006: Create circle-media storage bucket
-- Requires: Storage extension enabled
-- Run this in Supabase SQL editor after migrations 001-005

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'circle-media',
  'circle-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can read any media
CREATE POLICY "circle_media_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'circle-media');

-- RLS: Authenticated users can insert media
CREATE POLICY "circle_media_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'circle-media');

-- RLS: Only owner can update their media
CREATE POLICY "circle_media_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'circle-media' AND auth.uid() = owner);

-- RLS: Only owner can delete their media
CREATE POLICY "circle_media_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'circle-media' AND auth.uid() = owner);
