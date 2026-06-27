# SWARMCLAW DISPATCH — Amina Payments Install
Mission ID: AMINA-PAYMENTS-001
Date: 2026-06-26
Priority: P0 — blocks App Store submission
Assigned to: BUILDER agent (host execution required)

---

## OBJECTIVE

Install RevenueCat Capacitor plugin and Stripe SDK in the Amina project, then sync the iOS native layer.

## WORKING DIRECTORY

`/Users/rorysemeah/Documents/Claude/Projects/RedLantern Studios/amina/`

## COMMANDS (run in order, stop on failure)

```bash
cd "/Users/rorysemeah/Documents/Claude/Projects/RedLantern Studios/amina"

# 1. Install packages
pnpm add @revenuecat/purchases-capacitor stripe

# 2. Sync Capacitor iOS layer (copies web assets + plugins to native project)
npx cap sync ios

# 3. Verify install
node -e "require('@revenuecat/purchases-capacitor'); console.log('RC: OK')"
node -e "require('stripe'); console.log('Stripe: OK')"
```

## ACCEPTANCE CRITERIA

- [ ] `@revenuecat/purchases-capacitor` appears in pnpm-lock.yaml
- [ ] `stripe` appears in pnpm-lock.yaml
- [ ] `npx cap sync ios` completes without error
- [ ] No TypeScript errors in `lib/revenuecat.ts` (run `npx tsc --noEmit`)

## ON FAILURE

- If pnpm fails: try `pnpm install` first, then retry
- If cap sync fails: run `npx cap update ios` then retry sync
- Log failure to `amina/task-reports/payments-install-$(date +%Y%m%d).md`

## POST-COMPLETION

Commit with message: `feat: add RevenueCat + Stripe payment integration`
Push to GitHub main.

## RECEIPT

After completion write to `amina/task-reports/payments-install-2026-06-26.md`:
- packages installed + versions
- cap sync output
- tsc result
- timestamp
