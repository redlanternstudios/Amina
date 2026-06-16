'use client'

import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from './client'

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}
