'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initRevenueCat } from '@/lib/revenuecat'

/**
 * Initializes RevenueCat once the authenticated user is known.
 * Place inside the authenticated (app) layout — not root layout.
 */
export default function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        await initRevenueCat(user.id)
      }
    }
    init()
  }, [])

  return <>{children}</>
}
