'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, NotebookPen, Users, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Guidance', icon: BookOpen, href: '/guidance' },
  { label: 'Reflections', icon: NotebookPen, href: '/reflections' },
  { label: 'Circle', icon: Users, href: '/circle' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center justify-around gap-1 w-full max-w-md rounded-[28px] bg-ivory px-2 py-2"
        style={{
          border: '1px solid var(--amina-hairline)',
          boxShadow: 'var(--amina-shadow-nav)',
        }}
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors"
              style={{ color: isActive ? 'var(--amina-primary-action)' : 'var(--amina-muted-text)' }}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
