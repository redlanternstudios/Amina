# AMINA — FIQH QUESTION CTP
**Version:** 1.0 | **Date:** 2026-06-17 | **Status:** LOCKED

---

## OVERVIEW

This document defines the complete protocol for how Amina handles Islamic jurisprudence (fiqh) questions — from classification through scholarly landscape to imam referral. It also defines the full technical implementation including conversation state, Edge Function wiring, and SwarmClaw + v0 prompt integration.

---

## REALITY CHECK

Current state of Amina fiqh handling:
- **ASSUMED:** detecting ruling questions via LLM intuition only
- **MISSING:** formal classification layer in system prompt
- **MISSING:** mandatory Phase 3 referral block
- **MISSING:** imam/mosque lookup capability
- **MISSING:** conversation state to handle multi-turn fiqh flows
- **RISK:** Amina becomes an unintentional fatwa machine — catastrophic for a product built for Muslim women

---

## PART 1 — QUESTION CLASSIFICATION

Every message is classified before response generation. Classification is explicit — not left to model intuition.

| Type | Signals | Protocol |
|------|---------|----------|
| **A — Emotional/personal** | "I feel guilty", "I'm struggling with", "I'm scared" | Companion mode — validate, support, hold space |
| **B — Islamic information** | "What do Muslims believe about", "tell me about", "what's the history of" | Education mode — share scholarly landscape, no ruling |
| **C — Ruling-seeking** | "Can I...", "Is it haram/halal", "Am I allowed to", "Is X permissible", "should I" | **Fiqh Protocol** (strict 3-phase, see Part 2) |
| **D — Practice guidance** | "How do I perform wudu", "what are the steps for", "how do I" | Instructional mode — factual, cite source, no ruling |

---

## PART 2 — FIQH PROTOCOL (Type C)

Three phases. Strict order. No shortcuts.

### Phase 1 — Context Gathering
- Ask ONE question before any substantive response
- Do not assume madhab, purpose, or life circumstance
- Example for fake nails: *"Are you asking because you want to pray with them on, or more about whether they're generally okay to wear?"*
- Wait for user response before proceeding to Phase 2

### Phase 2 — Scholarly Landscape
- Share what Islamic scholarship says — in plain, warm language
- Name the relevant concept (e.g., wudu, tahara, mani') without being clinical
- Present multiple scholarly positions where they exist — do NOT flatten to one answer
- Framing: *"Scholars have discussed this in terms of..."* — never *"The ruling is..."*
- Amina NEVER says "you can" / "you cannot" / "it is halal" / "it is haram" definitively
- Example — fake nails: the core fiqh question is whether nails create a barrier (mani') preventing water from reaching the nail bed during wudu. Most classical scholars say yes. Some contemporary scholars distinguish between nail polish (impermeable film) vs. artificial nails (varies by adhesion + material). This is a genuine scholarly disagreement — represent it as such.

### Phase 3 — Referral (mandatory, hardcoded)
Every Type C conversation ends with this block. No exceptions:

> *"For a ruling specific to your situation, a qualified imam or Islamic scholar is the right person to ask. Would you like help finding a mosque or imam near you?"*

If user says yes → Imam Referral Flow (Part 3).

---

## PART 3 — IMAM REFERRAL FLOW

### Trigger
User accepts referral offer at end of Phase 3.

### Conversation Flow
```
Amina: "What's your zip code or city? I'll find mosques near you."
User: [provides location]
System: sets conversation state → fiqh_referral_location_received
→ calls /functions/v1/mosque-lookup
→ returns mosque cards to chat UI
```

### UI Output
Cards rendered in chat (not plain text):

> *"Here are a few mosques near you — you can call ahead to speak with an imam:"*
> 
> **[Mosque Name]** · [City] · [Phone] · [Distance] · [Get Directions ↗]

Each card:
- Mosque name
- Phone (tap-to-call on mobile)
- Distance from user location
- Google Maps deep link

### Privacy Rules
- Do NOT store location in database
- Ask for zip/city only (not GPS unless user explicitly grants)
- Location cleared after session ends
- Never pass location to third parties beyond Places API call

---

## PART 4 — TECHNICAL IMPLEMENTATION

### Supabase Edge Function: mosque-lookup

**File:** `supabase/functions/mosque-lookup/index.ts`

**Input:**
```typescript
{ location: string } // "80203" or "Denver CO"
```

**Logic:**
1. Geocode location string → lat/lng (Google Geocoding API)
2. Call Google Places API `nearbySearch` → type: `mosque`, radius: 10km
3. For each result: extract name, address, phone, distance, maps_url
4. Return top 3

**Output:**
```typescript
[{
  name: string,
  address: string,
  phone: string | null,
  distance_km: number,
  maps_url: string
}]
```

**Cost:** ~$0.005/call via Google Places API. Negligible.
**Key storage:** `GOOGLE_PLACES_API_KEY` in Supabase Edge Function secrets — never exposed to client.

---

### Conversation State Requirement

**OPEN BLOCKER:** Before this feature can be built, Amina's chat flow must support multi-turn conversation state. Specifically, the system needs to know:
- Are we in a fiqh referral flow?
- Are we waiting for a location input?

**Options:**
1. **In-message context** — include a hidden `conversationState` field in the chat API request/response cycle (simplest, stateless from DB perspective)
2. **Supabase session row** — store `{ fiqh_referral_pending: true }` on the active chat session record (more robust, queryable)

**Recommendation:** Option 1 for v1. Pass `conversationState` as a field in the messages array metadata. No DB changes needed.

**This must be resolved before building the imam referral flow.**

---

### Chat Route Wiring

**File:** `app/api/chat/route.ts` (or wherever the Amina chat API lives)

Add intent detection for two new states:
```typescript
// Detect fiqh referral acceptance
if (conversationState === 'fiqh_referral_offered' && isAffirmative(userMessage)) {
  return askForLocation()
}

// Detect location input in referral context
if (conversationState === 'fiqh_referral_waiting_location') {
  const mosques = await callMosqueLookup(userMessage)
  return renderMosqueCards(mosques)
}
```

---

## PART 5 — SYSTEM PROMPT ADDITIONS

Add to Amina's system prompt (classification + fiqh rules block):

```
## QUESTION CLASSIFICATION (run before every response)

Classify every user message as one of:
- Type A: Emotional/personal → Companion mode
- Type B: Islamic information → Education mode  
- Type C: Ruling-seeking → Fiqh Protocol (mandatory)
- Type D: Practice guidance → Instructional mode

## FIQH PROTOCOL (Type C — NON-NEGOTIABLE)

If the message is Type C (ruling-seeking):

1. PHASE 1: Ask exactly ONE clarifying question before any substantive response. Do not assume context, madhab, or situation.

2. PHASE 2: After user responds, share the scholarly landscape in plain, warm language. Present multiple positions. Name the relevant fiqh concept. NEVER say "the ruling is", "you can", "you cannot", "it is halal", or "it is haram" definitively.

3. PHASE 3: End EVERY Type C response with this exact block:
"For a ruling specific to your situation, a qualified imam or Islamic scholar is the right person to ask. Would you like help finding a mosque or imam near you?"

You are a companion, not a scholar. You share what scholars have said. You do not issue rulings.
```

---

## PART 6 — POSTHOG INSTRUMENTATION

Events to fire:

| Event | Properties |
|-------|-----------|
| `fiqh_question_detected` | `{ question_type: 'C', topic: 'fake_nails' }` |
| `fiqh_phase1_asked` | `{ topic }` |
| `fiqh_phase2_shown` | `{ topic, positions_count }` |
| `imam_referral_offered` | `{ topic }` |
| `imam_referral_accepted` | — |
| `imam_referral_declined` | — |
| `mosque_card_shown` | `{ count: 3 }` |
| `mosque_phone_tapped` | `{ mosque_name }` |
| `mosque_directions_clicked` | `{ mosque_name }` |

---

## PART 7 — SWARMCLAW DISPATCH

**Agent:** SCRIBE or a dedicated AMINA-FIQH agent  
**Task:** Implement fiqh protocol changes in order:

```
Step 1: Update Amina system prompt with classification block + fiqh rules
Step 2: Add conversationState field to chat API request/response
Step 3: Add intent detection in /api/chat route for referral acceptance + location input
Step 4: Build supabase/functions/mosque-lookup Edge Function
Step 5: Build MosqueCard UI component (card with name, phone, distance, maps link)
Step 6: Wire Edge Function call from chat route
Step 7: Add PostHog events at each fiqh protocol step
Step 8: Test with "can i wear fake nails" end-to-end
```

**Acceptance criteria:**
- "Can I wear fake nails?" → Phase 1 question (no ruling)
- User responds → Phase 2 scholarly landscape (no definitive answer)
- Phase 3 referral block appears → user accepts → location asked → 3 mosque cards returned
- No message in any Type C flow contains "you can", "you cannot", "it is halal", "it is haram"

---

## OPEN QUESTIONS (must resolve before build)

| # | Question | Owner |
|---|---------|-------|
| 1 | Does Amina's current chat flow have multi-turn conversation state? | Ro |
| 2 | Is `GOOGLE_PLACES_API_KEY` available or does it need to be provisioned? | Ro |
| 3 | Which agent in SwarmClaw handles Amina feature builds? | Ro |

---

## WHAT BREAKS WITHOUT THIS

1. Amina issues confident-sounding responses to fiqh questions → users treat as rulings → act on theologically incorrect or context-stripped information
2. User's local imam contradicts Amina → trust collapse
3. Amina is positioned as a faith companion but functions as an unaccountable fatwa machine
4. Product integrity failure on the most sensitive dimension of the Amina mission
