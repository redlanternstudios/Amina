# Amina

**Faith-centered AI companion app for Muslim women.**  
Built by RedLantern Studios™

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

## Screens (All Complete)

| ID | Screen | Route | Status |
|---|---|---|---|
| S-01 | Splash / Entry | `/(auth)/` | ✅ |
| S-02 | Welcome Intro | `/(auth)/welcome` | ✅ |
| OB-01 | Onboarding: Intent | `/(auth)/onboarding/intent` | ✅ |
| OB-02 | Onboarding: Tone | `/(auth)/onboarding/tone` | ✅ |
| OB-03 | Onboarding: Preferences | `/(auth)/onboarding/preferences` | ✅ |
| OB-04 | Onboarding: Complete | `/(auth)/onboarding/complete` | ✅ |
| P-07 | Home | `/(app)/home` | ✅ |
| P-08 | Chat | `/(app)/chat` | ✅ |
| P-09 | Reflections | `/(app)/reflections` | ✅ |
| P-10 | Guidance | `/(app)/guidance` | ✅ |
| P-11 | The Circle | `/(app)/circle` | ✅ |
| P-12 | Profile & Settings | `/(app)/profile` | ✅ |

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

## Every Screen Has

- ✅ Empty state
- ✅ Loading state  
- ✅ Error state
- ✅ Mobile-first at 375px
- ✅ Brand tokens applied
- ✅ Islamic safety disclaimer on chat

---

*Amina is an AI companion designed to support your spiritual journey. For religious rulings (fatwas), please consult qualified scholars. For emotional support needs, please seek professional support.*
