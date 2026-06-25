-- MIGRATION 008 — Circle Post Comments
-- Table: circle_post_comments
-- Adds comment_count column to circle_posts
-- Trigger: auto-update comment_count on insert/delete
-- RLS: default deny, explicit grants
-- Realtime: enabled

-- ============================================================
-- CIRCLE POST COMMENTS
-- Nested replies supported via parent_id (self-referential FK)
-- ============================================================
create table if not exists public.circle_post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.circle_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.circle_post_comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for fast comment lookups
create index if not exists idx_circle_post_comments_post_id
  on public.circle_post_comments(post_id, created_at);

create index if not exists idx_circle_post_comments_parent_id
  on public.circle_post_comments(parent_id);

create index if not exists idx_circle_post_comments_user_id
  on public.circle_post_comments(user_id);

-- ============================================================
-- COMMENT COUNT column on circle_posts
-- ============================================================
alter table public.circle_posts
  add column if not exists comment_count integer not null default 0;

-- ============================================================
-- FUNCTION: increment/decrement comment_count
-- ============================================================
create or replace function public.update_circle_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.circle_posts
    set comment_count = comment_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.circle_posts
    set comment_count = greatest(0, comment_count - 1)
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- ============================================================
-- TRIGGERS on circle_post_comments
-- ============================================================
drop trigger if exists on_circle_post_comment_inserted on public.circle_post_comments;
create trigger on_circle_post_comment_inserted
  after insert on public.circle_post_comments
  for each row execute procedure public.update_circle_post_comment_count();

drop trigger if exists on_circle_post_comment_deleted on public.circle_post_comments;
create trigger on_circle_post_comment_deleted
  after delete on public.circle_post_comments
  for each row execute procedure public.update_circle_post_comment_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.circle_post_comments enable row level security;

-- Active circle members can read comments on posts in their circles
create policy "Active members can read circle post comments"
  on public.circle_post_comments for select
  using (
    exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

-- Active circle members can insert their own comments
create policy "Active members can insert comments"
  on public.circle_post_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

-- Users can update their own comments
create policy "Users can update own comments"
  on public.circle_post_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own comments (parent_id set null, cascade handles children)
create policy "Users can delete own comments"
  on public.circle_post_comments for delete
  using (auth.uid() = user_id);

-- Circle admins/creator can delete any comment on posts in their circles
create policy "Admins can delete any comment in their circle"
  on public.circle_post_comments for delete
  using (
    exists (
      select 1 from public.circle_posts p
      join public.circle_memberships m on m.circle_id = p.circle_id
      where p.id = circle_post_comments.post_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role in ('admin', 'creator')
    )
  );

-- ============================================================
-- REALTIME publication
-- ============================================================
alter publication supabase_realtime add table public.circle_post_comments;

-- ============================================================
-- TRIGGER: touch updated_at on comment update
-- ============================================================
drop trigger if exists circle_post_comments_updated_at on public.circle_post_comments;
create trigger circle_post_comments_updated_at before update on public.circle_post_comments
  for each row execute procedure public.touch_updated_at();
