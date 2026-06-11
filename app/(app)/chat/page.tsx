'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/chat/${crypto.randomUUID()}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-dvh bg-cream">
      <span className="text-3xl animate-pulse">🌙</span>
    </div>
  )
}
