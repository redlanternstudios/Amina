# SCOPE CHANGE — RevenueCat + Stripe Payments
Change ID: SC-002 | Date: 2026-06-26 | Authorized by: Ro
Previous scope: SCOPE_LOCK_AMINA_v1.md (RevenueCat listed as Phase 2)
Status: APPROVED — executing immediately

---

## User Story

As a user of Amina, I want to unlock premium features through a clear paywall so that the product can generate revenue at launch rather than after a separate Phase 2 release.

---

## Acceptance Criteria

1. RevenueCat SDK (`@revenuecat/purchases-capacitor`) is initialized on app launch with the authenticated user ID
2. A paywall modal presents Apple IAP subscription options when a non-premium user hits a gated feature
3. Successful purchase updates `plan_type` in Supabase via RevenueCat webhook, granting `has_full_access = true`
4. Stripe checkout route exists for web-based subscriptions (Next.js only — NOT used inside the iOS app)
5. Stripe webhook updates Supabase on successful web subscription

---

## Definition of Done

- [ ] `lib/revenuecat.ts` — SDK client written and initialized in layout
- [ ] `hooks/useEntitlement.ts` — entitlement check hook
- [ ] `components/paywall/PaywallModal.tsx` — purchase UI
- [ ] `app/api/revenuecat/webhook/route.ts` — RevenueCat → Supabase sync
- [ ] `app/api/stripe/checkout/route.ts` — web checkout session
- [ ] `app/api/stripe/webhook/route.ts` — Stripe → Supabase sync
- [ ] RevenueCat dashboard: product + entitlement + offering configured
- [ ] Apple IAP product created in App Store Connect
- [ ] `.env.local` vars added: REVENUECAT_API_KEY, REVENUECAT_WEBHOOK_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

---

## Impact on Locked Scope

RevenueCat moves from Phase 2 to v1. No locked features removed. Adds paywall gate in front of unlimited Amina conversations and Du'a Wall (premium tier).

## Risk

MEDIUM — App Store review may flag IAP if products not fully configured in ASC before submission.

## Important Architecture Constraint

Apple App Store rules require that digital goods consumed inside an iOS app use Apple IAP.
- iOS in-app purchases → RevenueCat + Apple IAP ONLY
- Web subscriptions → Stripe ONLY
- Do NOT wire Stripe inside the Capacitor iOS app. App will be rejected.
