/**
 * RevenueCat client for Amina iOS (Capacitor)
 *
 * Only runs on native device. In web/browser context, falls back gracefully.
 * Apple IAP is mandatory for in-app digital goods — do NOT use Stripe inside this app.
 */

import { Capacitor } from '@capacitor/core'

// Lazy-load the Capacitor plugin so the web build doesn't break
let PurchasesModule: typeof import('@revenuecat/purchases-capacitor') | null = null

async function getPurchases() {
  if (!Capacitor.isNativePlatform()) return null
  if (!PurchasesModule) {
    PurchasesModule = await import('@revenuecat/purchases-capacitor')
  }
  return PurchasesModule.Purchases
}

// ─── Initialization ───────────────────────────────────────────────────────────

export async function initRevenueCat(userId: string) {
  const Purchases = await getPurchases()
  if (!Purchases) return

  await Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
    appUserID: userId,
  })
}

// ─── Entitlement check ────────────────────────────────────────────────────────

export async function checkPremiumEntitlement(): Promise<boolean> {
  const Purchases = await getPurchases()
  if (!Purchases) return false

  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return !!customerInfo.entitlements.active['premium']
  } catch {
    return false
  }
}

// ─── Offerings ────────────────────────────────────────────────────────────────

export type AminaOffering = Awaited<ReturnType<typeof getOfferings>>

export async function getOfferings() {
  const Purchases = await getPurchases()
  if (!Purchases) return null

  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current ?? null
  } catch {
    return null
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function purchasePackage(
  pkg: import('@revenuecat/purchases-capacitor').PurchasesPackage
): Promise<{ success: boolean; error?: string }> {
  const Purchases = await getPurchases()
  if (!Purchases) return { success: false, error: 'Not on native platform' }

  try {
    await Purchases.purchasePackage({ aPackage: pkg })
    return { success: true }
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string }
    if (err.userCancelled) return { success: false, error: 'cancelled' }
    return { success: false, error: err.message ?? 'Purchase failed' }
  }
}

// ─── Restore purchases ────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases()
  if (!Purchases) return false

  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return !!customerInfo.entitlements.active['premium']
  } catch {
    return false
  }
}

// ─── Log out (on user sign out) ───────────────────────────────────────────────

export async function resetRevenueCat() {
  const Purchases = await getPurchases()
  if (!Purchases) return
  try {
    await Purchases.logOut()
  } catch {
    // ignore — user may not be logged in to RC
  }
}
