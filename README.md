# Amina

**Faith-centered AI companion app for Muslim women.**  
Built by RedLantern Studios™

---

## Build Status

**Overall Completion: ~30%** (per Kemon's audit)

| Layer | Completion | Notes |
|-------|-----------|-------|
| Auth | ~20% | Session protection, middleware wiring in progress |
| AI Chat | ~15% | Groq SDK integrated; response flow under test |
| RevenueCat | 0% | Stub created; key management pending |
| CI/CD | 0% | Workflow skeleton added; no automation running yet |
| iOS Build | 0% | Signing certs + provisioning not set up |
| Core Screens | ~60% | Components built; wiring to live data incomplete |

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (auth + database + RLS)
- **Capacitor** (iOS)
- **RevenueCat** (subscriptions)
- **Groq / Llama 3.3** (AI chat)

---

## Blockers

- 🔴 `GROQ_API_KEY` — missing from `.env.local`; chat returns stubs until set
- 🔴 `REVENUECAT_PUBLIC_SDK_KEY` — not configured; subscription flow blocked
- 🔴 **iOS Signing Certificates** — not provisioned; iOS build cannot run

---

## Next Steps

1. **Auth Wiring** — Complete middleware.ts to gate `/app/*` and `/dashboard/*` routes
2. **CI Automation** — Validate workflow runs on push/PR; fix any build errors
3. **Schema Confirmation** — Audit all migration files; confirm applied to Supabase
4. **RevenueCat Stub** — Initialize SDK; wire real key before production

---

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

> Without `GROQ_API_KEY`, the chat route returns realistic stub responses for local dev.

---

## Database Setup

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

Tables created:
- `profiles` — user preferences from onboarding
- `conversations` — chat sessions
- `messages` — individual messages
- `reflections` — saved reflections

All tables have RLS enabled. Users can only access their own data.

---

## Brand Tokens

```css
--cream:    #F7F2EB   /* bg default */
--ivory:    #F2ECE4   /* card bg */
--rose:     #C9796A   /* primary CTA */
--olive:    #8E9878   /* secondary */
--charcoal: #2C2926   /* body text */
--gold:     #D7BA82   /* accents */
```

Typography: **Canela** (display) + **Inter** (body)

---

## Core Screens

| ID | Screen | Route | Status |
|---|---|---|---|
| S-01 | Splash / Entry | `/(auth)/` | 🔧 In Progress |
| S-02 | Welcome Intro | `/(auth)/welcome` | 🔧 In Progress |
| OB-01 | Onboarding: Intent | `/(auth)/onboarding/intent` | 🔧 In Progress |
| OB-02 | Onboarding: Tone | `/(auth)/onboarding/tone` | 🔧 In Progress |
| OB-03 | Onboarding: Preferences | `/(auth)/onboarding/preferences` | 🔧 In Progress |
| OB-04 | Onboarding: Complete | `/(auth)/onboarding/complete` | 🔧 In Progress |
| P-07 | Home | `/(app)/home` | 🔧 In Progress |
| P-08 | Chat | `/(app)/chat` | 🔧 In Progress |
| P-09 | Reflections | `/(app)/reflections` | 🔧 In Progress |
| P-10 | Guidance | `/(app)/guidance` | 🔧 In Progress |
| P-11 | The Circle | `/(app)/circle` | 🔧 In Progress |
| P-12 | Profile & Settings | `/(app)/profile` | 🔧 In Progress |

---

*Amina is an AI companion designed to support your spiritual journey. For religious rulings (fatwas), please consult qualified scholars. For emotional support needs, please seek professional support.*
