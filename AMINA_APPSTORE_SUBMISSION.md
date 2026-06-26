# Amina — App Store Connect Submission Guide
Date: 2026-06-26 | Status: READY TO FILL IN

Paste each field directly into App Store Connect.

---

## APP INFORMATION (App Store Connect → App Information)

**App Name (30 chars max):**
Amina: Muslima Companion

**Subtitle (30 chars max):**
Faith, Reflection & Du'a

**Privacy Policy URL:**
https://endovljmaudnxdzdapmf.supabase.co/functions/v1/privacy-policy

**Support URL:**
https://byredlanternstudios.com

**Category:**
Primary: Health & Fitness
Secondary: Lifestyle

**Content Rights:**
Do you have rights or are you the author of the content? → YES

---

## APP STORE LISTING (App Store Connect → Version → App Store)

**Description (max 4000 chars):**

---

Amina is a faith-centered AI companion built for Muslim women — a private space to reflect, make du'a, and stay connected to your deen.

She remembers your conversations, grounds every response in authentic hadith and Quran, and meets you where you are — whether you are carrying something heavy or simply seeking a moment of stillness.

**What Amina offers:**

▸ Guided Conversations
Talk with Amina about anything on your heart. She listens deeply and responds with empathy, Quranic wisdom, and verified hadith — never fabricated citations.

▸ Du'a Wall
Share your du'as with a community of sisters and receive ameen in return. Mark answered du'as with gratitude. Every post is gently watched over by Amina herself.

▸ Reflections Journal
Your conversations become a spiritual archive. Amina surfaces meaningful moments from your journey so you can see how far you have come.

▸ Islamic Scope Guardrails
Amina does not give fatwas. She does not speculate. Every spiritual claim is tied to a verifiable source. She knows when to say she does not know.

▸ Built for Sisters
Amina was designed specifically for Muslim women — in language, in tone, and in understanding.

Privacy is sacred here. Your conversations belong to you.

---

**Keywords (100 chars max, comma separated):**
muslim women,dua,islamic app,faith,quran,hadith,reflection,spiritual,muslima,prayer,dhikr,hijab

**What's New in This Version:**
Initial release of Amina — your AI spiritual companion.

---

## PRICING & AVAILABILITY

**Price:** Free

**Availability:** All territories (or restrict to: United States, Canada, United Kingdom, Australia — your call)

**In-App Purchases to add before submission:**
1. Amina Premium Monthly — $4.99/month
2. Amina Premium Annual — $39.99/year (save 33%)

Note: These must be created in App Store Connect → Monetization → Subscriptions BEFORE submitting for review. RevenueCat will read them automatically once configured with the product IDs.

---

## AGE RATING QUESTIONNAIRE

Answer these in App Store Connect → Age Rating:

| Question | Answer |
|---|---|
| Made for Kids | No |
| Cartoon/Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic Violence | None |
| Sexual Content/Nudity | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Info | None |
| Alcohol, Tobacco, Drugs | None |
| Gambling | None |
| Contests | None |
| Social Networking (user-generated content) | **Yes — Frequent/Intense** (Du'a Wall) |
| Profanity or Crude Humor | None |

**Result rating: 12+** (due to social networking / UGC)

---

## APP REVIEW INFORMATION

**Notes for App Review:**
Amina is an AI spiritual companion for Muslim women. The app includes:

1. AI conversations grounded in Quran and hadith
2. A Du'a Wall (community prayer board with text only — no media uploads from users)
3. Personal reflections journal

Test account for review:
Email: amina@yopmail.com
Password: Amina123!

This account has full premium access enabled.

The app requires sign-in to access core features. Sign up flow is available on the auth screen.

**Contact info for review:**
Name: Rory Semeah
Phone: +1 442 461 3093
Email: roryleesemeah@gmail.com

---

## DISPLAY NAME FIX (Xcode — must do before next build)

**Current state:** Display Name is blank in Xcode
**Fix:** Xcode → Target: App → General tab → Display Name → type: **Amina**

OR edit `ios/App/App/Info.plist` directly — add/update:
```xml
<key>CFBundleDisplayName</key>
<string>Amina</string>
```

Then run: `npx cap sync ios` and rebuild the archive.

---

## APP ICON (must replace before submission)

Current icon is the default Capacitor icon. Apple will reject on metadata review.

**Spec:** 1024×1024px PNG, no alpha, no rounded corners (Apple applies mask)
**Path to place icon:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
**Required filename:** `Icon-1024.png` (+ smaller sizes Xcode auto-generates)

Simplest flow: use AppIcon.co — upload 1024px PNG, it generates all sizes. Drag the folder into Xcode.

**Suggested icon concept:** Crescent moon + soft glow on cream/gold background. No text.

---

## REQUIRED ENV VARS (add to Vercel + .env.local)

```
NEXT_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxxxxx   # from RevenueCat dashboard
REVENUECAT_WEBHOOK_SECRET=Bearer xxxxxxxxxx            # set in RC dashboard, match here
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxxxxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxxxxxxx
NEXT_PUBLIC_APP_URL=https://amina.app (or your domain)
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx                     # already set? verify
```

---

## REQUIRED SUPABASE MIGRATION

Add Stripe fields to user_profiles if not present:

```sql
alter table user_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists subscription_status text default 'free';
```

Run in Supabase SQL editor.

---

## REVENUCAT DASHBOARD SETUP (5 steps)

1. Create account at app.revenuecat.com
2. New Project → Platform: iOS → Bundle ID: `com.redlanternstudios.amina`
3. API Key → copy to `NEXT_PUBLIC_REVENUECAT_API_KEY`
4. Entitlements → create `premium`
5. Products → add product IDs (must match what you created in ASC):
   - `amina_premium_monthly`
   - `amina_premium_annual`
6. Link both products to the `premium` entitlement
7. Offerings → create `default` offering → add monthly + annual packages
8. Webhooks → add: `https://YOUR_DOMAIN/api/revenuecat/webhook` with Authorization header

---

## STRIPE DASHBOARD SETUP (web subscriptions)

1. stripe.com → Products → Add Product: "Amina Premium"
2. Add prices:
   - Monthly recurring: $4.99/month → copy price ID
   - Annual recurring: $39.99/year → copy price ID
3. Webhooks → Add endpoint → `https://YOUR_DOMAIN/api/stripe/webhook`
   → Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

---

## SUBMISSION ORDER

1. [ ] Fix Display Name in Xcode → rebuild archive
2. [ ] Replace app icon → rebuild archive
3. [ ] Create IAP subscription products in App Store Connect
4. [ ] Set up RevenueCat (5 steps above)
5. [ ] Add all env vars to Vercel
6. [ ] Run Supabase migration
7. [ ] Install package: `pnpm add @revenuecat/purchases-capacitor stripe`
8. [ ] Run `npx cap sync ios`
9. [ ] Test purchase flow in TestFlight (Sandbox IAP)
10. [ ] Fill in App Store listing using content above
11. [ ] Submit for review
