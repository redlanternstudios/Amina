# SWARMCLAW DISPATCH — AMINA FIQH PROTOCOL
**Mission:** AMINA-FIQH-V1
**Date:** 2026-06-17
**CTP Reference:** amina/CTP_FIQH_QUESTION_PROTOCOL.md

---

## ROBBY — SEND THIS

> **Mission: AMINA-FIQH-V1**
>
> Build the Amina Islamic judgment question protocol end-to-end. This is a product integrity feature — Amina currently answers fiqh (Islamic ruling) questions without a formal protocol. That's a trust and mission risk. Fix it fully.
>
> **CTP doc is at:** `amina/CTP_FIQH_QUESTION_PROTOCOL.md` — read it before executing.
>
> **Execute in this exact order:**
>
> **Step 1 — System prompt update**
> Locate Amina's system prompt (likely in `app/api/chat/route.ts` or a constants file). Add the classification block and fiqh rules from the CTP doc Part 5. Do not touch anything else in the prompt.
>
> **Step 2 — Conversation state**
> Add a `conversationState` field to the chat API request/response cycle. It should pass through the messages array metadata — no DB changes. States needed: `null` (default), `fiqh_referral_offered`, `fiqh_referral_waiting_location`.
>
> **Step 3 — Intent detection in chat route**
> In the chat API route, add two intent checks before the AI call:
> - If `conversationState === 'fiqh_referral_offered'` AND message is affirmative (yes, sure, yeah, please, etc.) → set state to `fiqh_referral_waiting_location`, return Amina asking for zip/city
> - If `conversationState === 'fiqh_referral_waiting_location'` → call the mosque-lookup Edge Function with the user message, return mosque cards (do NOT pass to DeepSeek)
>
> **Step 4 — Supabase Edge Function: mosque-lookup**
> Create `supabase/functions/mosque-lookup/index.ts`.
> - Input: `{ location: string }` (zip or city name)
> - Geocode with Google Geocoding API → lat/lng
> - Call Google Places nearbySearch → type: mosque, radius: 10000m
> - Return top 3: `[{ name, address, phone, distance_km, maps_url }]`
> - Key: `GOOGLE_PLACES_API_KEY` from Supabase Edge Function secrets
> - Do NOT store location. Stateless call only.
>
> **Step 5 — MosqueCard UI component**
> v0 is generating this (separate prompt). When it's ready, integrate the component at `components/MosqueCard.tsx`. The chat route should return a structured `mosqueResults` payload that the chat UI renders as MosqueCard components — not as a text message.
>
> **Step 6 — Phase 3 referral trigger in AI response**
> After system prompt update is live, the AI should naturally end Type C responses with the referral offer. Verify this is happening by testing "can I wear fake nails". If it's not consistent, add a post-processing step that appends the referral block to any response the model classifies as Type C.
>
> **Step 7 — PostHog events**
> Add these events (use existing PostHog client):
> - `fiqh_question_detected` → fire when AI classifies Type C
> - `imam_referral_offered` → fire when Phase 3 block is shown
> - `imam_referral_accepted` → fire when user responds affirmatively
> - `mosque_card_shown` → fire when cards render
> - `mosque_phone_tapped` → fire on phone link click
> - `mosque_directions_clicked` → fire on maps link click
>
> **Step 8 — End-to-end test**
> Send "can I wear fake nails" to Amina. Verify:
> - [ ] Response asks one clarifying question (no ruling issued)
> - [ ] Follow-up shows scholarly landscape with multiple positions
> - [ ] Phase 3 referral block appears
> - [ ] Accepting referral triggers location ask
> - [ ] Providing zip returns 3 mosque cards with name, phone, distance
> - [ ] No message in the flow says "you can", "you cannot", "it is halal", "it is haram"
>
> **Blockers to surface immediately:**
> - If `GOOGLE_PLACES_API_KEY` is not in Supabase secrets → stop and flag to Ro
> - If conversation state cannot be passed through the current chat API shape → flag the constraint and propose the simplest fix before proceeding
> - If Amina's system prompt location is unclear → read the repo, find it, confirm before editing
>
> Report back: step completed, file changed, test result. One update per step.

---

## ACCEPTANCE CRITERIA (mission complete when all pass)

- [ ] Type C questions always trigger 3-phase fiqh protocol
- [ ] No definitive ruling ever issued in Amina responses
- [ ] Phase 3 referral block present in 100% of Type C conversations
- [ ] Mosque lookup returns real results for a US zip code
- [ ] MosqueCard renders with name, phone (tap-to-call), distance, directions link
- [ ] All 6 PostHog events firing
- [ ] "can I wear fake nails" end-to-end test passes all 6 checklist items above
