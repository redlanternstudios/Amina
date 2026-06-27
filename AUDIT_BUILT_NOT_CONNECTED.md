# Amina Project - Comprehensive Audit Report
**Date:** June 27, 2025  
**Status:** Built but not fully utilized

---

## EXECUTIVE SUMMARY

The Amina project has significant infrastructure built out that is either:
1. **Not connected** - Tables exist but aren't being used
2. **Not working** - Features exist but have bugs or incomplete implementations
3. **Not being used** - Pages exist but aren't in the main navigation flow

---

## DATABASE AUDIT

### Tables Created (18 total)
```
✓ ACTIVE (Being Used):
  - circle_groups (16 queries)
  - circle_group_members (20 queries)
  - circle_memberships (18 queries)
  - circle_posts (7 queries)
  - circle_post_comments (7 queries)
  - circle_messages (2 queries)
  - circle_reactions (7 queries)
  - circles (4 queries)
  - circle_profiles (1 query)
  - circle_invites (3 queries)
  - circle_notifications (2 queries)
  - reflections (3 queries)
  - dua_wall_posts (12 queries)
  - dua_ameens (7 queries)
  - moderation_queue (1 query)

✗ UNUSED (Created but not queried):
  - conversations (legacy feature, replaced by circle_messages)
  - messages (legacy feature, replaced by circle_messages)
  - profiles (created, used in onboarding, not actively maintained)
  - dm_conversations (NOT IMPLEMENTED)
  - dm_messages (NOT IMPLEMENTED)
  - dm_participants (NOT IMPLEMENTED)
```

### Database Issues:
1. **Orphaned legacy tables** - conversations, messages tables exist but aren't used
2. **DM feature incomplete** - 3 tables created (dm_conversations, dm_messages, dm_participants) but feature was never built
3. **Circle notifications** - table exists but underutilized (only 2 queries)

---

## PAGES AUDIT

### Main Navigation (5 pages - in BottomNav)
✓ `/home` - Working
✓ `/circle` - Working with sub-routes
✓ `/reflections` - Fixed (was broken, now working with add functionality)
✓ `/dua-wall` - Fixed (was broken, now working with header)
✓ `/profile` - Working (complete but not fully integrated)

### Non-Navigation Pages
✓ `/guidance` - Built, accessible via home chips (3 references in code)
✓ `/chat` - Legacy redirect page (14 references but mostly in old code)
  - Actually redirects to `/chat/[id]` with default conversation
  - Then redirects again (double redirect inefficiency)

? `/chat/[id]` - Legacy, REPLACED by `/circle/[id]/chat`
  - Still exists but never navigated to directly
  - Used to be the 1:1 chat with Amina
  - Now replaced by circle chat functionality

### Onboarding Pages (Complete)
✓ `/auth` - Working
✓ `/onboarding/welcome` - Working
✓ `/onboarding/account` - Working
✓ `/onboarding/intent` - Working
✓ `/onboarding/preferences` - Working
✓ `/onboarding/tone` - Working
✓ `/onboarding/complete` - Working

---

## PAGES BREAKDOWN

### 1. Profile Page (`/profile`)
**Status:** Built but incomplete
- Has tabs: Profile, Preferences, Privacy, Support
- Shows static data (not pulling from DB)
- Edit Profile, Change Password buttons exist but don't do anything
- Profile tabs 2-4 (Preferences, Privacy, Support) appear to be stubs
- **Issue:** Not fully functional, just UI scaffolding

### 2. Guidance Page (`/guidance`)
**Status:** Built but read-only
- Beautiful UI with categories and topics
- Shows "Featured Guidance" section
- Search button exists but non-functional
- "Browse by topic" section with View All links
- **Issue:** All content is static, no data integration or interactivity

### 3. Chat Page (`/chat`)
**Status:** Legacy redirect (inefficient)
- Is a redirect to `/chat/[id]` 
- Creates a default conversation
- Then redirects again to the actual chat page
- **Issue:** Double redirect, legacy code that should be deprecated

### 4. Chat[id] Page (`/chat/[id]`)
**Status:** Legacy, replaced by circle chat
- Still fully built but never navigated to
- Has Amina3DCharacter fallback UI
- Uses old `conversations` table (which is orphaned)
- **Issue:** Replaced by `/circle/[id]/chat`, should be deprecated

---

## API ROUTES AUDIT

### Total API Routes: 30

**Actively Used:**
- `/api/circles/[id]/posts` - ✓ Used
- `/api/circles/[id]/messages` - ✓ Used
- `/api/circles/[id]/members` - ✓ Used
- `/api/circles/[id]/join` - ✓ Used
- `/api/circles/[id]/invite` - ✓ Used
- `/api/dua-wall/route` - ✓ Used
- `/api/dua-wall/[id]/ameen` - ✓ Used
- `/api/circles/browse` - ✓ Used
- `/api/circles/route` - ✓ Used

**Rarely/Never Used:**
- `/api/mosques` - ✗ Created but never called
  - Only found in abandoned chat code
  - **Issue:** Orphaned API endpoint
- `/api/moderate-image` - ✗ Created but never called
  - **Issue:** Orphaned API endpoint
- `/api/chat` - Used by AminaBubble (legacy 1:1 chat)
  - **Issue:** Legacy feature, should be deprecated
- `/api/streak` - ✗ Created but minimal usage
  - Endpoint exists but not actively called
  - **Issue:** Unused feature scaffolding

---

## FEATURES BUILT BUT BROKEN/INCOMPLETE

### 1. Direct Messaging (NOT WORKING)
**Tables created:** dm_conversations, dm_messages, dm_participants
**UI built:** None
**Status:** Abandoned feature
**Issue:** Database schema exists but feature was never implemented in UI

### 2. Profile Settings (INCOMPLETE)
**Built:** Yes, UI exists
**Working:** No, all action buttons are stubs
**Issue:** Profile page shows settings but none are functional

### 3. Guidance System (READ-ONLY)
**Built:** Yes, beautiful UI
**Working:** No, no interactivity
**Issue:** All content is hardcoded static data

### 4. Legacy Chat System (REPLACED)
**Old route:** `/chat/[id]`
**New route:** `/circle/[id]/chat`
**Status:** Legacy code still present
**Issue:** Dead code that should be cleaned up

### 5. Moderation Queue (MINIMAL)
**Database table:** moderation_queue (exists)
**UI:** None
**API:** `/api/circles/[id]/posts` references it (1 query)
**Issue:** Infrastructure exists but no moderation UI

---

## COMPONENT ANALYSIS

### 26 Components Total

**Well-Integrated:**
- BottomNav - ✓ Working, in use
- AppHeader - ✓ Working, in use on all authenticated pages
- Sidebar - ✓ Fixed (was broken context issue)
- TinyAminaBubble - ✓ Working, in header
- CircleCard, CircleDetailTabs - ✓ Used
- FaithReactions - ✓ Used in posts/messages
- CircleAvatar - ✓ Used throughout

**Partially-Used:**
- Amina3DCharacter - Used as fallback but main animated Amina now uses TinyAminaBubble video
- AminaBubble - Still references legacy `/api/chat` endpoint

**Dead/Unused:**
- Components for DM system (if any exist) - Never used

---

## ROUTING ISSUES

### Double Redirects
1. User goes to `/chat`
2. Redirects to `/chat/[defaultConversationId]`
3. Chat component redirects again... (inefficient)

### Orphaned Routes
- `/chat/[id]` - exists but never navigated to
- Previous home pages that were replaced

---

## DATA INTEGRITY ISSUES

### 1. Conversation System Orphaned
- `conversations` table created
- `messages` table created
- Replaced by `circle_messages` but old tables still exist
- **Risk:** Old data not cleaned up, schema pollution

### 2. Profile Data
- profiles table exists
- Used in onboarding
- Not actively maintained in app flow
- **Risk:** Profile data incomplete

### 3. DM System Incomplete
- 3 tables created
- Feature never built
- **Risk:** Schema pollution, dangling data

---

## SUMMARY OF ORPHANED/UNUSED ITEMS

### Not Connected (7 items):
- `dm_conversations` table
- `dm_messages` table
- `dm_participants` table
- `/api/mosques` endpoint
- `/api/moderate-image` endpoint
- `/api/streak` endpoint
- Guidance system (no data integration)

### Not Working (5 items):
- Profile settings page (UI only, no functionality)
- `/chat/[id]` page (legacy, replaced)
- `/chat` page (double redirect)
- Moderation queue (table exists, no UI)
- Conversations system (orphaned)

### Not Being Used (6 items):
- `conversations` table
- `messages` table
- Legacy chat feature entirely
- Mosques API
- Image moderation API
- Profile preferences/privacy tabs (just UI stubs)

---

## WHAT'S ACTUALLY WORKING

### Core Circle Features (Primary Focus)
✓ Circle creation and management
✓ Circle discovery and browse
✓ Circle membership and invites
✓ Circle posts and reflections
✓ Circle chat (real-time messages)
✓ Faith reactions (Ameen, SubhanAllah, MashaAllah)
✓ Circle member management

### Secondary Features (Functional)
✓ Du'a Wall posts and ameens
✓ Reflections saving and favorites
✓ Home page with cards and flow
✓ Bottom navigation working
✓ Sidebar navigation working
✓ Authentication (signup, login, onboarding)
✓ Tiny Amina animated character in doorway window

### What Needs Attention
- Profile settings (UI only, needs implementation)
- Guidance page (beautiful but static)
- Legacy chat code (should be removed)
- Orphaned database tables (should be cleaned)

---

## CONCLUSION

The Amina project is **80% focused on Circles** which is working well. The remaining 20% contains:
- Beautiful UI that isn't connected to data (Guidance, Profile settings)
- Abandoned features (DM system, legacy chat)
- Orphaned database tables (conversations, messages)
- Dead code that should be cleaned up

**Primary focus:** Circle feature (V1 deliverable) is complete and working.  
**Secondary focus:** Core pages (Home, Reflections, Du'a Wall) are functional.  
**Not prioritized:** Profile, Guidance, and legacy chat system - these are scaffolding or deprecated.
