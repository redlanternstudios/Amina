# Circle V1 Real - UI Component Reference

## Design System

**Colors Used:**
- Primary: `#2C2926` (charcoal text)
- Secondary: `#C9796A` (rose/accent)
- Background: `#F7F2EB` (warm ivory)
- Accents: `#D7BA82` (muted gold)
- Borders: `rgba(44,41,38,0.1)` (hairline)

**Typography:**
- Headings: Display font (italic)
- Body: System font (14px, 16px)
- Labels: 12px, 13px

**Component Spacing:**
- Card padding: 16px (p-4)
- Section gap: 16px-24px (gap-4 to gap-6)
- Border radius: 16px rounded-2xl

---

## Page-by-Page UI Structure

### 1. CIRCLE HOME (`/circle`)

```
┌─────────────────────────────────┐
│ ← Circles            🔍 Browse  │
└─────────────────────────────────┘

┌─ Circles Carousel ─────────────────────┐
│  ┌──────────────┐ ┌──────────────┐     │
│  │ ◎◎◎ (accent)│ │              │     │
│  │ Sisters of   │ │ Faith Quest  │ ... │
│  │ Amina        │ │              │     │
│  │ Journey of   │ │ Seeking      │     │
│  │ faith        │ │ wisdom       │     │
│  │ Faith      4 │ │ Topics  2    │     │
│  │ 2 hrs ago    │ │ 1 week ago   │     │
│  └──────────────┘ └──────────────┘     │
└─────────────────────────────────────────┘

┌─────────────────────────────────┐
│  [+ Create a circle]            │
│  [📤 Join a circle]             │
└─────────────────────────────────┘
```

**Key Elements:**
- Header: Title + Search icon
- Carousel: Fixed 240px cards with:
  - Gold concentric arcs (top-right SVG)
  - Circle name (italic, 18px)
  - Intention (13px, 2-line truncated)
  - Topic chip (small, colored background)
  - Member count (11px, right-aligned)
  - Updated time (11px, right-aligned)
- Bottom buttons: Create (primary), Join (secondary)

---

### 2. CIRCLE BROWSE (`/circle/browse`)

```
┌─────────────────────────────────┐
│ ← Find a circle                 │
│ These circles are open to join. │
└─────────────────────────────────┘

┌─ Search Box ────────────────────┐
│ 🔍 Search circles...            │
└─────────────────────────────────┘

┌─ Topic Filters ─────────────────┐
│ [All] [Faith & W...] [Heart &...│ ──→
└─────────────────────────────────┘

┌─ Browse Results ────────────────┐
│  ┌──────────────────────────┐   │
│  │ Sisters of Amina         │   │
│  │ Journey of faith & growth│   │
│  │ [Faith & Worship]        │   │
│  │ 4 of 8 sisters | [Join]  │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Faith Quest              │   │
│  │ Seeking knowledge & wisdom│  │
│  │ [Heart & Mind]           │   │
│  │ 2 of 6 sisters | [Join]  │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**Key Elements:**
- Title + description
- Search box (copies styling from Members)
- Topic filter chips (horizontal scroll)
- Browse cards:
  - Circle name + intention
  - Topic tag
  - Capacity indicator
  - Join button
- Empty state: "No circles match your search"

---

### 3. CIRCLE INVITE PAGE (`/circle/[id]/invite`)

```
┌─────────────────────────────────┐
│ ← Sisters of Amina              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Share Your Invite               │
│                                 │
│ Your invite code:               │
│  ┌───────────────────────────┐  │
│  │      JXK9M2P              │  │
│  └───────────────────────────┘  │
│                                 │
│ [📋 Copy code] [📤 Share]      │
└─────────────────────────────────┘

┌─ Who's in this circle? ─────────┐
│                                 │
│ 👤 Amina                        │
│    Joined Jan 5, 2025           │
│                                 │
│ 👤 Fatima                       │
│    Joined Feb 1, 2025           │
│                                 │
│ 👤 Yasmin                       │
│    Joined Feb 3, 2025           │
│                                 │
│ [View all members →]            │
└─────────────────────────────────┘
```

**Key Elements:**
- Circle name in header
- Share section:
  - Invite code (large, 24px font)
  - Copy button (copies to clipboard)
  - Share button (native Web Share API)
- Member list preview:
  - Avatar (initials circle)
  - Name + join date
  - Shows up to 8 members
  - "View all" link if more

---

### 4. CIRCLE MEMBERS (`/circle/[id]/members`)

```
┌─────────────────────────────────┐
│ ← Members                4 Sisters│
└─────────────────────────────────┘

┌─ Search Box ────────────────────┐
│ 🔍 Search members...            │
└─────────────────────────────────┘

┌─ Member List ───────────────────┐
│  ┌────────────────────────────┐ │
│  │ A  │ Amina (Creator) 👑  │X│ │
│  │    │ Joined Jan 5, 2025   │ │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ F  │ Fatima              │X│ │
│  │    │ Joined Feb 1, 2025   │ │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Y  │ Yasmin              │ │ │
│  │    │ Joined Feb 3, 2025   │ │ │
│  └────────────────────────────┘ │
│                                  │
│ (Red X button only visible to    │
│  circle creator, not on creator) │
└─────────────────────────────────┘
```

**Key Elements:**
- Header: "Members" + count
- Search box with real-time filtering
- Member list:
  - Avatar (initials in circle)
  - Name + crown icon (if creator)
  - Join date
  - Remove button (red X, admin-only)
- Empty state: "No members found" (if search returns nothing)

---

### 5. CIRCLE FEED/REFLECTIONS (`/circle/[id]`)

```
┌─────────────────────────────────┐
│ ← Sisters of Amina      [Share] │
├─────────────────────────────────┤
│ [Reflections] [Chat] [Members]  │
└─────────────────────────────────┘

┌─ Composer ──────────────────────┐
│  👤  │ Share your reflection... │ │
│      │                          │😊│
│      │  ┌──────────────────┐   │  │
│      │  │ ✉️ Post         │   │  │
│      └──────────────────────────┘
└─────────────────────────────────┘

┌─ Feed ──────────────────────────┐
│  ┌────────────────────────────┐ │
│  │ 👤 Amina                   │ │
│  │    2 hours ago             │ │
│  │                            │ │
│  │ I'm grateful for this      │ │
│  │ community of sisters.      │ │
│  │                            │ │
│  │ [💚2] [🌙1] [💫0]         │ │
│  │ [💬 3 Comments]            │ │
│  │ [✏️ Edit] [🗑️ Delete]      │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 👤 Fatima                  │ │
│  │    1 day ago               │ │
│  │                            │ │
│  │ Alhamdulilah for this...   │ │
│  │                            │ │
│  │ [💚1] [🌙0] [💫0]         │ │
│  │ [💬 0 Comments]            │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

**Key Elements:**
- Tabs: Reflections (active), Chat, Members, Settings
- Composer:
  - User avatar + text input
  - Send button (paper plane)
  - Emoji picker icon
- Feed posts:
  - Author avatar + name + timestamp
  - Post content
  - Faith reactions row (💚 Ameen, 🌙 SubhanAllah, 💫 MashaAllah)
  - Comment count
  - Edit/Delete buttons (author only)

---

### 6. CIRCLE CHAT (`/circle/[id]/chat`)

```
┌─────────────────────────────────┐
│ ← Sisters of Amina      [Share] │
├─────────────────────────────────┤
│ [Reflections] [Chat] [Members]  │
└─────────────────────────────────┘

┌─ Message List ──────────────────┐
│                                 │
│ 👤 Fatima                       │
│    Hey sisters! How's everyone? │
│    2:30 PM                      │
│    [💚0] [🌙0] [💫1]           │
│                                 │
│                           You ➜ │
│          I'm doing well!        │
│          Just finished praying. │
│          2:35 PM                │
│          [💚2] [🌙0] [💫0]     │
│                                 │
│ 👤 Amina                        │
│    That's wonderful!            │
│    2:40 PM                      │
│    [💚1] [🌙1] [💫0]           │
│                                 │
└─────────────────────────────────┘

┌─ Message Composer ──────────────┐
│ | Type a message...        | ✉️ │
└─────────────────────────────────┘
```

**Key Elements:**
- Chat messages:
  - Received messages (left-aligned):
    - Avatar + name
    - Message content
    - Timestamp
    - Faith reaction buttons below
  - Sent messages (right-aligned):
    - Message content only
    - Timestamp
    - Faith reaction buttons below
- Message composer:
  - Text input with placeholder
  - Send button (paper plane)
- Real-time updates via Supabase subscriptions

---

### 7. CIRCLE SETTINGS (`/circle/[id]/settings`)

```
┌─────────────────────────────────┐
│ ← Settings                      │
└─────────────────────────────────┘

┌─ Circle Info ───────────────────┐
│ Name                            │
│ ┌─────────────────────────────┐ │
│ │ Sisters of Amina            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Intention                       │
│ ┌─────────────────────────────┐ │
│ │ Journey of faith & growth   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Topic                           │
│ [Faith & Worship]              │
│                                 │
│ Max Members                     │
│ ┌─────────────────────────────┐ │
│ │ 8                           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

┌─ Management ────────────────────┐
│ Invite Code: JXK9M2P            │
│ [📋 Copy] [🔄 Regenerate]      │
│                                 │
│ Created Jan 5, 2025             │
│ 4 Members                       │
└─────────────────────────────────┘

┌─ Danger Zone ───────────────────┐
│ [🗑️ Delete Circle]              │
│ (Confirmation required)         │
└─────────────────────────────────┘
```

**Key Elements:**
- Creator-only settings
- Editable fields: name, intention, topic, max members
- Invite code management
- Circle statistics (created date, member count)
- Delete circle button (with confirmation)

---

## Component Details

### Faith Reactions Button

```
Displays as icon row:
[💚 2] [🌙 1] [💫 0]

On tap, expands to selector:
┌─────────────────────────┐
│ 💚 Ameen                │
│ 🌙 SubhanAllah          │
│ 💫 Masha'Allah          │
│ ✨ Dua'a (Optional)     │
│ ✋ Cancel               │
└─────────────────────────┘

After selection:
- Icon highlights
- Count increments
- Button closes
```

### Avatar Component

```
Circle with initials:
┌──────────┐
│    A     │
│ (Rose bg)│
└──────────┘

Colors per user (deterministic):
- Red tones
- Rose tones
- Gold tones
- Navy tones
```

### Search Box

```
┌────────────────────────────────┐
│ 🔍 Search...                   │
└────────────────────────────────┘

Styling:
- Border: Hairline gray
- Background: Warm ivory
- Icon: 16px, left-aligned
- Input: 14px, left-padded
- Border radius: 12px (rounded-xl)
```

---

## Responsive Behavior

### Mobile (<640px)
- Carousel cards: 240px fixed width, 3-column peek
- Modal fullscreen
- Input fields: 100% width with padding
- Avatar: 40px circles

### Tablet (640px-1024px)
- Carousel cards: 280px
- Grid 2-column for browse
- Input fields: 100% width

### Desktop (>1024px)
- Carousel cards: 320px
- Grid 3-column for browse
- Input fields: max-width container
- Sidebar layouts possible

---

## Interaction States

### Button States
- **Default:** Filled or outlined
- **Hover:** Slightly darker background
- **Active/Pressed:** Color shift, slight scale down (0.98)
- **Disabled:** Opacity 0.5, no cursor interaction

### Input States
- **Focused:** Border color changes to primary
- **Error:** Red border + error message below
- **Success:** Green border + checkmark icon

### Loading States
- **Skeleton:** Animate-pulse cards (light gray)
- **Spinner:** Rotating loader icon (center)
- **Inline:** Small loading indicator next to button text

---

## Accessibility Features

- ✓ Semantic HTML (button, link, input, form)
- ✓ ARIA labels on icons
- ✓ Keyboard navigation (Tab, Enter)
- ✓ Color contrast ratios ≥4.5:1
- ✓ Screen reader support
- ✓ Focus visible indicators
- ✓ Error messages linked to inputs
- ✓ Loading states announced

---

## Animation & Transitions

### Smooth Transitions
- Carousel scroll: smooth (no jank)
- Modal open: fade in (200ms)
- Button press: scale 0.98 (100ms)
- Reaction toggle: bounce (150ms)

### Realtime Updates
- New messages: slide in from bottom (400ms)
- Reaction count: number increment animation
- Member removal: fade out + collapse (300ms)

---

## Code Usage Examples

### FaithReactions Component
```tsx
<FaithReactions
  postId="post-123"
  reactions={{
    ameen: 2,
    subhanallah: 1,
    mashallah: 0
  }}
  onReact={(type) => {/* handle */}}
  userReaction={null}
/>
```

### CircleCard Component
```tsx
<CircleCard
  circle={{
    id: '...',
    name: 'Sisters of Amina',
    intention: '...',
    member_count: 4
  }}
  onClick={() => navigate('/circle/id')}
/>
```

### CircleAvatar Component
```tsx
<CircleAvatar
  name="Amina"
  size={40}
  color="rose"
/>
```

---

## End of UI Reference

This comprehensive guide documents the complete visual structure, interaction patterns, and component details for Circle V1 Real. All pages are implemented as designed and ready for production deployment.
