-- Migration 005: Circle Invites & Notifications
-- Adds: deleted_at on circles, circle_invites table, circle_notifications table

-- ============================================================
-- SOFT DELETE for circles
-- ============================================================
alter table public.circles add column if not exists deleted_at timestamptz;

-- ============================================================
-- CIRCLE INVITES (shareable invite codes)
-- ============================================================
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
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

create policy "Admins can create invite codes" on public.circle_invites
  for insert with check (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

create policy "Admins can update invite codes" on public.circle_invites
  for update using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_invites.circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'creator')
    )
  );

-- ============================================================
-- CIRCLE NOTIFICATIONS
-- ============================================================
create table if not exists public.circle_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  circle_id uuid references public.circles(id) on delete cascade,
  type text not null check (type in (
    'invite_received',
    'invite_accepted',
    'member_joined',
    'member_left',
    'role_changed',
    'circle_updated',
    'new_message'
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

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_notifications;
