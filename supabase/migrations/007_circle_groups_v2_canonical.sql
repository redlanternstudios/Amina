-- THE CIRCLE — V2 Canonical Schema
-- Migration 007
-- Consolidates circle_groups, circle_group_members, circle_posts, circle_reactions
-- as the canonical circle implementation with complete RLS policies
-- RLS: default deny, explicit grants only

-- ============================================================
-- CIRCLE GROUPS (V2 canonical)
-- ============================================================
create table if not exists public.circle_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  intention text, -- one sentence about the circle's purpose
  topic_tag text default 'Faith & Belief' check (topic_tag in (
    'Faith & Belief', 'Mental Health', 'Prayer & Worship', 'Family & Relationships',
    'Parenting', 'Career & Education', 'Hobbies & Interests'
  )),
  invite_code text unique not null, -- 8 char alphanumeric, can be regenerated
  is_open boolean default true, -- can new members join?
  max_members integer default 50,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CIRCLE GROUP MEMBERS
-- ============================================================
create table if not exists public.circle_group_members (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circle_groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  display_handle text default 'Sister', -- user's chosen name in this circle
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz default now(),
  unique (circle_id, user_id)
);

-- ============================================================
-- CIRCLE POSTS (feed)
-- ============================================================
create table if not exists public.circle_posts (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circle_groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  content_text text not null,
  is_anonymous boolean default true,
  content_status text default 'approved' check (content_status in ('approved', 'reviewing', 'flagged')),
  is_amina_post boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CIRCLE REACTIONS
-- ============================================================
create table if not exists public.circle_reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid not null, -- could be post_id or message_id
  target_type text check (target_type in ('post', 'message')),
  reaction text check (reaction in ('ameen', 'subhanallah', 'alhamdulillah', 'mashallah', 'heart')),
  created_at timestamptz default now(),
  unique (user_id, target_id, reaction) -- one of each reaction per user per target
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- circle_groups: members can view, creators can modify
alter table public.circle_groups enable row level security;

create policy "circle_groups_view" on public.circle_groups
  for select
  using (
    is_open = true
    or created_by = auth.uid()
    or exists (
      select 1 from public.circle_group_members
      where circle_group_members.circle_id = circle_groups.id
      and circle_group_members.user_id = auth.uid()
    )
  );

create policy "circle_groups_create" on public.circle_groups
  for insert
  with check (auth.uid() is not null);

create policy "circle_groups_update" on public.circle_groups
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "circle_groups_delete" on public.circle_groups
  for delete
  using (created_by = auth.uid());

-- circle_group_members: members can view their own, read other members in shared circle
alter table public.circle_group_members enable row level security;

create policy "circle_group_members_view" on public.circle_group_members
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.circle_group_members cgm2
      where cgm2.circle_id = circle_group_members.circle_id
      and cgm2.user_id = auth.uid()
    )
  );

create policy "circle_group_members_insert" on public.circle_group_members
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.circle_groups
      where circle_groups.id = circle_id
      and (is_open = true or created_by = auth.uid())
    )
  );

create policy "circle_group_members_update_self" on public.circle_group_members
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "circle_group_members_delete" on public.circle_group_members
  for delete
  using (user_id = auth.uid());

-- circle_posts: members can view posts in their circles, insert their own, delete their own
alter table public.circle_posts enable row level security;

create policy "circle_posts_view" on public.circle_posts
  for select
  using (
    exists (
      select 1 from public.circle_group_members
      where circle_group_members.circle_id = circle_posts.circle_id
      and circle_group_members.user_id = auth.uid()
    )
  );

create policy "circle_posts_insert" on public.circle_posts
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.circle_group_members
      where circle_group_members.circle_id = circle_id
      and circle_group_members.user_id = auth.uid()
    )
  );

create policy "circle_posts_update_own" on public.circle_posts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "circle_posts_delete_own" on public.circle_posts
  for delete
  using (user_id = auth.uid());

-- circle_reactions: users can only see/manage their own reactions
alter table public.circle_reactions enable row level security;

create policy "circle_reactions_view" on public.circle_reactions
  for select
  using (user_id = auth.uid());

create policy "circle_reactions_insert" on public.circle_reactions
  for insert
  with check (user_id = auth.uid());

create policy "circle_reactions_delete" on public.circle_reactions
  for delete
  using (user_id = auth.uid());

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
create index idx_circle_groups_created_by on public.circle_groups(created_by);
create index idx_circle_groups_created_at on public.circle_groups(created_at);
create index idx_circle_group_members_circle_id on public.circle_group_members(circle_id);
create index idx_circle_group_members_user_id on public.circle_group_members(user_id);
create index idx_circle_posts_circle_id on public.circle_posts(circle_id);
create index idx_circle_posts_user_id on public.circle_posts(user_id);
create index idx_circle_posts_created_at on public.circle_posts(created_at);
create index idx_circle_reactions_user_id on public.circle_reactions(user_id);
create index idx_circle_reactions_target on public.circle_reactions(target_id, target_type);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
alter publication supabase_realtime add table public.circle_posts;
alter publication supabase_realtime add table public.circle_reactions;
alter publication supabase_realtime add table public.circle_group_members;
