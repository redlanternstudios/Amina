-- Du'a Wall schema for community prayer posts

create table if not exists dua_wall_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_answered boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table to track "Ameen" confirmations
create table if not exists dua_ameens (
  id uuid default gen_random_uuid() primary key,
  dua_id uuid not null references dua_wall_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(dua_id, user_id)
);

-- Enable RLS
alter table dua_wall_posts enable row level security;
alter table dua_ameens enable row level security;

-- RLS policies for du'as
create policy "Users can read all du'as"
  on dua_wall_posts for select
  using (true);

create policy "Users can create du'as"
  on dua_wall_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own du'as"
  on dua_wall_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own du'as"
  on dua_wall_posts for delete
  using (auth.uid() = user_id);

-- RLS policies for ameens
create policy "Users can read ameens"
  on dua_ameens for select
  using (true);

create policy "Users can add ameen"
  on dua_ameens for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their ameen"
  on dua_ameens for delete
  using (auth.uid() = user_id);
