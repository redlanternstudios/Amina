-- THE CIRCLE — P0 Schema
-- Migration 003
-- Tables: circles, circle_memberships, circle_messages, circle_posts, circle_reactions,
--         dm_conversations, dm_participants, dm_messages, circle_profiles
-- RLS: default deny, explicit grants only
-- Realtime: circle_messages, dm_messages, circle_memberships, circle_reactions

-- ============================================================
-- CIRCLES
-- ============================================================
create table if not exists public.circles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  avatar_url text,
  is_public boolean default true,
  creator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CIRCLE MEMBERSHIPS
-- ============================================================
create table if not exists public.circle_memberships (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'admin', 'creator')),
  status text default 'active' check (status in ('active', 'pending', 'banned')),
  joined_at timestamptz default now(),
  unique (circle_id, user_id)
);

-- ============================================================
-- CIRCLE MESSAGES (group chat)
-- ============================================================
create table if not exists public.circle_messages (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'video', null)),
  created_at timestamptz default now()
);

-- ============================================================
-- CIRCLE POSTS (post feed)
-- ============================================================
create table if not exists public.circle_posts (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video', null)),
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CIRCLE REACTIONS (faith reactions on messages + posts)
-- ============================================================
create table if not exists public.circle_reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid not null, -- references circle_messages.id or circle_posts.id
  target_type text not null check (target_type in ('message', 'post', 'dm_message')),
  reaction text not null check (reaction in ('ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart')),
  created_at timestamptz default now(),
  unique (user_id, target_id, reaction)
);

-- ============================================================
-- DM CONVERSATIONS
-- ============================================================
create table if not exists public.dm_conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- DM PARTICIPANTS
-- ============================================================
create table if not exists public.dm_participants (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.dm_conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (conversation_id, user_id)
);

-- ============================================================
-- DM MESSAGES
-- ============================================================
create table if not exists public.dm_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.dm_conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'video', null)),
  created_at timestamptz default now()
);

-- ============================================================
-- CIRCLE PROFILES (public profile in Circle context)
-- ============================================================
create table if not exists public.circle_profiles (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  display_name text,
  bio text,
  location text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — enable on all tables
-- ============================================================
alter table public.circles enable row level security;
alter table public.circle_memberships enable row level security;
alter table public.circle_messages enable row level security;
alter table public.circle_posts enable row level security;
alter table public.circle_reactions enable row level security;
alter table public.dm_conversations enable row level security;
alter table public.dm_participants enable row level security;
alter table public.dm_messages enable row level security;
alter table public.circle_profiles enable row level security;

-- CIRCLES
create policy "Any auth user can view public circles" on public.circles
  for select using (is_public = true or auth.uid() = creator_id);

create policy "Any auth user can create a circle" on public.circles
  for insert with check (auth.uid() is not null);

create policy "Creator or admin can update circle" on public.circles
  for update using (
    auth.uid() = creator_id or
    exists (
      select 1 from public.circle_memberships
      where circle_id = id and user_id = auth.uid() and role in ('creator', 'admin')
    )
  );

-- CIRCLE MEMBERSHIPS
create policy "Members can view memberships of their circles" on public.circle_memberships
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.circle_memberships m2
      where m2.circle_id = circle_id and m2.user_id = auth.uid() and m2.status = 'active'
    )
  );

create policy "Any auth user can request to join" on public.circle_memberships
  for insert with check (auth.uid() = user_id);

create policy "Admins can update memberships" on public.circle_memberships
  for update using (
    exists (
      select 1 from public.circle_memberships m2
      where m2.circle_id = circle_id and m2.user_id = auth.uid() and m2.role in ('creator', 'admin')
    )
  );

-- CIRCLE MESSAGES
create policy "Active members can read circle messages" on public.circle_messages
  for select using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_messages.circle_id
        and user_id = auth.uid()
        and status = 'active'
    )
  );

create policy "Active members can insert circle messages" on public.circle_messages
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_messages.circle_id
        and user_id = auth.uid()
        and status = 'active'
    )
  );

-- CIRCLE POSTS
create policy "Active members can read circle posts" on public.circle_posts
  for select using (
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_posts.circle_id
        and user_id = auth.uid()
        and status = 'active'
    )
  );

create policy "Active members can create posts" on public.circle_posts
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.circle_memberships
      where circle_id = circle_posts.circle_id
        and user_id = auth.uid()
        and status = 'active'
    )
  );

-- CIRCLE REACTIONS
create policy "Members can view reactions" on public.circle_reactions
  for select using (auth.uid() is not null);

create policy "Users can insert own reactions" on public.circle_reactions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own reactions" on public.circle_reactions
  for delete using (auth.uid() = user_id);

-- DM CONVERSATIONS
create policy "Participants can view DM conversations" on public.dm_conversations
  for select using (
    exists (
      select 1 from public.dm_participants
      where conversation_id = dm_conversations.id and user_id = auth.uid()
    )
  );

create policy "Auth users can create DM conversations" on public.dm_conversations
  for insert with check (auth.uid() is not null);

-- DM PARTICIPANTS
create policy "Participants can view DM participants" on public.dm_participants
  for select using (
    exists (
      select 1 from public.dm_participants p2
      where p2.conversation_id = conversation_id and p2.user_id = auth.uid()
    )
  );

create policy "Auth users can insert DM participants" on public.dm_participants
  for insert with check (auth.uid() is not null);

-- DM MESSAGES
create policy "Participants can read DM messages" on public.dm_messages
  for select using (
    exists (
      select 1 from public.dm_participants
      where conversation_id = dm_messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "Participants can send DM messages" on public.dm_messages
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.dm_participants
      where conversation_id = dm_messages.conversation_id and user_id = auth.uid()
    )
  );

-- CIRCLE PROFILES
create policy "Any auth user can view circle profiles" on public.circle_profiles
  for select using (auth.uid() is not null);

create policy "Users can update own circle profile" on public.circle_profiles
  for all using (auth.uid() = user_id);

-- ============================================================
-- REALTIME — enable publication
-- ============================================================
alter publication supabase_realtime add table public.circle_messages;
alter publication supabase_realtime add table public.dm_messages;
alter publication supabase_realtime add table public.circle_memberships;
alter publication supabase_realtime add table public.circle_reactions;

-- ============================================================
-- STORAGE BUCKET: circle-media
-- Create in Supabase dashboard or via CLI:
-- supabase storage create circle-media --public false
-- Then set policies:
--   avatars/{user_id}/*  → owner read/write
--   circles/{circle_id}/messages/*  → circle members read, active members write
--   dms/{conversation_id}/*  → conversation participants only
-- Max sizes enforced client-side: images ≤10MB, videos ≤50MB/60s
-- File types: jpg, png, webp, heic, mp4, mov
-- ============================================================

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger circles_updated_at before update on public.circles
  for each row execute procedure public.touch_updated_at();

create trigger dm_conversations_updated_at before update on public.dm_conversations
  for each row execute procedure public.touch_updated_at();

create trigger circle_posts_updated_at before update on public.circle_posts
  for each row execute procedure public.touch_updated_at();

create trigger circle_profiles_updated_at before update on public.circle_profiles
  for each row execute procedure public.touch_updated_at();

-- Touch dm_conversations.updated_at when a new message arrives
create or replace function public.touch_dm_conversation_on_message()
returns trigger as $$
begin
  update public.dm_conversations set updated_at = now() where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_dm_message_inserted after insert on public.dm_messages
  for each row execute procedure public.touch_dm_conversation_on_message();
