# AMINA — SOLUTION HEALTH AUDIT TEMPLATE
*CTP applied. TruthSerum enforced. No optimism bias.*
*Last updated: 2026-06-25 | Owner: Ro*

No hyphens in any output. Truth labels: VERIFIED, PARTIAL, MISSING, PLANNED, UNKNOWN.

---

## PROMPT CONTRACT (run before every audit session)

**GOAL:** Identify every gap between what Amina appears to do and what it actually does — functional and user-facing — across all shipped screens. Surface what blocks App Store submission.
**CONSTRAINTS:** Both lenses on every finding. 3x deep on every issue. Faith-first framing at all times. No closing an issue without a recommendation.
**FORMAT:** Pre-audit checklist → product map → 8-category audit → priority matrix → issue log → sign-off.
**FAILURE:** Marking a screen "OK" because it renders. Missing a dead end a first-time Muslim woman would hit. Calling a placeholder a feature.

---

## PRE-AUDIT CHECKLIST

Answer before starting:

- [x] **Who is the intended user?** Muslim women, 18–35, faith-forward, not necessarily technical. Many will be coming from a place of genuine spiritual need — stress, grief, identity, seeking community. This is not a casual app.
- [x] **What is the user's goal?** Find a companion that helps her reflect, make du'a, feel connected to sisters, and deepen her relationship with Allah — without feeling judged, surveilled, or manipulated.
- [x] **What does "success" look like?** She opens Amina daily. She sends a message, saves a reflection, or posts a du'a within the first session. She returns on day 2. She stays within the 21-day habit window.
- [x] **What data is in the system?** Seeded Quran (6,236 ayahs VERIFIED). Test account (`amina@yopmail.com`). Amina system seed post. Circle schema live. Real user data: minimal (dogfood phase).
- [x] **What is the critical path?** See Phase 1 below.

---

## CRITICAL PATH (Amina V1)

This is the minimum viable journey. Every issue on this path is P0.

```
Land on marketing page
→ Tap "Get Started"
→ Welcome carousel (4 slides)
→ Sign up / Sign in
→ Onboarding: tone → preferences → intent → account → complete
→ Home dashboard (first real screen)
→ Send first message to Amina AI
→ Receive citation-grounded response
→ Save reflection
→ View du'a wall
→ Post a du'a
→ See ameen count update
→ Return next day (notification or habit)
```

Anything that breaks on this path blocks submission. Full stop.

---

## PHASE 1 — PRODUCT MAP

Walk every route. Fill this before auditing anything.

| Page / Feature | Route | Primary Action | Loads? | Real Data? | Notes |
|---|---|---|---|---|---|
| Marketing / Landing | `/` | Sign up CTA | | | |
| Auth | `/auth` | Sign in / Sign up | | | Auth fix landed de16dc5 — verify live |
| Welcome carousel | `/welcome` | Next slide / Get started | | | 4 slides confirmed in code |
| Onboarding — Tone | `/onboarding/tone` | Select tone | | | 3 options |
| Onboarding — Preferences | `/onboarding/preferences` | Select preferences | | | |
| Onboarding — Intent | `/onboarding/intent` | Select spiritual intent | | | |
| Onboarding — Account | `/onboarding/account` | Submit account details | | | |
| Onboarding — Complete | `/onboarding/complete` | Enter app | | | |
| Home | `/home` | Start chat / see reflections | | | |
| Chat (new) | `/chat` | Send message | | | |
| Chat (existing) | `/chat/[id]` | Resume conversation | | | |
| Reflections list | `/reflections` | View past reflections | | | Sample data only — PARTIAL |
| Reflection detail | `/reflections/[id]` | Read full reflection | | | MISSING — no route |
| Du'a Wall | `/dua-wall` | Post du'a / give ameen | | | MISSING — no frontend page |
| Guidance | `/guidance` | Browse guidance | | | Phase 2? Nav conflict unresolved |
| Profile | `/profile` | View / edit profile | | | Edit rows link nowhere |
| Circle home | `/circle` | Browse circles | | | Phase 2 — should be gated |
| Circle detail | `/circle/[id]` | View posts / chat | | | Phase 2 — should be gated |
| Circle create | `/circle/create` | Create circle | | | Phase 2 — should be gated |
| Circle join | `/circle/join` | Join by code | | | Phase 2 — should be gated |
| Share card | Share card component | Share citation | | | Component exists |

---

## PHASE 2 — THE AUDIT FRAMEWORK

Run every category on every page listed above. Use the 3x deep structure for every issue found.

---

### CATEGORY 1 — FIRST IMPRESSION (Onboarding and Orientation)

**Amina-specific questions:**
- Does the marketing page communicate that this is for Muslim women specifically, or is it generic "wellness"?
- Does the welcome carousel convey warmth and faith — or does it feel like a startup product tour?
- Is Islamic framing (bismillah, in the name of Allah, Quran/hadith) present from the first screen, or does the app feel secular until you dig in?
- Does a new user understand what Amina AI is before she's asked to type a message? (Is there a "what can I ask?" hint?)
- Is the onboarding personalization (3 questions) visibly used? When she reaches the home screen, does the tone feel like it was shaped by her answers?

**3x Deep template:**
```
Surface: [What she sees on first open]
→ Deeper: [What assumption that makes about her context or faith literacy]
→ Deeper still: [Whether she feels seen or feels like another wellness app user]
```

---

### CATEGORY 2 — NAVIGATION AND WAYFINDING

**Amina-specific questions:**
- Does the bottom nav match the V1 spec? (4 tabs: Amina, Reflections, Du'a Wall, Profile — per FINAL TOUCHES dispatch)
- Is the Circle tab still visible? (It should not be — Phase 2)
- Is the Guidance tab in the nav? (Nav conflict from Day 5 audit is unresolved)
- Can she get back to the home screen from inside a chat?
- Is there a dead tab anywhere that leads to an empty or broken page?
- Do tab labels use warm, faith-language or generic product language?

**Known issue to verify:**
Nav divergence between v0 preview and actual `BottomNav.tsx`:
- v0 shows: Amina, Reflections, Du'a Wall (no Circle)
- Codebase shows: Home, Guidance, Reflections, Circle, Profile

This has not been confirmed resolved.

**3x Deep template:**
```
Surface: [What tab or nav item she taps]
→ Deeper: [What she expected vs what she got]
→ Deeper still: [Whether she assumes she did something wrong, or that the app is broken]
```

---

### CATEGORY 3 — CORE ACTIONS (Can she do the thing?)

**Amina-specific questions — by flow:**

**Chat flow:**
- Can she type a message and get a response on the first try, no account errors?
- Is the citation (hadith or ayah) visible in the response?
- Is the response tone-matched to what she selected in onboarding?
- Can she save the reflection from inside the chat?
- Can she resume a previous conversation from the home screen? (Day 5 audit flagged this as unverified)

**Du'a Wall flow:**
- Can she post a du'a? (frontend page MISSING — this is a P0 blocker)
- Can she give ameen on someone else's du'a?
- Can she mark a du'a as answered?
- Does the ameen count update in real time?

**Reflection flow:**
- Can she tap a reflection from the list and read it fully? (detail route MISSING)
- Can she delete a reflection?

**3x Deep template:**
```
Surface: [The friction or failure point in the action]
→ Deeper: [What she tries next]
→ Deeper still: [What she concludes about the app or herself]
```

---

### CATEGORY 4 — DATA INTEGRITY AND TRUST

**Amina-specific questions:**
- Are Quran citations accurate (matching seeded data)?
- Do hadith citations include source + grade? (no fabricated hadith — this is a launch-blocking integrity requirement)
- If Amina says "Allah said..." does it include a real ayah reference?
- Does the reflection list show real persisted conversations or sample/seed data?
- Do reaction counts on du'a posts update correctly across sessions?
- Does the handle display correctly? (handle bug: `is_anonymous ? 'Sister' : 'Sister'` — real name never shows)

**Faith-specific trust test:**
A Muslim woman who knows her deen will test the citations. If Amina fabricates or misattributes even one hadith, the product is dead in this community. This is not a UX issue — it is a product integrity issue.

**3x Deep template:**
```
Surface: [The data inconsistency or citation gap]
→ Deeper: [What she assumes — glitch vs. untrustworthy AI]
→ Deeper still: [Whether she shares it with her community or warns them away]
```

---

### CATEGORY 5 — AI AND AMINA BEHAVIOR

**Amina-specific questions:**
- Is the Islamic scope guardrail live? (Amina must not give fatwas, must not rule on halal/haram, must redirect to scholars)
- Does Amina decline gracefully when asked something out of scope?
- Is memory extraction working? (After a session, does Amina remember context in the next?)
- Is the Quran and hadith context being injected into responses, or is she hallucinating?
- Does the tone match what the user selected? (warm and gentle vs. scholarly vs. reflective)
- Is there a visible signal that Amina is AI — not a human scholar?
- What happens if she types something in crisis (grief, suicidal ideation adjacent)? Does Amina redirect or engage blindly?

**3x Deep template:**
```
Surface: [What Amina says or fails to say]
→ Deeper: [The theological or pastoral risk of that response]
→ Deeper still: [The community trust consequence if that response is screenshot and shared]
```

---

### CATEGORY 6 — NOTIFICATIONS AND PROACTIVE COMMUNICATION

**Amina-specific questions:**
- Are notifications in scope for V1? YES — per Circle V1 Real scope lock (2026-06-24). Three types: reaction received, reply received, du'a answered.
- Are any of these live? UNKNOWN — notification infrastructure status not confirmed.
- Is there a push notification entitlement in the iOS build config? UNKNOWN — EAS Build not started.
- Does the notification bell icon exist in the UI? If so, where does tapping it go? (FINAL TOUCHES dispatch said to remove or stub it — unconfirmed status)
- Is the 21-day retention sequence (daily reflection prompt) implemented anywhere?

**3x Deep template:**
```
Surface: [The notification that should exist but doesn't]
→ Deeper: [The retention loop it breaks]
→ Deeper still: [The day in the 21-day window she falls off and doesn't return]
```

---

### CATEGORY 7 — PERFORMANCE AND LOAD STATES

**Amina-specific questions:**
- Does the chat response have a visible loading state? (she needs to know Amina is thinking — not assume it crashed)
- Do du'a ameen counts update in real time or require refresh?
- Does the Circle posts feed load correctly or show empty state?
- Are there any API routes returning 500s in production?
- Does the auth session persist across browser/app restarts, or does she get logged out?
- Does the Supabase real-time subscription work for reactions without a page refresh?

**3x Deep template:**
```
Surface: [The load or performance issue]
→ Deeper: [What she interprets — waiting is fine, spinning forever is not]
→ Deeper still: [Whether she abandons the session at that point]
```

---

### CATEGORY 8 — SETTINGS, PERMISSIONS AND CONTROL

**Amina-specific questions:**
- Can she edit her profile? (Profile edit links go nowhere — PARTIAL)
- Can she change her onboarding tone preferences later?
- Can she delete her account and data? (Apple requires this — it is an App Store requirement, not optional)
- Can she export her reflections?
- Is there a visible privacy policy link in the app? (Policy is live, but is it linked from inside the app?)
- Are Circle posts anonymous to peers but attributable to moderators? (Per scope lock — verify this is enforced in RLS)
- Can she report a post? (Report route status: MISSING per Circle V1 Real scope — needed before launch)
- Can she block another user?

**App Store specific:**
Apple requires account deletion to be available within the app (WWDC 2022 guideline). If it's not there, rejection is automatic.

**3x Deep template:**
```
Surface: [The missing control or dead settings link]
→ Deeper: [What she cannot do as a result]
→ Deeper still: [The trust or compliance consequence]
```

---

## PHASE 3 — SCORING EACH COMPONENT

Score every page after auditing it. 1 = critical, 3 = functional, 5 = excellent.

| Page | Clarity | Reliability | Speed to Value | Trust | Completeness | Total |
|------|---------|-------------|----------------|-------|--------------|-------|
| Marketing page | | | | | | /25 |
| Auth | | | | | | /25 |
| Welcome carousel | | | | | | /25 |
| Onboarding (all steps) | | | | | | /25 |
| Home | | | | | | /25 |
| Chat (new) | | | | | | /25 |
| Chat (existing) | | | | | | /25 |
| Reflections list | | | | | | /25 |
| Reflection detail | | | | | | /25 |
| Du'a Wall | | | | | | /25 |
| Profile | | | | | | /25 |

**Scoring guide for Amina context:**

| Dimension | 1 (Critical) | 3 (Functional) | 5 (Excellent) |
|---|---|---|---|
| **Clarity** | She has no idea what to do or who Amina is | She figures it out after some exploration | She knows exactly what Amina is and what to do within 10 seconds |
| **Reliability** | Citations are wrong / data is missing / page errors | Works most of the time, occasional data issues | Always accurate, citations sourced, no errors |
| **Speed to Value** | 5+ taps to feel the product's value | 3 taps | She feels the value inside the first message exchange |
| **Trust** | She doubts Amina's Islamic integrity | She mostly trusts it but has questions | She would recommend it to her sisters without hesitation |
| **Completeness** | The feature is a shell or placeholder | The feature works but is missing edge cases | The feature fully delivers — including empty states, errors, and edge cases |

---

## PHASE 4 — PRIORITY MATRIX

Place every issue here after scoring.

| | **High User Impact** | **Low User Impact** |
|---|---|---|
| **Easy to Fix** | 🔴 DO NOW — blocks submission | 🟡 Quick win, batch it |
| **Hard to Fix** | 🟠 Plan and resource | ⚪ Backlog |

**Amina-specific P0 list (known before audit runs):**

🔴 Du'a Wall frontend page missing — core V1 feature, no route exists
🔴 Account deletion missing — Apple App Store hard rejection
🔴 Report / block missing — Apple requires content moderation for UGC apps
🔴 Handle bug — user's name never displays even when she opts in
🔴 Bottom nav Phase 2 leakage — Circle tab visible, leads to incomplete flow
🔴 Reflection detail page missing — tapping a reflection goes nowhere
🔴 Citation integrity unverified — fabricated hadith = community trust death

---

## PHASE 5 — ISSUE LOG FORMAT

Write every issue found in this format:

```
ISSUE: [One sentence]
LOCATION: [Route or component]
LENS: [Functional | User Experience | Both]
CATEGORY: [1–8]
PRIORITY: [🔴 🟠 🟡 ⚪]
TRUTH LABEL: [VERIFIED | PARTIAL | MISSING | PLANNED | UNKNOWN]

Surface: [What you observe]
→ Deeper: [Why it is actually a problem]
→ Deeper still: [What compounds downstream — community trust, retention, Apple review]

RECOMMENDATION: [The specific fix — file, route, DB change, or config]
OWNER: [Ro | Keymon | SwarmClaw | Claude]
APP STORE BLOCKING: [YES | NO]
```

---

## AUDIT SIGN-OFF CHECKLIST

Do not close the audit until all of these are checked:

- [ ] Every route in the product map has been visited with a logged-in session
- [ ] Every primary action (send message, save reflection, post du'a, give ameen, edit profile) has been tested end-to-end
- [ ] Amina AI has been tested for citation accuracy on at least 3 different spiritual questions
- [ ] Amina AI has been tested with an out-of-scope question (fatwa request, halal ruling) — does she redirect correctly?
- [ ] A crisis-adjacent message has been sent — does Amina respond safely?
- [ ] The onboarding flow has been run as a brand new user (no cached session)
- [ ] Data consistency checked: does a reflection saved in chat appear in the reflections list?
- [ ] Every bottom nav tab tapped and destination confirmed
- [ ] Every settings link in profile tapped and destination confirmed
- [ ] Account deletion path confirmed (or documented as MISSING)
- [ ] Privacy policy linked from inside the app
- [ ] No Phase 2 UI is reachable from any tap in the V1 nav
- [ ] Every issue has a 3x deep writeup, priority score, truth label, and recommendation
- [ ] Critical path (marketing → first meaningful Amina response) has been completed end-to-end

---

## APP STORE SUBMISSION GATE

Do not submit until every item below is VERIFIED:

| Gate | Status | Owner |
|------|--------|-------|
| Account deletion available in-app | | Keymon |
| Privacy policy linked from inside app | | Keymon |
| No UGC feature without report/block | | SwarmClaw |
| Citation accuracy verified (no fabricated hadith) | | Claude/Ro |
| Bottom nav: Phase 2 UI fully gated | | Keymon |
| Du'a Wall frontend built and wired | | SwarmClaw |
| Sentry configured with DSN | | Ro |
| PostHog 5 core events firing | | Ro |
| EAS Build config complete | | Ro |
| TestFlight internal build passing | | Ro |
| App icon 1024x1024 PNG no alpha | | Ro |
| Screenshots: iPhone 6.9" + 6.5" | | Ro |
| Age rating declared (12+ minimum — UGC) | | Ro |
| Support URL live | | Ro |
| Push notification entitlement in provisioning profile | | Ro |

---

*This template is version-controlled. Any scope change to Amina V1 must be reflected here.*
*Source of truth for audit scope: `AMINA_CIRCLE_SCOPE_LOCK_V2.md` (locked 2026-06-24)*
