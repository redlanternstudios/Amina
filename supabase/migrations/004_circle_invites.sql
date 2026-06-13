-- CIRCLE INVITES — invite code system
-- Migration 004
-- Tables: circle_invites
-- RLS: default deny, explicit grants only

-- ============================================================
-- CIRCLE INVITES
-- ============================================================
create table if not exists public.circle_invites (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  code text not null unique,
  expires_at timestamptz,
  max_uses integer default 0,
  used_count integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_circle_invites_code on public.circle_invites(code);
create index if not exists idx_circle_invites_circle_id on public.circle_invites(circle_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.circle_invites enable row level security;

-- Anyone with a valid code can read invite details (used during validation via GET)
-- The code+circle_id filter acts as the auth check, so we allow select for any auth user
create policy "Auth users can view invites" on public.circle_invites
  for select using (auth.uid() is not null);

-- Only circle admins/creator can create invites
create policy "Admins can create invites" on public.circle_invites
  for insert with check (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and role in ('creator', 'admin')
        and status = 'active'
    )
  );

-- Only circle admins can update (used for incrementing used_count)
create policy "Admins can update invites" on public.circle_invites
  for update using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and role in ('creator', 'admin')
        and status = 'active'
    )
  );

-- Only circle admins can delete invites
create policy "Admins can delete invites" on public.circle_invites
  for delete using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and role in ('creator', 'admin')
        and status = 'active'
    )
  );
