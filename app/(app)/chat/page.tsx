'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AminaIcon from '@/components/brand/AminaIcon'
import { getOrCreateDefaultConversation } from '@/lib/supabase/chat'

function ChatRedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q')

  useEffect(() => {
    getOrCreateDefaultConversation()
      .then(convo => {
        const target = q
          ? `/chat/${convo.id}?q=${encodeURIComponent(q)}`
          : `/chat/${convo.id}`
        router.replace(target)
      })
      .catch(() => {
        // Unauthenticated or error — go to auth
        router.replace('/auth?redirect=/chat')
      })
  }, [router, q])

  return (
    <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
      <AminaIcon size={44} className="animate-pulse" />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--amina-soft-cream)' }}>
          <AminaIcon size={44} className="animate-pulse" />
        </div>
      }
    >
      <ChatRedirectInner />
    </Suspense>
  )
}
