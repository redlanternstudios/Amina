# AMINA — SCOPE LOCK V2
**Locked:** 2026-06-16  
**Sprint:** v1.1 — Integrity & Experience  
**Status:** LOCKED  
**Prerequisite answered before build starts:** Saudi Journey nav → Hajj & Umrah (keep) or delete? See NAV BLOCKER below.

---

## NAV BLOCKER (Ro must answer before NAV-001 executes)

Muslim Texas and Drops are deleted. No question.  
Saudi Journey: rename to Hajj & Umrah with real content page, or delete entirely?

Clean nav (shipping regardless):
```
About | Amina | The Circle | Partnerships | Sign in | Join The Circle
```
Hajj & Umrah added only if Ro confirms content intent.

---

## LOCKED SCOPE — 8 ITEMS

---

### NAV-001 — Clean the marketing nav
**User story:** A first-time visitor sees only the nav items Amina has actually built and earned.

**AC:**
- `Muslim Texas` nav item removed from layout and all route files
- `Drops` nav item removed from layout and all route files
- `/muslim-texas` and `/drops` route files deleted or 404-redirected
- Any reference to `theblondemuslim.com` in nav, footer, or copy is removed
- Nav renders: About | Amina | The Circle | [Hajj & Umrah if confirmed] | Partnerships

**DoD:** Marketing page renders clean nav. No 404s from removed links. No creator references visible on any public page.

---

### ONBOARD-001 — Wire onboarding data to system prompt
**User story:** A woman who chose "Gentle & Nurturing" gets a noticeably softer Amina than a woman who chose "Wise & Thoughtful" from her first message.

**What's broken:** `onboarding/tone/page.tsx` saves to `sessionStorage`. `chat/route.ts` runs server-side. SessionStorage is never read. Tone data is dead.

**What to build:**
1. `onboarding/complete/page.tsx` — on mount, read `onboarding_tone` + `onboarding_preferences` from sessionStorage and write to `amina_profiles` row for `auth.uid()` via Supabase client
2. `chat/route.ts` — at start of every request, pull authenticated user's `amina_profiles` row. Extract `tone`, `interests`, `life_stage` if set
3. Inject into system prompt as a one-line prefix before the main SYSTEM_PROMPT:

```
User context: tone preference is {tone}. Primary topics: {interests}. {life_stage if set}.
```

Tone modifier map (inject into system prompt):
- `gentle` → "Lead with softness. Match her pace. She needs to feel held before she hears insight."
- `wise` → "She values depth. Don't over-explain, but don't flatten complexity."
- `encouraging` → "Keep her moving. Name what's strong in her before what needs work."

**AC:**
- `amina_profiles` table has `tone`, `interests`, `life_stage` columns (add via migration if absent)
- `onboarding/complete` writes these values to the authenticated user's profile row
- `chat/route.ts` reads profile on every request before building system prompt
- Two users with different tone selections receive measurably different system prompt headers
- Fallback: if no profile exists, system prompt runs without modifier (current behavior)

**DoD:** Test with two accounts: gentle + wise. Verify system prompt prefix differs. Verify Amina's first response reflects the tone.

---

### STREAM-001 — Implement streaming responses
**User story:** Amina's words appear as she "types" them, creating presence rather than a dead wait followed by a wall of text.

**What's broken:** `chat/route.ts` returns `NextResponse.json()` with complete message. No streaming. Mobile users see 3-5s silence then sudden text.

**What to build:**
1. Upgrade `ai` package: `npm install ai@^4.0.0 @ai-sdk/groq`
2. Rewrite `chat/route.ts` to use `streamText` from AI SDK v4:

```typescript
import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  // ... profile fetch, safety check ...
  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: buildSystemPrompt(profile),
    messages,
    maxTokens: 250,
    temperature: 0.75,
  })
  return result.toDataStreamResponse()
}
```

3. Update chat UI component to consume the stream using `useChat` from AI SDK v4 or manual `ReadableStream` reader

**AC:**
- Chat UI renders tokens as they arrive
- No regression in safety layer (pre-call check still runs before streamText)
- 429 handling preserved (streamText throws, catch and return graceful error)
- Typing indicator hidden once stream begins

**DoD:** Open chat on mobile. Send a message. Tokens appear word by word within 500ms of send.

---

### SAFETY-001 — Fix islamic-safety.ts: IPV signals + emoji removal
**User story:** A woman disclosing abuse gets a dedicated, appropriate response — not the same response as a suicide crisis. And the crisis response doesn't break Amina's voice with emojis.

**Two confirmed bugs:**

**Bug 1 — Emoji in crisis response:**  
`CRISIS_RESPONSE` contains `🆘` and `🤍`. System prompt prohibits emoji. Remove both.

**Bug 2 — IPV signals absent:**  
CRISIS_KEYWORDS has no coverage for intimate partner violence. Add:

```typescript
const IPV_KEYWORDS = [
  'he hurts me', 'she hurts me', 'he hits me', 'she hits me',
  'i\'m scared of him', 'i\'m scared of her',
  'he won\'t let me leave', 'she won\'t let me leave',
  'he reads my messages', 'he controls',
  'i can\'t leave', 'he threatens me',
]

export const IPV_RESPONSE = `Sister, what you're sharing matters and I hear you.
You deserve to be safe. Please reach out for support:

National Domestic Violence Hotline: 1-800-799-7233 or text START to 88788
You can also chat at thehotline.org

I'm here with you. You are not alone in this.`
```

Move the safety check server-side: run `applySafetyLayer` in `chat/route.ts` before the LLM call, not client-side.

**AC:**
- `CRISIS_RESPONSE` contains no emoji
- `IPV_KEYWORDS` array exists and `detectIPV()` function exported
- `applySafetyLayer()` checks IPV and returns `IPV_RESPONSE` if triggered
- Safety check runs in `chat/route.ts` before Groq call, not in client component
- Existing crisis and fatwa behavior unchanged

**DoD:** Send "I'm scared of him" to chat. Receive `IPV_RESPONSE`. No emoji in either response string.

---

### PAY-001 — Wire RevenueCat + middleware paywall
**User story:** A user without an active entitlement is redirected to the paywall when they try to access `/home`, `/chat`, `/circles`, or `/reflections`.

**What's broken:** No `middleware.ts` exists. `hasAminaAccess` exists in `lib/revenue-cat.ts` but is called nowhere. Entire app is free.

**What to build:**
1. Create `amina/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/ssr'

const PROTECTED_PATHS = ['/home', '/chat', '/circles', '/circle', '/reflections', '/guidance', '/profile']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isProtected = PROTECTED_PATHS.some(p => req.nextUrl.pathname.startsWith(p))
  if (!isProtected) return res

  if (!session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // RevenueCat check — only when API key present
  if (process.env.NEXT_PUBLIC_REVENUECAT_API_KEY) {
    const { hasAminaAccess } = await import('@/lib/revenue-cat')
    const hasAccess = await hasAminaAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/upgrade', req.url))
    }
  }

  return res
}

export const config = { matcher: ['/home/:path*', '/chat/:path*', '/circles/:path*', '/circle/:path*', '/reflections/:path*', '/guidance/:path*', '/profile/:path*'] }
```

2. Create `app/(auth)/upgrade/page.tsx` — beautiful paywall page showing The Circle + Amina value prop + pricing. Not punitive. Reinforces why it's worth it.

**AC:**
- Unauthenticated users are redirected to `/auth`
- Authenticated users without entitlement are redirected to `/upgrade`
- In dev mode (no REVENUECAT_API_KEY), middleware skips entitlement check — all authenticated users pass
- `/upgrade` page exists and renders correctly
- `/auth`, `/welcome`, `/onboarding/*` are NOT protected

**DoD:** Create a test account with no RevenueCat entitlement (prod key required). Confirm redirect to `/upgrade`. Confirm onboarding flow unaffected.

---

### REFLECT-001 — Build the Reflections save loop
**User story:** At the end of a meaningful conversation, a woman can save a reflection with one tap. It appears in her Reflections page the next time she opens the app.

**What's broken:** `SAMPLE_REFLECTIONS` is hardcoded state in `reflections/page.tsx`. Favorites toggle is ephemeral. There is no save mechanism in the chat UI. A user's real conversations produce zero persistent reflections.

**What to build:**

**Part A — DB:**
Add to `amina_messages` or create `amina_reflections` table:
```sql
CREATE TABLE amina_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  tag text,
  source_conversation_id uuid,
  favorited boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
-- RLS: users see only their own rows
ALTER TABLE amina_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_reflections" ON amina_reflections
  FOR ALL USING (auth.uid() = user_id);
```

**Part B — Save from chat:**
After every AI response, show a subtle bookmark icon. On tap, call `/api/reflections` (POST) with the conversation context. The API generates a 1-2 sentence summary from the last 4 messages and saves to DB.

Auto-offer after 5+ message exchanges: Amina adds: "Would you like to save this as a reflection?" — single tap saves.

**Part C — Reflections page:**
Replace `SAMPLE_REFLECTIONS` with a Supabase fetch: `SELECT * FROM amina_reflections WHERE user_id = auth.uid() ORDER BY created_at DESC`.

**AC:**
- `amina_reflections` table exists with RLS
- `/api/reflections` POST route creates a reflection for authenticated user
- Chat UI shows save option after 5+ messages and on individual message tap
- `reflections/page.tsx` reads from DB, not hardcoded state
- Favorites toggle persists (UPDATE amina_reflections SET favorited = true)
- Empty state shown when 0 reflections (not sample data)

**DoD:** Complete a 6-message conversation. Save a reflection. Close the app. Reopen Reflections. See it.

---

### CIRCLE-001 — Seed The Circle with real content before first user
**User story:** The first real user who opens The Circle sees 5-8 real, warm, authentic posts — not an empty feed.

**What's broken:** Empty feed on launch = immediate abandonment. Well-documented failure mode.

**Content to create (parallel track — not engineering):**
Write 5-8 seed posts in Amina's editorial voice. Real feelings, real situations:
1. A du'a for a hard week — "This week has been heavy for me. I keep coming back to this du'a..."
2. A question about maintaining prayer consistency when depressed
3. A reflection on feeling behind spiritually compared to others
4. A post about navigating a difficult relationship with a parent
5. A post about being a revert and feeling alone during Ramadan

**Weekly prompt system (engineering, 2 hours):**
- Cron job (Vercel Cron, `*/0 9 * * 1` = every Monday 9am)
- Reads from a `weekly_prompts` table (seed with 12 prompts)
- Posts to The Circle as the `amina` system account

**AC:**
- 5-8 seed posts exist in DB before first user invite goes out
- `weekly_prompts` table exists with 12 entries
- Cron job posts Monday prompt to The Circle from system account
- Seed script documented in `supabase/seeds/circle_seed.sql`

**DoD:** Open The Circle as a new user. See real content. Not an empty screen.

---

## PARKED — NOT THIS SPRINT

| Item | Reason | Target |
|------|--------|--------|
| Next.js 15 upgrade | Regression risk pre-launch, v14 is stable | v1.2 |
| Push notifications | Requires Capacitor native deployment first | v1.2 |
| Progressive profile enrichment from conversations | V2 ML feature | v2 |
| Streaming tone-aware voice | Builds on STREAM-001 and ONBOARD-001 | v1.2 |
| Life stage progressive capture | Builds after ONBOARD-001 is live | v1.2 |

---

## BUILD ORDER

Dependencies require this sequence:

```
NAV-001          (no deps — execute first, parallel with everything)
SAFETY-001       (no deps — execute first, parallel)
ONBOARD-001      (needs amina_profiles schema)
  └─ STREAM-001  (needs updated chat/route.ts from ONBOARD-001)
REFLECT-001      (needs amina_reflections schema + chat route stable)
PAY-001          (needs auth flow stable)
CIRCLE-001       (content track — parallel, no engineering deps)
```

Parallelizable on Day 1:
- NAV-001 + SAFETY-001 + CIRCLE-001 (content) can all start simultaneously

---

## WHAT SHIPS AFTER THIS SPRINT

A woman creates an account → onboards → Amina responds in her chosen tone from message one → responses stream in real time → she saves a reflection from the conversation → it persists → she opens The Circle and sees real community content → she can't access protected pages without a subscription.

That is a product. Not a prototype.

---

## POST-LOCK CHANGE RULE

Any change to locked items requires:
1. New user story + AC + DoD
2. Explicit written confirmation before build starts
3. Log entry in this file under CHANGE LOG

## CHANGE LOG
*(append-only)*
