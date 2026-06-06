-- Amina database schema
-- Run in Supabase SQL editor

-- Enable RLS
create extension if not exists "uuid-ossp";

-- User profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  preferred_address text default 'Sister',
  companion_tone text default 'gentle' check (companion_tone in ('gentle', 'wise', 'encouraging')),
  user_intent text,
  reflection_cadence text default 'Daily',
  topic_preferences text[] default array['faith'],
  reminders_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Chat conversations
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Chat messages
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can manage own messages" on public.messages
  for all using (auth.uid() = user_id);

-- Reflections (saved conversations)
create table if not exists public.reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  excerpt text,
  tags text[] default array[]::text[],
  is_favorite boolean default false,
  created_at timestamptz default now()
);

alter table public.reflections enable row level security;

create policy "Users can manage own reflections" on public.reflections
  for all using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
