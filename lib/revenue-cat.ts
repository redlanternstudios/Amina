/**
 * RevenueCat integration placeholder
 * Replace REVENUECAT_API_KEY in .env.local before going live.
 * Docs: https://docs.revenuecat.com/docs/nextjs
 */

export const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ?? ''

export const ENTITLEMENTS = {
  /** Full Amina companion access — Circle members only */
  AMINA_ACCESS: 'amina_access',
} as const

/**
 * Check if the current user has an active Amina entitlement.
 * Stub — wire to RevenueCat SDK when ready.
 */
export async function hasAminaAccess(userId: string): Promise<boolean> {
  if (!REVENUECAT_API_KEY) {
    // Dev mode: grant access to all users
    console.warn('[RevenueCat] No API key — granting access in dev mode')
    return true
  }

  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    const entitlements = data?.subscriber?.entitlements ?? {}
    return ENTITLEMENTS.AMINA_ACCESS in entitlements
  } catch {
    return false
  }
}
