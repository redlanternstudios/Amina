'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { checkPremiumEntitlement } from '@/lib/revenuecat'
import { createClient } from '@/lib/supabase/client'

/**
 * Returns premium status for the current user.
 *
 * Priority order:
 * 1. RevenueCat (native iOS) — live entitlement check
 * 2. Supabase has_full_access — fallback for web + lifetime accounts
 */
export function useEntitlement() {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        if (Capacitor.isNativePlatform()) {
          const entitlement = await checkPremiumEntitlement()
          setIsPremium(entitlement)
        } else {
          // Web fallback — check Supabase directly
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) { setIsPremium(false); return }

          // Fast path: amina_profiles.has_full_access
          const { data: profile } = await supabase
            .from('amina_profiles')
            .select('has_full_access')
            .eq('id', user.id)
            .single()

          if (profile?.has_full_access) { setIsPremium(true); return }

          // Slow path: check subscriptions table
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status, plan_type')
            .eq('user_id', user.id)
            .single()

          setIsPremium(
            sub?.status === 'active' ||
            sub?.plan_type === 'lifetime'
          )
        }
      } catch {
        setIsPremium(false)
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [])

  return { isPremium, loading }
}
