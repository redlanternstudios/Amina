# The Circle — Frontend Data Wiring Guide
**For:** FRONTEND agent
**Date:** 2026-06-09
**Prerequisite:** DESIGN v0 outputs + migration 003_circle_schema.sql applied

---

## Supabase client
Use `lib/supabase/client.ts` (already exists). All queries go through the authenticated client.

---

## Screen 1: Circle Home (`app/(app)/circle/page.tsx`)

### My Circles tab
```ts
const { data: memberships } = await supabase
  .from('circle_memberships')
  .select('circle_id, circles(id, name, avatar_url, updated_at), role, status')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .order('circles(updated_at)', { ascending: false })
```

### Discover tab
```ts
const { data: publicCircles } = await supabase
  .from('circles')
  .select('*')
  .eq('is_public', true)
  .not('id', 'in', `(${userCircleIds.join(',')})`)
  .limit(20)
```

### Unread badge
Derive from `circle_messages` — store `last_read_at` per membership in `circle_memberships` or a separate read-receipts table. Unread = messages with `created_at > last_read_at` for that circle.

---

## Screen 2: Circle Chat (`app/(app)/circle/[id]/chat/page.tsx`)

### Load messages
```ts
const { data: messages } = await supabase
  .from('circle_messages')
  .select('*, profiles(id, preferred_address), circle_profiles(display_name, avatar_url)')
  .eq('circle_id', circleId)
  .order('created_at', { ascending: true })
  .limit(50)
```

### Send message
```ts
await supabase.from('circle_messages').insert({
  circle_id: circleId,
  user_id: user.id,
  content: text,
})
```

### Realtime subscription
```ts
const channel = supabase
  .channel(`circle-chat-${circleId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'circle_messages',
    filter: `circle_id=eq.${circleId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as DBCircleMessage])
  })
  .subscribe()

return () => supabase.removeChannel(channel)
```

---

## Screen 3: Circle Posts (`app/(app)/circle/[id]/posts/page.tsx`)

### Load posts
```ts
const { data: posts } = await supabase
  .from('circle_posts')
  .select('*, circle_profiles(display_name, avatar_url), circle_reactions(reaction, user_id)')
  .eq('circle_id', circleId)
  .order('created_at', { ascending: false })
  .range(page * 20, (page + 1) * 20 - 1)
```

### Toggle reaction
```ts
// Add
await supabase.from('circle_reactions').insert({ user_id, target_id: postId, target_type: 'post', reaction })
// Remove
await supabase.from('circle_reactions').delete().match({ user_id, target_id: postId, reaction })
```

---

## Screen 4: Post Composer (modal or `/app/(app)/circle/compose`)

### Submit post
```ts
// If media: upload to circle-media bucket first
const { data: upload } = await supabase.storage
  .from('circle-media')
  .upload(`circles/${circleId}/messages/${postId}/${fileName}`, file)

// Then insert post
await supabase.from('circle_posts').insert({
  circle_id: circleId,
  user_id: user.id,
  content: text,
  media_url: upload?.path ?? null,
  media_type: isVideo ? 'video' : 'image',
  tags,
})
```

---

## Screen 5: DM Inbox (`app/(app)/circle/dms/page.tsx`)

### Load conversations
```ts
const { data: convos } = await supabase
  .from('dm_conversations')
  .select(`
    id, updated_at,
    dm_participants!inner(user_id, profiles(id), circle_profiles(display_name, avatar_url)),
    dm_messages(content, created_at)
  `)
  .order('updated_at', { ascending: false })
```

Filter out self from `dm_participants` to get the other user's name/avatar.

---

## Screen 6: DM Thread (`app/(app)/circle/dms/[id]/page.tsx`)

### Load messages
```ts
const { data: messages } = await supabase
  .from('dm_messages')
  .select('*, circle_profiles(display_name, avatar_url)')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true })
  .limit(50)
```

### Send message
```ts
await supabase.from('dm_messages').insert({
  conversation_id: conversationId,
  user_id: user.id,
  content: text,
})
```

### Realtime subscription
```ts
const channel = supabase
  .channel(`dm-${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'dm_messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as DBDMMessage])
  })
  .subscribe()
```

---

## Faith Reactions Component

```tsx
const REACTIONS = [
  { key: 'ameen', label: 'Ameen' },
  { key: 'subhanallah', label: 'SubhanAllah' },
  { key: 'alhamdulillah', label: 'Alhamdulillah' },
  { key: 'mashallah', label: 'MashAllah' },
  { key: 'heart', label: '♥' },
] as const
```

Render as pill buttons. Active = Dusty Rose fill. Inactive = cream background, Soft Olive text.
No generic emoji anywhere.

---

## Review Gates (REVIEW agent checks at each PR)

- [ ] RLS active on every new table used
- [ ] No hardcoded display names
- [ ] Faith reactions only — no generic emoji
- [ ] `amina_*` naming convention (for core tables) / `circle_*` and `dm_*` for Circle tables
- [ ] Realtime channels cleaned up on unmount

---
*FRONTEND wiring guide — Day 3 | ROBBY*
