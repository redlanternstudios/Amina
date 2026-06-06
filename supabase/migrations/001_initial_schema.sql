-- Amina - Initial Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USER PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  preferred_address text default 'Sister',
  intent text, -- 'guidance' | 'faith' | 'reflect' | 'support' | 'other'
  companion_tone text default 'gentle', -- 'gentle' | 'wise' | 'encouraging'
  reflection_cadence text default 'daily', -- 'daily' | 'weekly' | 'few_times'
  topic_preferences text[] default array[]::text[],
  reminders_enabled boolean default true,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  topic_tag text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- REFLECTIONS (saved conversations)
-- ============================================================
create table if not exists public.reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  summary text,
  tag text,
  favorited boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reflections enable row level security;

-- Profiles: users can only read/write their own
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Conversations: scoped to user
create policy "Users can view own conversations" on public.conversations
  for select using (auth.uid() = user_id);
create policy "Users can create own conversations" on public.conversations
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own conversations" on public.conversations
  for delete using (auth.uid() = user_id);

-- Messages: scoped to user
create policy "Users can view own messages" on public.messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.messages
  for insert with check (auth.uid() = user_id);

-- Reflections: scoped to user
create policy "Users can view own reflections" on public.reflections
  for select using (auth.uid() = user_id);
create policy "Users can manage own reflections" on public.reflections
  for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
