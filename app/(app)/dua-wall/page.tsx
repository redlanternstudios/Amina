'use client'

import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

// DU'A WALL — STUB
// Full build pending: see AMINA_UI_AUDIT_DAY5.md PROMPT 9 + 10
// DB tables needed: dua_wall_posts, dua_wall_reactions
// API routes needed: GET /api/dua-wall, POST /api/dua-wall, POST /api/dua-wall/[id]/react

export default function DuaWallPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-display text-3xl text-charcoal">Du&apos;a Wall</h1>
        <p className="text-charcoal/50 text-sm mt-1">Lift each other in prayer.</p>
      </div>

      {/* Placeholder — coming soon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="bg-ivory rounded-3xl p-8 text-center w-full max-w-sm">
          <p className="text-4xl mb-4">🤲</p>
          <h2 className="font-display text-xl text-charcoal mb-2">Coming soon inshallah</h2>
          <p className="text-charcoal/50 text-sm leading-relaxed">
            The Du&apos;a Wall is where sisters lift each other in anonymous prayer.
            It&apos;s being built with care — check back soon.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
