-- TRACK B FIX: Chat Persistence
-- Root cause: chat UI used in-memory state only. No Supabase queries wired.
-- Schema already correct in 001_initial_schema.sql:
--   public.conversations (id, user_id, title, topic_tag, created_at, updated_at)
--   public.messages (id, conversation_id, user_id, role, content, created_at)
-- companion_conversations and amina_conversations were phantom references — not in schema.
-- Canonical tables: public.conversations + public.messages

-- ============================================================
-- AUTO-UPDATE updated_at ON CONVERSATIONS WHEN MESSAGE INSERTED
-- ============================================================
create or replace function public.touch_conversation_updated_at()
returns trigger as $$
begin
  update public.conversations
  set updated_at = now()
  where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.touch_conversation_updated_at();

-- ============================================================
-- CONVENIENCE VIEW: recent conversations with last message preview
-- ============================================================
create or replace view public.conversation_previews as
select
  c.id,
  c.user_id,
  c.title,
  c.topic_tag,
  c.updated_at,
  m.content as last_message,
  m.role as last_role
from public.conversations c
left join lateral (
  select content, role
  from public.messages
  where conversation_id = c.id
  order by created_at desc
  limit 1
) m on true;
