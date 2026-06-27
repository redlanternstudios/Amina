# SWARMCLAW DISPATCH — Amina Env Vars + Payment Wiring
Mission ID: AMINA-ENV-001
Date: 2026-06-26
Priority: P0 — blocks App Store submission
Assigned to: BUILDER agent

---

## OBJECTIVE

Add all payment env vars to Vercel for the `amina-muslima-companion` project.
Team: `redlantern-studios`
Project ID: `prj_dhX6k7fBmSKMc3Ts86bLctZPT9sZ`

---

## ENV VARS TO SET (Vercel → Project → Settings → Environment Variables)

Set all for: Production + Preview + Development

### CONFIRMED — SET THESE NOW

| Key | Value |
|---|---|
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | `price_1TmkLQD8NguWaPm7bPWmGUFm` |
| `STRIPE_PREMIUM_ANNUAL_PRICE_ID` | `price_1TmkNBD8NguWaPm7GoWayZJS` |

### PENDING — NEEDS RO/KEYMON TO PROVIDE

| Key | Source |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → Secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → after adding endpoint → signing secret (whsec_...) |
| `NEXT_PUBLIC_REVENUECAT_API_KEY` | RevenueCat Dashboard → Project → API Keys → Public iOS key (appl_...) |
| `REVENUECAT_WEBHOOK_SECRET` | Set in RC webhook config + match here (e.g. `Bearer amina-rc-hook-2026`) |

---

## STRIPE WEBHOOK SETUP (do in Stripe dashboard)

1. Stripe → Developers → Webhooks → Add endpoint
2. URL: `https://amina-muslima-companion.vercel.app/api/stripe/webhook`
3. Events to select:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Save → copy signing secret → add as `STRIPE_WEBHOOK_SECRET`

---

## ACCEPTANCE CRITERIA

- [ ] Both price IDs visible in Vercel env vars
- [ ] `STRIPE_SECRET_KEY` set (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` set (whsec_...)
- [ ] `NEXT_PUBLIC_REVENUECAT_API_KEY` set (appl_...)
- [ ] `REVENUECAT_WEBHOOK_SECRET` set
- [ ] Vercel deployment succeeds after env var changes

---

## RECEIPT

After completion write to `amina/task-reports/env-vars-2026-06-26.md`:
- which vars were set
- timestamp
- who set them
