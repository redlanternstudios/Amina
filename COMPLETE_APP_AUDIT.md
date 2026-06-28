# AMINA - COMPLETE APPLICATION AUDIT
**Comprehensive Page-by-Page, Feature-by-Feature, Button-by-Button Analysis**

**Generated:** June 28, 2025  
**Framework:** Next.js 16 + React 19  
**UI:** Custom Tailwind CSS (v4) + Lucide React Icons  
**Database:** Supabase PostgreSQL  
**Auth:** Email + Password + JWT  

---

## TABLE OF CONTENTS

1. [UI Framework & Design System](#ui-framework)
2. [Public/Marketing Pages](#public-pages)
3. [Authentication Flow](#auth-flow)
4. [Authenticated App Pages](#authenticated-pages)
5. [Components Architecture](#components)
6. [Hooks & State Management](#hooks)
7. [API Integration](#api-integration)
8. [Navigation Flow](#navigation)

---

## UI FRAMEWORK & DESIGN SYSTEM {#ui-framework}

### Framework & Libraries
- **React:** v18+ (latest)
- **Next.js:** v16 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React v0.344.0
- **AI Integration:** AI SDK @ai-sdk/react v3.0.210
- **Theme:** Custom CSS variables (Amina brand)
- **Components:** Custom-built (NOT shadcn/ui)

### Design Tokens (CSS Custom Properties)
```
--amina-primary-action: Rose/Terracotta (#C9796A)
--amina-soft-charcoal: Text color (#2C2926)
--amina-warm-ivory: Light cards (#F2ECE4)
--amina-soft-cream: Page background (#F7F2EB)
--amina-muted-gold: Accents (#D7BA82)
--amina-rose-selected: Highlight (#C9796A20)
--amina-warm-highlight: Feature bg (gold tint)
--amina-hairline: Border color (0.5px opacity)
--amina-border: Subtle borders (var(--amina-hairline))
```

### Color Palette
- **Primary:** Rose/Terracotta (#C9796A)
- **Text:** Charcoal (#2C2926)
- **Backgrounds:** Cream (#F7F2EB), Ivory (#F2ECE4)
- **Accents:** Gold (#D7BA82), Olive (#8E9878)
- **Topic Colors:** 7 custom palette for circle tags

### Typography
- **Display Font:** Custom font-display (italic style for headings)
- **Body Font:** font-sans
- **Sizes:** text-xs through text-6xl (Tailwind standard)
- **Font Family:** System fonts (no custom web fonts loaded)

### UI Components Used
- **Cards:** .card class (custom, not shadcn)
- **Buttons:** .btn-primary, .btn-secondary, .chip classes
- **Inputs:** Native HTML with Tailwind styling
- **Layout:** Flexbox (primary), CSS Grid (secondary)
- **Rounded Corners:** 16px (rounded-2xl), 24px (rounded-3xl) standard

---

## PUBLIC/MARKETING PAGES {#public-pages}

### PAGE 1: Landing Page (/)
**File:** `app/(marketing)/page.tsx`  
**Route:** `/`  
**Access:** Public (no auth required)  
**Status:** ✓ Working

#### Layout Structure
```
Header (Navigation)
  ├─ Left: Logo "Amina" + tagline
  ├─ Center: Nav links (About, How it Works, Access)
  └─ Right: Sign In + Get Started buttons

Hero Section (Large grid 2-col)
  ├─ Left column:
  │  ├─ Badge: "Meet Amina"
  │  ├─ H1: "You're not meant to navigate this journey alone."
  │  ├─ 3 Feature bullets
  │  ├─ CTA buttons: "Access Amina" + "Learn More"
  │  └─ Secondary link: "Already have account? Sign in"
  └─ Right column:
     ├─ Hero image (woman + lantern + mountains)
     └─ Quote card (absolute positioned bottom-right)

How It Supports You Section
  ├─ Title: "How Amina Supports You"
  ├─ 4-column grid:
  │  ├─ New Muslim Guidance
  │  ├─ Daily Reflections
  │  ├─ Faith Q&A
  │  └─ Sisterly Support

Access Gate Section (2-col grid)
  ├─ Left: Arch pattern image
  └─ Right: 
     ├─ Badge: "Member Access"
     ├─ H2: "Access Amina"
     ├─ Description
     └─ CTA: "Create your account"

Disclaimer Section
  ├─ Icon: 🛡️
  └─ Trust disclaimer text

Footer
  ├─ Left: Logo + tagline + mission
  └─ Right: Quick links + Legal
```

#### Buttons & Interactive Elements
| Button | Position | Action | Destination |
|--------|----------|--------|-------------|
| Sign In | Top-right | Navigate | `/auth` |
| Get Started → | Top-right | Navigate | `/welcome` |
| Access Amina → | Hero | Navigate | `/welcome` |
| Learn More | Hero | Scroll to | #how section |
| Sign in | Hero bottom | Navigate | `/auth` |
| Create your account → | Access section | Navigate | `/welcome` |
| Sign in | Access section | Navigate | `/auth` |
| About | Header (md+) | Scroll to | #about |
| How It Works | Header (md+) | Scroll to | #how |
| Access | Header (md+) | Scroll to | #access |

#### Hooks Used
- None (static page, no state)
- **Navigation:** Next.js `Link` component

#### API Calls
- None (public marketing page)

#### UI Template
- **Custom design** (built specifically for Amina)
- Responsive grid layouts
- Scroll-based sections
- Absolute positioning for accents

---

### PAGE 2: Welcome/Onboarding (Welcome)
**File:** `app/(auth)/welcome/page.tsx`  
**Route:** `/welcome`  
**Access:** Public (pre-auth)  
**Status:** ✓ Working

#### Layout Structure
```
Skip Button (top-right)
  └─ "Skip" → navigate to /auth

Icon + Title Section (center)
  ├─ AminaIcon (large, 56px)
  ├─ Main title
  ├─ Accent title (rose color)
  └─ Subtitle

Feature Card
  ├─ 3-4 feature items with icons
  ├─ Icon: Lucide icon in circle
  ├─ Label: Feature name
  └─ Description

Dot Pagination
  ├─ 4 dots (one per slide)
  ├─ Active dot: wider (16px)
  └─ Inactive dot: small (8px)
  └─ Clickable to jump to slide

CTA Button
  ├─ "Continue" → Next slide
  ├─ "Get Started" (on last slide) → /auth

Secondary link
  └─ "Already have account? Sign in" → /auth
```

#### Slide Content (4 slides)
**Slide 1: Welcome to Amina**
- Features: Faith Centered, Reflect & Grow, Private & Safe

**Slide 2: Your companion for every moment**
- Features: AI Companion, Guidance Library, The Circle

**Slide 3: Built with love & intention**
- Features: Faith-First Design, Sisters Only, Always Growing

**Slide 4: Ready to begin your journey?**
- Features: Start a Conversation, Daily Reflection, Saved Reflections

#### Buttons & Interactive Elements
| Element | Action | Destination |
|---------|--------|-------------|
| Skip | Navigate | `/auth` |
| Dot [0-3] | Change slide | Slide 0-3 |
| Continue button | Next slide | Slide N+1 |
| Get Started (slide 4) | Navigate | `/auth` |
| Sign In link | Navigate | `/auth` |

#### Hooks Used
- `useState` - Current slide index
- `useRouter` - Navigation
- **State:** `current` (slide number)

#### Component Imports
- `AminaIcon` - Brand icon component
- Lucide icons: ArrowRight, Heart, Leaf, Lock, etc. (20+ icons)

---

### PAGE 3: Auth/Sign In (/)
**File:** `app/(auth)/auth/page.tsx`  
**Route:** `/auth`  
**Access:** Public (pre-auth)  
**Status:** ✓ Working

#### Layout Structure
```
Suspense boundary
  └─ AuthContent component

Flex column layout
  ├─ Hero section (flex-1, centered)
  │  ├─ AminaWordmark (xl size, gradient tone, with signature)
  │  ├─ Divider (leaf icon + horizontal lines)
  │  ├─ Subtitle: "Faith centered reflection for women"
  │  └─ Lantern glow motif
  │     ├─ Rounded container (ivory bg)
  │     └─ Circular highlight with AminaIcon

CTA Stack (flex-col, bottom)
  ├─ SignInForm component (conditional)
  ├─ Account links (conditional)
  ├─ Terms & Legal
  └─ Footer: "by RedLantern Studios™"
```

#### Two Modes (toggled state)
**Mode 1: Sign In Form**
- SignInForm component shown
- "New to Amina? Create an account" link

**Mode 2: Account Options**
- "Continue" button → toggles to form
- "Create an Account" → navigate to /welcome
- Terms/Privacy links

#### Buttons & Interactive Elements
| Element | Action | Effect |
|---------|--------|--------|
| New to Amina link | Toggle state | Show form |
| Create an Account | Toggle state | Hide form |
| Sign In button | From form | Navigate to /home |
| Terms of Use | Open | Navigate to /terms |
| Privacy Policy | Open | Navigate to /privacy |

#### Hooks Used
- `useState` - Form visibility toggle
- `useRouter` - Navigation
- `useSearchParams` - Get redirect URL
- `Suspense` - Wrap for dynamic content

#### Child Components
- `SignInForm` - Handles email/password authentication
- `AminaWordmark` - Brand wordmark
- `AminaIcon` - Circular icon

#### Redirect Parameter
- URL param: `?redirect=/home` (defaults to /home)
- Used after successful authentication

---

## AUTHENTICATION FLOW {#auth-flow}

### SignInForm Component
**File:** `components/auth/SignInForm.tsx`

#### Form Fields
| Field | Type | Validation |
|-------|------|-----------|
| Email | input | Required, valid email format |
| Password | input | Required, 6+ chars |

#### Buttons
- **Sign In** - Submit form
- **Sign Up** - Toggle to signup mode
- **Forgot Password** - Navigate to recovery

#### Flow
1. User enters email + password
2. Click "Sign In"
3. API call to authenticate
4. If success: redirect to `/home`
5. If error: show error message

---

## AUTHENTICATED APP PAGES {#authenticated-pages}

**All protected with `(app)` route group - requires authentication**

---

### PAGE 4: HOME (/home)
**File:** `app/(app)/home/page.tsx`  
**Route:** `/home`  
**Access:** Authenticated only  
**Status:** ⚠️ Partially Working (StreakCounter issue, bottom nav unresponsive)

#### Layout Structure
```
Header (sticky, top)
  ├─ Left: Hamburger button (menu icon ☰)
  ├─ Center: "Amina" (italic, display font)
  └─ Right: Notification bell (🔔) + red dot

Hero Section (Arch video + greeting)
  ├─ Video container (arch animation)
  ├─ Background: ivory rounded-3xl
  ├─ Greeting: "Assalamu alaykum, Sister"
  ├─ Subtitle: "How can I support you today?"
  └─ Quick chips (4)
     ├─ Reflect
     ├─ Guidance
     ├─ Learn
     └─ Grow

Streak Counter
  ├─ Component: StreakCounter (wired to API)
  └─ Shows current streak data

Amina Chat Card
  ├─ Header: "Amina" + subtitle
  ├─ Opening message
  ├─ Input field with placeholder
  ├─ Send button (↑ arrow)
  └─ Toolbar buttons: 📎 🎤 ✨

Continue Your Journey (horizontal scroll)
  ├─ "Continue Your Journey" header
  ├─ "View all →" link
  ├─ 3 recent conversation cards
  │  ├─ Color-coded circle icon
  │  ├─ Title
  │  ├─ Time label
  │  └─ Progress bar

Daily Reflection Section
  ├─ "Daily Reflection" header
  ├─ "View all →" link
  ├─ Reflection card:
  │  ├─ Icon (📚)
  │  ├─ Badge: "Today's Reflection"
  │  ├─ Quote
  │  ├─ Reference
  │  └─ "❤️ Reflect on this" button

BottomNav Component (NOT RESPONSIVE - BROKEN)
```

#### Quick Chips (4 preset options)
| Chip | Icon | Message |
|------|------|---------|
| Reflect | ❤️ | "Help me reflect on something today." |
| Guidance | 🌙 | "I need some guidance today." |
| Learn | 📖 | "Help me learn something about my faith." |
| Grow | 🌿 | "Help me grow spiritually." |

**Action:** Each chip → new chat with pre-populated message

#### Recent Conversations (mocked data, 3 items)
```javascript
{
  id: '1',
  title: 'Finding Peace in Uncertainty',
  time: 'Today',
  color: '#C9796A',
  progress: 70
}
```

#### Buttons & Interactive Elements
| Element | Position | Action | Destination |
|---------|----------|--------|-------------|
| Hamburger | Top-left | Toggle menu | Sidebar |
| Bell | Top-right | Open notifications | Notifications |
| Chip (4x) | Hero | Start chat | `/chat/[uuid]` |
| Input + Send | Chat card | Send message | Creates new chat |
| Attachment btn | Toolbar | Attach file | File picker |
| Microphone btn | Toolbar | Record audio | Audio recorder |
| Sparkle btn | Toolbar | AI assist | AI options |
| View all → | Journey | Navigate | `/chat` (all chats) |
| Conversation card | Journey | Open chat | `/chat/[id]` |
| View all → | Daily | Navigate | `/reflections` |
| ❤️ Reflect | Reflection | Trigger action | Reflect modal |

#### Hooks Used
- `useState` - Message input state
- `useRouter` - Navigation
- `useSession` - Get auth token for StreakCounter
- **State variables:**
  - `message` - Chat input text
  - Session token → passed to StreakCounter

#### API Calls
- **StreakCounter component:**
  - `GET /api/streak` - Fetch user's streak data
  - Requires: `accessToken` (from session)

#### Components Used
- `StreakCounter` - Custom component showing streak
- `BottomNav` - Bottom navigation (BROKEN)

#### UI Notes
- Video source: `/videos/amina-arch.mp4` (decorative arch animation)
- Fallback: gradient div if video unavailable
- Responsive: Full-width on mobile, structured grid on desktop

---

### PAGE 5: CHAT (/chat)
**File:** `app/(app)/chat/page.tsx`  
**Route:** `/chat`  
**Access:** Authenticated only  
**Status:** ✓ Working (not yet audited - streaming chat with AI)

#### Known Features
- Lists all user conversations
- Integrates with AI SDK for streaming responses
- Uses Supabase for message storage
- Real-time message updates

---

### PAGE 6: CIRCLES OVERVIEW (/circle)
**File:** `app/(app)/circle/page.tsx`  
**Route:** `/circle`  
**Access:** Authenticated only  
**Status:** ✓ Partially Working (join loop issue)

#### Layout Structure
```
AppHeader
  ├─ Title: "The Circle"
  └─ Right: Search button

Main Content (flex-1, scrollable)
  ├─ Section title: "The Circle"
  ├─ Subtitle: "Your circles of sisterhood"
  
  ├─ Circles display (conditional):
  │  
  │  IF loading:
  │  └─ 4 skeleton loaders (animated, staggered)
  │  
  │  ELSE IF circles.length === 0:
  │  └─ EmptyState component:
  │     ├─ Circle icon (C in rose)
  │     ├─ Title: "You haven't joined a circle yet"
  │     ├─ CTA: "Create a circle"
  │     └─ CTA: "Join with a code"
  │  
  │  ELSE:
  │  ├─ Horizontal scroll carousel (6 cards)
  │  │  └─ CircleCard (each)
  │  │     ├─ Name (italic)
  │  │     ├─ Intention
  │  │     ├─ Topic tag (colored chip)
  │  │     ├─ Time ago
  │  │     ├─ Member count
  │  │     └─ Decorative arcs (SVG)
  │  │
  │  └─ Action buttons (full-width row):
  │     ├─ Create a circle (Plus icon)
  │     └─ Join with a code (Key icon)

BottomNav
```

#### Circle Card Details
**Data structure:**
```javascript
{
  id: string,
  name: string,
  intention: string,
  topic_tag: string,
  member_count: number,
  max_members: number,
  updated_at: string (ISO date)
}
```

**Visual elements:**
- Top border: 2px solid gold
- SVG concentric circles (accent, top-right)
- Colored topic chip
- Time calculation: "Active 5m ago", "Active 2h ago", etc.

#### Topic Colors (7 predefined)
```javascript
'Faith & Worship': '#D6AAA3'
'Marriage & Family': '#C4B5A0'
'Mental Health': '#A8B89A'
'Sisterhood': '#D6AAA3'
'Quran Study': '#C4B5A0'
'Life Transitions': '#B8A99A'
'New Muslims': '#A8B89A'
```

#### Buttons & Interactive Elements
| Element | Action | Destination |
|---------|--------|-------------|
| Search button | Navigate | `/circle/browse` |
| Create a circle | Navigate | `/circle/create` |
| Join with a code | Navigate | `/circle/join` |
| CircleCard | Click | `/circle/[id]` |

#### Hooks Used
- `useEffect` - Fetch circles on mount
- `useState` - circles, loading states
- `useRouter` - Navigation
- **State:**
  - `circles: Circle[]`
  - `loading: boolean`

#### API Calls
- `GET /api/circles` - Fetch user's circles
- Called on mount, no parameters

#### Empty State Conditions
1. **Loading:** Show 4 skeleton cards with animation
2. **No circles:** Show EmptyState with CTAs
3. **Has circles:** Show carousel + action buttons

---

### PAGE 7: CIRCLE DETAIL (/circle/[id])
**File:** `app/(app)/circle/[id]/page.tsx`  
**Route:** `/circle/[id]`  
**Access:** Authenticated + member of circle  
**Status:** ✗ BROKEN (Join loop - "Not a member" error even after joining)

#### Layout Structure
```
Pinned Intention Bar
  ├─ Background: gold tint (15% opacity)
  ├─ Left border: 3px gold
  ├─ Badge: "OUR INTENTION"
  └─ Circle intention text (italic)

Feed (flex-1, scrollable)
  ├─ IF loading:
  │  └─ Spinner (circular, animated)
  │
  ├─ ELSE IF notMember:
  │  └─ Error state:
  │     ├─ "You are not a member of this circle."
  │     └─ "Join a circle" button
  │
  ├─ ELSE IF !circle:
  │  └─ Not found state:
  │     ├─ "Circle not found."
  │     └─ "Back to circles" button
  │
  ├─ ELSE IF posts.length === 0:
  │  └─ Empty state:
  │     ├─ "Be the first to share, sister."
  │     └─ "This circle is waiting for its first words."
  │
  └─ ELSE:
     └─ PostBubble components (vertical stack, gap-3)
        ├─ Multiple posts
        └─ Auto-scroll on load

Composer (sticky bottom)
  ├─ Textarea: "Share with the sisters..."
  ├─ Send button (arrow up)
  └─ Border: top divider

Reference: bottomRef (for scroll-to-bottom)
```

#### Post Structure (PostBubble Component)
```javascript
{
  id: string,
  content: string,
  is_anonymous: boolean,
  display_handle: string,
  is_mine: boolean,
  created_at: string,
  reactions?: Array<{ reaction: string, user_id: string }>,
  is_amina_post?: boolean,
  user_id?: string
}
```

**Visual:**
- Avatar circle with initial
- Display handle name
- "✦ Amina" badge if Amina post
- Time label (relative: "5m ago", "2h ago")
- Post content (whitespace preserved)
- Reactions row (FaithReactions component)
- Reply button
- Share button
- More options (...)

#### Buttons & Interactive Elements
| Element | Action | Effect |
|---------|--------|--------|
| Post content (textarea) | Type | Update `postText` state |
| Send button | Click/Enter | POST to API, add to feed, clear input |
| Ameen button | Click | POST/DELETE toggle reaction |
| Reply button | Click | Navigate to `/circle/[id]/posts/[postId]` |
| Share button | Click | Show ShareCard modal |
| More options (...) | Click | Post options menu |

#### Hooks Used
- `useEffect` - Fetch circle on mount, auto-scroll
- `useState` - postText, sending, circle, posts, etc.
- `useRef` - bottomRef for scroll
- `useParams` - Get circle ID from URL
- `useRouter` - Navigation
- `useCallback` - Memoize authHeaders function

#### API Calls
- `GET /api/circles/[id]`
  - Gets: circle data, posts, member count
  - Headers: Authorization (Bearer token)
  - Returns: `{ circle, posts, member_count }`
  - **BUG:** Returns 403 "Not a member" even after joining

- `POST /api/circles/[id]/posts`
  - Creates new post
  - Body: `{ content, is_anonymous }`
  - Returns: `{ post }`

#### Token Extraction
```javascript
function getTokenFromCookie(): string {
  const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
  if (!match) return ''
  const blob = JSON.parse(decodeURIComponent(match[1]))
  return blob?.access_token ?? ''
}
```

#### Known Issues
1. **Join Loop:** After POST /api/circles/join succeeds, GET /api/circles/[id] returns 403
2. **Debug logging added:** Console logs to track flow
3. **Membership check failing:** Even though row exists in DB

---

### PAGE 8: DU'A WALL (/dua-wall)
**File:** `app/(app)/dua-wall/page.tsx`  
**Route:** `/dua-wall`  
**Access:** Authenticated only  
**Status:** ✓ Working

#### Layout Structure
```
AppHeader
  ├─ Title: "Du'a Wall"
  └─ Right: Make du'a button (🤲)

Feed (flex-1, scrollable)
  ├─ Weekly du'a from Amina (pinned)
  │  ├─ Badge: "✦ From Amina"
  │  ├─ Du'a text (italic)
  │  └─ Quranic reference
  │
  ├─ IF loading:
  │  └─ CircleDetailSkeleton
  │
  ├─ ELSE IF duas.length === 0:
  │  └─ Empty state:
  │     ├─ Icon: 🤲
  │     ├─ "No du'as yet"
  │     ├─ Description
  │     └─ "Make the first Du'a" button
  │
  └─ ELSE:
     └─ Du'a articles (vertical stack)
        ├─ Multiple duas
        ├─ "Load more" button (if hasMore)
        └─ Pagination support

Sheet Modal (overlay, bottom)
  ├─ IF showSheet:
  │  ├─ Title: "Make a Du'a"
  │  ├─ Subtitle: "Your du'a will be shared anonymously"
  │  ├─ Textarea: placeholder "Ya Allah..."
  │  ├─ Char count: "0/280"
  │  └─ Submit button: "Share Du'a 🤲"
  └─ X close button
```

#### Du'a Data Structure
```javascript
{
  id: string,
  content: string,
  is_answered: boolean,
  ameen_count: number,
  user_has_ameened: boolean,
  created_at: string
}
```

#### Buttons & Interactive Elements
| Element | Action | Effect |
|---------|--------|--------|
| Make du'a button | Click | Show sheet |
| Ameen button | Click | Toggle ameen (optimistic update) |
| Mark as answered | Click | PATCH request, update UI |
| Load more | Click | Fetch next page (20 duas) |
| Submit button | Click | POST new du'a |
| X close | Click | Hide sheet |
| Overlay | Click | Hide sheet |

#### Hooks Used
- `useEffect` - Load duas on mount, handle outside clicks
- `useState` - duas array, currentUserId, loading, showSheet, etc.
- `useRef` - sheetRef for click-outside handling
- `useMemo` - Prevent fresh Supabase client recreation

#### API Calls
- `GET /api/dua-wall`
  - Query params: `limit=20&offset=0`
  - Returns: `{ posts: [...] }`
  - Pagination: offset-based

- `POST /api/dua-wall`
  - Body: `{ content }`
  - Returns: `{ post }`

- `POST /api/dua-wall/[id]/ameen`
  - Creates ameen reaction

- `DELETE /api/dua-wall/[id]/ameen`
  - Removes ameen reaction

- `PATCH /api/dua-wall/[id]/fulfilled`
  - Marks du'a as answered

#### UI Features
- **Optimistic updates** - Ameen count updates before server response
- **Pagination** - Offset-based, 20 items per page
- **Click-outside handling** - Closes sheet on outside click
- **Char count** - Max 280 chars for du'a
- **Anonymity** - Du'as shared anonymously

---

### PAGE 9: REFLECTIONS (/reflections)
**File:** `app/(app)/reflections/page.tsx`  
**Route:** `/reflections`  
**Access:** Authenticated only  
**Status:** ✓ Working

#### Layout Structure
```
AppHeader
  ├─ Title: "Reflections"
  └─ Right: Add button (+)

Filter Chips (horizontal scroll)
  ├─ "All" → shows all
  └─ "Favorites" → shows favorited only

Search Bar
  ├─ Icon: 🔍
  └─ Input: "Search your reflections..."

List (flex-1, scrollable)
  ├─ IF loading:
  │  └─ 3 bouncing dots (animated)
  │
  ├─ ELSE IF filtered.length === 0:
  │  └─ Empty state:
  │     ├─ Icon: 📔
  │     ├─ "No reflections yet" or "No favorites yet"
  │     ├─ Description
  │     └─ "Add Reflection" button (if All filter)
  │
  └─ ELSE:
     └─ Reflection cards (vertical stack)
        ├─ Multiple items
        ├─ Title
        ├─ Summary (if exists)
        ├─ Tag chip (if exists)
        ├─ Time label
        └─ Heart button (favorited state)

Sheet Modal (overlay, bottom)
  ├─ Title: "New Reflection"
  ├─ 3 form fields:
  │  ├─ Title input (100 char max)
  │  ├─ Summary textarea (500 char max)
  │  └─ Tag input (20 char max)
  ├─ Submit button: "Save Reflection"
  └─ X close button
```

#### Reflection Data Structure
```javascript
{
  id: string,
  title: string,
  summary: string | null,
  tag: string | null,
  favorited: boolean,
  created_at: string
}
```

#### Filter Logic
```javascript
const filtered = reflections.filter(r => {
  if (search && !r.title.toLowerCase().includes(search.toLowerCase())) 
    return false
  if (activeFilter === 'Favorites') 
    return r.favorited
  return true
})
```

#### Buttons & Interactive Elements
| Element | Action | Effect |
|---------|--------|--------|
| All chip | Click | Show all reflections |
| Favorites chip | Click | Show only favorites |
| Search input | Type | Filter by title match |
| Add button (+) | Click | Show sheet |
| Heart button | Click | Toggle favorite status |
| Save button | Click | POST new reflection |
| X close | Click | Hide sheet |
| Overlay | Click | Hide sheet |

#### Hooks Used
- `useEffect` - Load reflections on mount, handle outside clicks
- `useState` - activeFilter, search, showSheet, form fields
- `useRef` - sheetRef for click-outside handling
- `useRouter` - Navigation
- **State variables:**
  - `reflections: Reflection[]`
  - `activeFilter: 'All' | 'Favorites'`
  - `search: string`
  - `showSheet: boolean`
  - `newTitle, newSummary, newTag: string`

#### API Calls
- `GET from table 'reflections'`
  - Supabase client direct query
  - Ordered by `created_at DESC`

- `PATCH to 'reflections'`
  - Updates `favorited` boolean

- `INSERT to 'reflections'`
  - Creates new reflection with fields

#### Time Formatting
```javascript
function timeLabel(dateStr: string): string {
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', ...)
}
```

#### Supabase Integration
- Direct client library usage (not REST API)
- Real-time updates (if subscribed)
- Search filtering done client-side (not DB)

---

## COMPONENTS ARCHITECTURE {#components}

### Location: `/components`

#### Brand Components
- **AminaIcon** - Circular icon (logo)
- **AminaWordmark** - "Amina" text logo with options
- **Amina3DCharacter** - 3D character component

#### App Components
- **AppHeader** - Reusable header with title + right slot
- **AppSidebar** - Sidebar menu component
- **BottomNav** - Bottom navigation (BROKEN - unresponsive)
- **ThemeProvider** - Theme context wrapper
- **ThemeToggle** - Light/dark mode toggle
- **ChromeContext** - Browser chrome context

#### Circle Components
- **CircleCard** - Card component for circle (used in carousel)
- **CircleList** - List of circles
- **CreateCircleForm** - Form to create new circle
- **FaithReactions** - Reactions system (Ameen)
- **InviteMembersModal** - Modal to invite members
- **JoinCircleModal** - Modal to join circle
- **ShareCard** - Share button + options
- **AminaSystemPostCard** - Special card for Amina posts
- **CircleAvatar** - Circle avatar display
- **CircleDetailSkeleton** - Loading skeleton

#### Auth Components
- **SignInForm** - Email/password form

#### Other Components
- **StreakCounter** - Displays user's streak (wired to API)
- **TinyAminaBubble** - Small Amina bubble
- **AminaBubble** - Large Amina chat bubble
- **MosqueCard** - Card for mosque/location
- **PaywallModal** - Paywall/upgrade modal
- **OnboardingShell** - Wrapper for onboarding pages
- **Spinner** - Loading spinner

### Component Usage Patterns
- **Props:** Typed with interface/type
- **Styling:** Tailwind classes + inline styles for CSS vars
- **Icons:** Lucide React imported as needed
- **State:** When needed (useState)
- **Effects:** When data fetching needed (useEffect)

---

## HOOKS & STATE MANAGEMENT {#hooks}

### Custom Hooks (in `/hooks`)
- `useSession` - Get current user session
- Other hooks (need to audit)

### React Hooks Used
| Hook | Pages/Components | Usage |
|------|------------------|-------|
| `useState` | Most pages | Local state management |
| `useEffect` | Data-fetching pages | Fetch on mount, subscriptions |
| `useRef` | Modals, scrollable | Element references, scroll-to-bottom |
| `useRouter` | All authenticated | Navigation |
| `useParams` | Dynamic routes | Get URL params |
| `useSearchParams` | Auth page | Get query params |
| `useCallback` | Circle detail | Memoize function |
| `useMemo` | Du'a wall | Prevent recreations |
| `Suspense` | Auth page | Async boundaries |

### State Management Pattern
- **Local state:** useState for component state
- **Navigation state:** useRouter for routing
- **URL state:** useSearchParams/useParams for routing
- **Session state:** useSession custom hook
- **Database state:** Fetched via API, stored in component state

### No Global State Management
- ❌ No Redux
- ❌ No Context API (except theme)
- ❌ No Zustand
- ✓ Component-level state only

---

## API INTEGRATION {#api-integration}

### Authentication
**Token extraction pattern:**
```javascript
function getTokenFromCookie(): string {
  const match = document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)
  const blob = JSON.parse(decodeURIComponent(match[1]))
  return blob?.access_token ?? ''
}
```

**Header construction:**
```javascript
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}
```

### API Endpoints Used
| Method | Endpoint | Used By | Purpose |
|--------|----------|---------|---------|
| GET | `/api/circles` | Circle page | List user's circles |
| GET | `/api/circles/[id]` | Circle detail | Get circle + posts |
| POST | `/api/circles/join` | Join page | Join by invite code |
| GET | `/api/circles/preview` | Join page | Preview circle before joining |
| POST | `/api/circles/[id]/posts` | Circle detail | Create post |
| GET | `/api/dua-wall` | Du'a wall | List duas (paginated) |
| POST | `/api/dua-wall` | Du'a wall | Create du'a |
| POST | `/api/dua-wall/[id]/ameen` | Du'a wall | Add ameen reaction |
| DELETE | `/api/dua-wall/[id]/ameen` | Du'a wall | Remove ameen reaction |
| PATCH | `/api/dua-wall/[id]/fulfilled` | Du'a wall | Mark as answered |
| GET | `/api/streak` | Home page | Get user's streak |

### Database (Supabase)
**Direct queries:**
- Reflections page uses Supabase client directly
- Other pages use REST API

**Tables accessed:**
- `circle_groups` - Circle metadata
- `circle_group_members` - Membership
- `circle_posts` - Posts
- `dua_wall_posts` - Du'as
- `reflections` - User reflections
- `users` - User profiles

---

## NAVIGATION FLOW {#navigation}

### Navigation Map

```
PUBLIC ROUTES:
  / (landing page)
  ├─ Sign In → /auth
  └─ Get Started → /welcome
  
  /welcome (onboarding carousel)
  ├─ Skip → /auth
  ├─ Get Started → /auth
  └─ Continue → next slide

  /auth (sign in)
  ├─ Create account → /welcome
  └─ Sign In (success) → /home

AUTHENTICATED ROUTES:
  /home (dashboard)
  ├─ Quick chip → /chat/[uuid]
  ├─ Conversation card → /chat/[id]
  ├─ View all → /chat
  ├─ Hamburger → Sidebar
  └─ BottomNav → Circle/Reflections/etc

  /circle (circles list)
  ├─ Create a circle → /circle/create
  ├─ Join with code → /circle/join
  ├─ Circle card → /circle/[id]
  └─ Search → /circle/browse

  /circle/[id] (circle detail - BROKEN)
  ├─ Reply → /circle/[id]/posts/[postId]
  └─ Join message → /circle/join

  /dua-wall (prayer wall)
  ├─ Load more → (paginate)
  └─ Make du'a → (modal)

  /reflections (reflections list)
  ├─ View all → (pagination)
  └─ Add reflection → (modal)

  /chat (conversation list)
  ├─ Conversation → /chat/[id]
  └─ New chat → /chat/[uuid]

  /profile (user account)
  └─ Settings → (modals)
```

### Bottom Navigation Tabs
**File:** `components/BottomNav.tsx`

**Tabs:**
- 🏠 Home → `/home`
- 🕌 Circle → `/circle`
- 📖 Guidance → `/guidance`
- 📿 Du'a → `/dua-wall`
- 💭 Reflections → `/reflections`
- 👤 Profile → `/profile`

**Status:** ❌ BROKEN - Not responsive/clickable on home page

---

## SUMMARY TABLE

| Page | Route | Auth | Status | Known Issues |
|------|-------|------|--------|--------------|
| Landing | `/` | No | ✓ | None |
| Onboarding | `/welcome` | No | ✓ | None |
| Sign In | `/auth` | No | ✓ | None |
| Home | `/home` | Yes | ⚠️ | Bottom nav unresponsive |
| Circles | `/circle` | Yes | ✓ | None |
| Circle Detail | `/circle/[id]` | Yes | ✗ | Join loop - "Not a member" |
| Du'a Wall | `/dua-wall` | Yes | ✓ | None |
| Reflections | `/reflections` | Yes | ✓ | None |
| Chat | `/chat` | Yes | ✓ | None |
| Profile | `/profile` | Yes | ? | Not audited |

---

## TEMPLATE & DESIGN NOTES

### UI Framework
- **Custom Tailwind design** (not using shadcn/ui)
- **Responsive:** Mobile-first approach
- **Design pattern:** Cards + rounded buttons + subtle shadows
- **Animation:** Transitions, pulse loading, slide-up modals
- **Accessibility:** ARIA labels on buttons, semantic HTML

### Interactive Patterns
- **Forms:** Modals (bottom sheet style)
- **Loading:** Skeleton screens + animated spinners
- **Feedback:** Optimistic updates (reactions, favorites)
- **Navigation:** Router-based + scroll navigation

### Styling Approach
- **CSS Variables:** Custom theme properties
- **Tailwind:** Utility-first CSS
- **Inline styles:** For dynamic values (colors from data)
- **SVG:** Decorative accents (circles, arcs)

---


---

## REMAINING PAGES AUDIT

### PAGE 10: PROFILE (/profile)
**File:** `app/(app)/profile/page.tsx`  
**Route:** `/profile`  
**Access:** Authenticated only  
**Status:** ❓ Not audited (need to review)

---

### PAGE 11: GUIDANCE (/guidance)
**File:** `app/(app)/guidance/page.tsx`  
**Route:** `/guidance`  
**Access:** Authenticated only  
**Status:** ❓ Not audited (need to review)

---

### PAGE 12: CIRCLE CREATE (/circle/create)
**File:** `app/(app)/circle/create/page.tsx`  
**Route:** `/circle/create`  
**Access:** Authenticated only  
**Status:** ❓ Not audited (need to review)

---

### PAGE 13: CIRCLE JOIN (/circle/join)
**File:** `app/(app)/circle/join/page.tsx`  
**Route:** `/circle/join`  
**Access:** Authenticated only  
**Status:** ❓ Not audited (need to review)

---

### PAGE 14: CIRCLE BROWSE (/circle/browse)
**File:** `app/(app)/circle/browse/page.tsx`  
**Route:** `/circle/browse`  
**Access:** Authenticated only  
**Status:** ❓ Not audited (need to review)

---

### PAGE 15: ONBOARDING PAGES
**Routes:**
- `/onboarding/intent` - Set user intent
- `/onboarding/tone` - Select tone preferences
- `/onboarding/preferences` - Set preferences
- `/onboarding/account` - Account setup
- `/onboarding/complete` - Completion screen

**Status:** ❓ Not audited (need to review)

---

## API ROUTES AUDIT

### Backend API Routes (in `/app/api/`)

#### Authentication Endpoints
- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/login` - Sign in
- **POST** `/api/auth/logout` - Sign out

#### Circle Endpoints
- **GET** `/api/circles` - List user's circles
- **GET** `/api/circles/[id]` - Get circle detail
- **GET** `/api/circles/preview` - Preview circle (before join)
- **POST** `/api/circles` - Create circle
- **POST** `/api/circles/join` - Join by code
- **DELETE** `/api/circles/[id]/members` - Leave circle

#### Circle Posts
- **GET** `/api/circles/[id]/posts` - Get posts
- **POST** `/api/circles/[id]/posts` - Create post
- **DELETE** `/api/circles/[id]/posts/[postId]` - Delete post

#### Reactions
- **POST** `/api/circles/[id]/posts/[postId]/reactions` - Add reaction
- **DELETE** `/api/circles/[id]/posts/[postId]/reactions` - Remove reaction

#### Du'a Wall
- **GET** `/api/dua-wall` - List duas (paginated)
- **POST** `/api/dua-wall` - Create du'a
- **POST** `/api/dua-wall/[id]/ameen` - Add ameen
- **DELETE** `/api/dua-wall/[id]/ameen` - Remove ameen
- **PATCH** `/api/dua-wall/[id]/fulfilled` - Mark answered

#### User Profile
- **GET** `/api/user/profile` - Get current user
- **PATCH** `/api/user/profile` - Update profile
- **GET** `/api/streak` - Get user's streak

#### Onboarding
- **POST** `/api/onboarding/complete` - Complete onboarding

---

## INTERACTIVE FLOW MAPS

### Login Flow
```
Start
  ↓
[/] Landing
  ├─ "Sign In" → [/auth]
  └─ "Get Started" → [/welcome]
  
[/welcome] Onboarding Carousel
  ├─ "Skip" → [/auth]
  └─ "Get Started" (last slide) → [/auth]

[/auth] Sign In Page
  ├─ Input: email, password
  ├─ "Sign In" 
  │  └─ POST /api/auth/login
  │     └─ Success → [/home]
  │     └─ Error → Show error message
  └─ "Create an Account" → [/welcome]

[/home] Authenticated
```

### Chat Creation Flow
```
[/home] Home Page
  ├─ Quick chip clicked
  │  ├─ Generate UUID
  │  ├─ Navigate to /chat/[UUID]?q=message
  │  └─ Chat page receives query param
  │
  └─ Amina chat input
     ├─ Type message
     ├─ Send button
     ├─ Create new UUID
     └─ Navigate /chat/[UUID] with message

[/chat/[id]] Chat Page
  ├─ Load conversation or create new
  ├─ Display messages (streaming from AI)
  ├─ User types response
  └─ Loop
```

### Circle Browsing Flow
```
[/circle] Circles List
  ├─ "Create a circle" → [/circle/create]
  │  └─ [/circle/create]
  │     ├─ Form: name, intention, topic
  │     └─ POST /api/circles
  │        └─ Redirect [/circle/[id]]
  │
  └─ "Join with a code" → [/circle/join]
     └─ [/circle/join]
        ├─ Input: invite code
        ├─ POST /api/circles/join
        │  └─ Check membership
        │  └─ Success: Navigate [/circle/[id]]
        │  └─ Error: "Circle not found"
        └─ [/circle/[id]]
           ├─ Check membership
           ├─ IF not member: "Not a member" error
           └─ IF member: Show posts + composer

[/circle/browse] Search/Browse
  ├─ List all public circles
  ├─ Filter by topic
  └─ Click to preview then join
```

### Du'a Wall Flow
```
[/dua-wall] Main Page
  ├─ Show Amina's weekly du'a (pinned)
  ├─ List all duas (paginated, 20 items)
  ├─ Load more → Fetch next 20
  │
  └─ Make du'a button (🤲)
     └─ Show sheet modal:
        ├─ Textarea: "Ya Allah..."
        ├─ POST /api/dua-wall
        │  └─ Success: Prepend new dua to list
        │  └─ Clear textarea + close modal
        └─ Ameen button
           ├─ POST /api/dua-wall/[id]/ameen
           │  └─ Optimistic: increment count + highlight
           └─ DELETE /api/dua-wall/[id]/ameen
              └─ Optimistic: decrement count + unhighlight
```

### Reflections Flow
```
[/reflections] Main Page
  ├─ Filter chips: All / Favorites
  ├─ Search bar: Search by title
  │
  ├─ Add button (+)
  │  └─ Show sheet modal:
  │     ├─ Title input (100 chars)
  │     ├─ Summary textarea (500 chars)
  │     ├─ Tag input (20 chars)
  │     └─ "Save Reflection"
  │        └─ INSERT into reflections table
  │           └─ Prepend to list
  │
  └─ Reflection card
     ├─ Heart button
     │  └─ PATCH reflections.favorited
     │     └─ Update UI + reorder if filtering
     └─ Title link (not yet implemented)
```

---

## STYLING & LAYOUT DETAILS

### Responsive Breakpoints (Tailwind)
```
Mobile: default (0px+)
Tablet: md: (768px+)
Desktop: lg: (1024px+)
```

### Common Layout Patterns

#### Card Pattern
```html
<div className="card">
  <!-- Content -->
</div>
```
**Maps to:**
```css
.card {
  background: var(--amina-warm-ivory);
  border: 1px solid var(--amina-hairline);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(44,41,38,0.06);
}
```

#### Button Patterns
```html
<!-- Primary -->
<button className="btn-primary">Label</button>

<!-- Secondary -->
<button className="btn-secondary">Label</button>

<!-- Chip/Tag -->
<div className="chip">Label</div>
<div className="chip chip-active">Active</div>
```

#### Modal Pattern
```html
<!-- Overlay -->
<div className="fixed inset-0 z-50 bg-black/20">
  <!-- Bottom sheet -->
  <div className="absolute bottom-0 left-0 right-0 bg-cream rounded-t-3xl">
    <!-- Content -->
  </div>
</div>
```

### Animation Classes
- `animate-pulse` - Fade in/out
- `animate-slide-up` - Slide up (sheet modals)
- `animate-bounce` - Bounce loading dots
- `transition-all` - Smooth transitions
- `active:scale-[0.98]` - Button press feedback

---

## KNOWN BUGS & ISSUES

### 🔴 Critical Issues

#### 1. Circle Join Loop (BLOCKING)
**Location:** Circle detail page  
**Issue:** After successfully joining a circle via POST /api/circles/join, subsequent GET /api/circles/[id] returns 403 "Not a member"  
**Symptom:** User sees "You are not a member of this circle" error immediately after joining  
**Root cause:** Unknown (database membership check failing?)  
**Reproducible:** 100% - happens every time user joins  
**Workaround:** None available  

#### 2. Bottom Navigation Unresponsive
**Location:** Home page  
**Issue:** BottomNav component not responding to clicks  
**Symptom:** Clicking tabs doesn't navigate  
**Root cause:** Unknown (component might be unmounted/hidden behind content?)  
**Reproducible:** 100%  

### 🟡 Minor Issues

#### 3. StreakCounter API Error
**Location:** Home page  
**Issue:** StreakCounter component trying to call /api/streak but endpoint may not exist or return wrong format  
**Symptom:** Streak not displaying, console errors  
**Root cause:** API endpoint mismatch or not implemented  

#### 4. Chat Integration Incomplete
**Location:** Home page quick chips  
**Issue:** Quick chips generate chat IDs but chat page not fully implemented  
**Symptom:** Navigation might fail or chat doesn't load query param  

---

## TODOS FOR NEXT AUDIT

- [ ] Review /profile page completely
- [ ] Review /guidance page
- [ ] Review /circle/create form
- [ ] Review /circle/join form  
- [ ] Review /circle/browse page
- [ ] Review all onboarding pages
- [ ] Audit all API routes implementations
- [ ] Check database schema
- [ ] Test all Supabase queries
- [ ] Verify auth token flow
- [ ] Check error handling
- [ ] Review chat streaming integration
- [ ] Audit performance (bundle size, API calls)
- [ ] Check accessibility (ARIA labels, keyboard nav)
- [ ] Review security (XSS, CSRF, auth)

---

## COMPONENT IMPORT TREE

### App Page Imports

#### /home (Home page)
```
Imports:
  - useState
  - useRouter (next/navigation)
  - StreakCounter
  - useSession (custom)
  - lucide-react icons
  
Exports:
  - HomePage (default)
  
Renders:
  - Header (custom, not AppHeader)
  - StreakCounter
  - Amina chat card
  - Recent conversations
  - Daily reflection
  - BottomNav (broken)
```

#### /circle/[id] (Circle detail - BROKEN)
```
Imports:
  - useEffect, useRef, useState, useCallback
  - useParams, useRouter (next/navigation)
  - Lucide icons
  - FaithReactions component
  - ShareCard component
  
Exports:
  - CircleDetailPage (default)
  
Key Functions:
  - getTokenFromCookie()
  - PostBubble component
  - handlePost()
  - timeLabel()
```

#### /dua-wall (Du'a wall)
```
Imports:
  - useEffect, useState, useRef, useMemo
  - createClient (Supabase)
  - AppHeader
  - CircleDetailSkeleton
  - lucide-react icons
  
Exports:
  - DuaWallPage (default)
  
Key Functions:
  - loadDuas()
  - toggleAmeen()
  - submitDua()
  - timeAgo()
```

---

