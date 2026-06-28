# AMINA - BUTTON & INTERACTIVE ELEMENT REFERENCE

**Quick lookup for every button, link, and interactive element**

---

## LANDING PAGE (/)

| Button/Element | Location | Text | Action | Destination |
|----------------|----------|------|--------|-------------|
| Logo | Header left | "Amina" | Scroll to top | #about |
| Link | Header nav | "About" | Scroll | #about |
| Link | Header nav | "How It Works" | Scroll | #how |
| Link | Header nav | "Access" | Scroll | #access |
| Sign In Button | Header right | "Sign In" | Navigate | `/auth` |
| Get Started CTA | Header right | "Get Started →" | Navigate | `/welcome` |
| Primary CTA | Hero section | "Access Amina →" | Navigate | `/welcome` |
| Secondary Link | Hero section | "Learn More" | Scroll | #how |
| Sign In Link | Hero section | "Sign in" | Navigate | `/auth` |
| Primary CTA | Access section | "Create your account →" | Navigate | `/welcome` |
| Sign In Link | Access section | "Sign in" | Navigate | `/auth` |
| Policy Link | Footer | "Privacy Policy" | Navigate | `/privacy` |
| Policy Link | Footer | "Terms of Use" | Navigate | `/terms` |
| Footer Link | Footer | "About" | Scroll | #about |
| Footer Link | Footer | "Access Amina" | Navigate | `/welcome` |

---

## WELCOME/ONBOARDING (/welcome)

| Element | Type | Action | Effect |
|---------|------|--------|--------|
| Skip button | top-right | Click | → `/auth` |
| Dot [0] | pagination | Click | Jump to slide 1 |
| Dot [1] | pagination | Click | Jump to slide 2 |
| Dot [2] | pagination | Click | Jump to slide 3 |
| Dot [3] | pagination | Click | Jump to slide 4 |
| Continue button | primary CTA | Click | → Next slide |
| Get Started button | primary CTA (slide 4) | Click | → `/auth` |
| Sign In link | secondary | Click | → `/auth` |

**Slide Count:** 4 slides, can navigate via dots or continue button

---

## AUTH PAGE (/auth)

| Element | Type | Action | Effect |
|---------|------|--------|--------|
| Email input | form field | Type | Update state |
| Password input | form field | Type | Update state |
| Sign In button | primary CTA | Click | POST /api/auth/login |
| Create Account link | secondary | Click | Toggle form visibility |
| Create an Account button | primary CTA | Click | → `/welcome` |
| Terms link | footer | Click | → `/terms` |
| Privacy link | footer | Click | → `/privacy` |

**State Toggle:** Two modes - sign in form or account options

---

## HOME PAGE (/home) ⚠️ BROKEN BOTTOM NAV

| Element | Location | Type | Action | Destination |
|---------|----------|------|--------|-------------|
| Hamburger ☰ | top-left | button | Toggle menu | Sidebar |
| Notification 🔔 | top-right | button | Open notifications | Notifications |
| Reflect chip | hero | chip | Start chat | `/chat/[uuid]?q=...` |
| Guidance chip | hero | chip | Start chat | `/chat/[uuid]?q=...` |
| Learn chip | hero | chip | Start chat | `/chat/[uuid]?q=...` |
| Grow chip | hero | chip | Start chat | `/chat/[uuid]?q=...` |
| Message input | Amina card | textarea | Type message | Update state |
| Send button ↑ | Amina card | button | Send message | Create chat |
| Attachment button 📎 | toolbar | button | Pick file | File picker |
| Microphone button 🎤 | toolbar | button | Record audio | Audio recorder |
| Sparkle button ✨ | toolbar | button | AI assist | AI options |
| View all → | Journey | link | Navigate | `/chat` |
| Conversation card | carousel | button | Open chat | `/chat/[id]` |
| View all → | Reflection | link | Navigate | `/reflections` |
| ❤️ Reflect on this | daily reflection | button | Trigger action | Reflect modal |
| Home 🏠 | bottom nav | tab | Navigate | `/home` [BROKEN] |
| Circle 🕌 | bottom nav | tab | Navigate | `/circle` [BROKEN] |
| Guidance 📖 | bottom nav | tab | Navigate | `/guidance` [BROKEN] |
| Du'a 📿 | bottom nav | tab | Navigate | `/dua-wall` [BROKEN] |
| Reflections 💭 | bottom nav | tab | Navigate | `/reflections` [BROKEN] |
| Profile 👤 | bottom nav | tab | Navigate | `/profile` [BROKEN] |

**Quick Chips Preset Messages:**
- Reflect: "Help me reflect on something today."
- Guidance: "I need some guidance today."
- Learn: "Help me learn something about my faith."
- Grow: "Help me grow spiritually."

---

## CIRCLES PAGE (/circle)

| Element | Location | Type | Action | Destination |
|---------|----------|------|--------|-------------|
| Search button 🔍 | header right | button | Navigate | `/circle/browse` |
| Circle card | carousel | button | Open circle | `/circle/[id]` [BROKEN] |
| Create a circle | action row | button | Navigate | `/circle/create` |
| Join with a code 🔑 | action row | button | Navigate | `/circle/join` |

**Empty State CTAs:**
- "Create a circle" button → `/circle/create`
- "Join with a code" button → `/circle/join`

---

## CIRCLE DETAIL (/circle/[id]) 🔴 BROKEN - JOIN LOOP

| Element | Type | Action | Effect |
|---------|------|--------|--------|
| Post content | display | (read-only) | Shows post |
| Ameen button 🤲 | reaction | Click | POST /api/circles/[id]/reactions |
| Reply button 💬 | reply | Click | → `/circle/[id]/posts/[postId]` |
| Share button | share | Click | Show ShareCard modal |
| More options ... | menu | Click | Post menu |
| Textarea | composer | Type | Update postText state |
| Send button ↑ | composer | Click | POST /api/circles/[id]/posts |

**Status:** ❌ After joining, shows "You are not a member of this circle" error

---

## DU'A WALL (/dua-wall)

| Element | Type | Action | Effect |
|---------|------|--------|--------|
| Make du'a button 🤲 | header right | button | Show sheet modal |
| Load more | pagination | button | Fetch next 20 duas |
| Ameen button 🤲 | reaction | click | POST /api/dua-wall/[id]/ameen |
| Ameen button 🤲 | reaction | click (active) | DELETE /api/dua-wall/[id]/ameen |
| Mark as answered | action | click | PATCH /api/dua-wall/[id]/fulfilled |
| Sheet submit button | modal | click | POST /api/dua-wall |
| Sheet close button ✕ | modal | click | Hide sheet |
| Sheet overlay | modal | click | Hide sheet |
| Textarea | modal | Type | Update newDuaContent state |

**Character Limit:** 280 characters for du'a text

---

## REFLECTIONS (/reflections)

| Element | Type | Action | Effect |
|---------|------|--------|--------|
| All chip | filter | click | Show all reflections |
| Favorites chip | filter | click | Show only favorites |
| Search input | search | Type | Filter by title (client-side) |
| Add button + | header right | click | Show sheet modal |
| Heart button ❤️ | reflection | click | PATCH reflections.favorited |
| Heart button ❤️ | reflection | click (active) | Toggle favorite off |
| Sheet submit button | modal | click | INSERT reflection |
| Sheet close button ✕ | modal | click | Hide sheet |
| Sheet overlay | modal | click | Hide sheet |
| Title input | modal form | Type | Update newTitle (100 chars) |
| Summary textarea | modal form | Type | Update newSummary (500 chars) |
| Tag input | modal form | Type | Update newTag (20 chars) |

**Filters:** All / Favorites

---

## INTERACTIVE PATTERNS

### Sheet Modal Pattern
```
Click button → Show overlay
  └─ Show bottom sheet (animates up)
    ├─ Fill form fields
    ├─ Click submit → API call
    │  └─ Success: Close sheet + update list
    │  └─ Error: Show error message
    └─ Close button (✕) or click overlay → Hide sheet
```

### Reaction Pattern (Ameen)
```
Click Ameen button
  ├─ Optimistic update: UI changes immediately
  ├─ POST/DELETE to API
  │  ├─ Success: Keep UI change
  │  └─ Error: Rollback to previous state
  └─ User sees count + highlight toggle
```

### Pagination Pattern (Du'a Wall)
```
Scroll to bottom of feed
  └─ "Load more" button appears (if more items)
    └─ Click
      ├─ Fetch next 20 items (offset-based)
      ├─ Append to existing list
      └─ Remove "Load more" if at end
```

### Filter + Search Pattern (Reflections)
```
Click filter chip (All or Favorites)
  └─ Update activeFilter state
    └─ Re-filter local array
      └─ Display matching items

Type in search box
  └─ Update search state
    └─ Re-filter by title match (case-insensitive)
      └─ Update displayed items
```

---

## API CALL MAPPING

### Button → API Call Reference

| Button | API Method | Endpoint | Data |
|--------|-----------|----------|------|
| Sign In | POST | `/api/auth/login` | { email, password } |
| Ameen (add) | POST | `/api/dua-wall/[id]/ameen` | {} |
| Ameen (remove) | DELETE | `/api/dua-wall/[id]/ameen` | {} |
| Mark answered | PATCH | `/api/dua-wall/[id]/fulfilled` | {} |
| Submit du'a | POST | `/api/dua-wall` | { content } |
| Post to circle | POST | `/api/circles/[id]/posts` | { content, is_anonymous } |
| Post reaction | POST | `/api/circles/[id]/reactions` | { reaction, post_id } |
| Save reflection | INSERT | `reflections` table | { title, summary, tag } |
| Toggle favorite | PATCH | `reflections` table | { favorited } |

---

## NAVIGATION QUICK MAP

```
/                (Public - Landing)
  ├→ /welcome    (Public - Onboarding)
  ├→ /auth       (Public - Sign In)
  └→ /home       (Protected - Dashboard)
     ├→ /chat/[id]           (Protected - Chat)
     ├→ /circle              (Protected - Circles List)
     │  ├→ /circle/[id]      (Protected - Circle Detail) [BROKEN]
     │  ├→ /circle/create    (Protected - Create)
     │  ├→ /circle/join      (Protected - Join)
     │  └→ /circle/browse    (Protected - Browse)
     ├→ /dua-wall            (Protected - Du'a Wall)
     ├→ /reflections         (Protected - Reflections)
     ├→ /guidance            (Protected - Guidance)
     └→ /profile             (Protected - Profile)
```

---

## KEYBOARD SHORTCUTS

| Key | Page | Action |
|-----|------|--------|
| Enter | Auth form | Submit sign in |
| Enter | Circle detail | Submit post (without Shift) |
| Enter | Du'a sheet | Submit du'a (if Enter key not bound) |
| Shift+Enter | Circle detail | New line in textarea |
| Shift+Enter | Du'a sheet | New line in textarea |
| Tab | Any | Navigate to next focusable element |
| Esc | Modal | Close modal (click-outside only) |

---

