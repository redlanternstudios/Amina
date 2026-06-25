-- ============================================================
-- MIGRATION 005 — Circle Soft Delete
-- Adds deleted_at column to circles table and updates RLS
-- ============================================================

-- Add deleted_at column for soft-delete support
alter table public.circles
  add column if not exists deleted_at timestamptz;

-- Update RLS: exclude soft-deleted circles from select
drop policy if exists "Any auth user can view public circles" on public.circles;
create policy "Any auth user can view public circles" on public.circles
  for select using (
    deleted_at is null
    and (is_public = true or auth.uid() = creator_id)
  );

-- Allow admins to view circles for management purposes (e.g., restore)
create policy "Admins can view deleted circles" on public.circles
  for select using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = id and user_id = auth.uid() and role in ('creator', 'admin')
    )
  );

-- Update the circles updated_at trigger to not fire on deleted_at changes only
-- (the existing trigger handles all updates, which is fine — deleted_at will still get set)
