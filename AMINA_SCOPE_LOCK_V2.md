# AMINA SCOPE LOCK V2

## 8 Locked Items — Build Order

### NAV-001: Nav Cleanup
- **Final nav:** About | Amina | The Circle | Partnerships | Sign in | Join The Circle
- **Status:** ✅ VERIFIED — no references found in codebase (clean)

### SAFETY-001: Islamic Safety Layer Patch
- Remove emoji from CRISIS_RESPONSE
- Add IPV_KEYWORDS array + IPV_RESPONSE constant + detectIPV function
- Move applySafetyLayer call server-side into chat/route.ts before Groq call
- **Status:** ✅ VERIFIED — `lib/islamic-safety.ts` patched (IPV added, emoji removed), `app/api/chat/route.ts` has safety before AI call

### ONBOARD-001: Onboarding Flow
- Blocked on: amina_profiles schema confirmation

### STREAM-001: Stream Chat
- Blocked on: ONBOARD-001 completion
- Requires: ai SDK v4 upgrade

### REFLECT-001: Reflections Feature
- Blocked on: stable chat route + amina_reflections schema

### PAY-001: Payments/Subscriptions
- Blocked on: auth flow stable + middleware created

### CIRCLE-001: Content Track
- Parallel track, no engineering deps

### CIRCLE-002: Circle Enhancements
- Post CIRCLE-001

## CRITICAL BLOCKER
- **Groq free tier exhausted (497k/500k TPD)**
- Fix: Ro upgrade at console.groq.com/settings/billing
- Workaround: Ollama fallback at localhost:11434 for SwarmClaw agents
- Workaround: OpenRouter for Amina chat route (same API format, no migration)
