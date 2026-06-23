'use client'

import { usePathname, useRouter } from 'next/navigation'

// Final nav spec — locked 2026-06-22
// Home | Circle | Reflections | Du'a Wall | Profile
// Guidance dropped from nav — accessible via Home chips and /guidance direct link
const NAV_ITEMS = [
  { label: 'Home', icon: '🏠', href: '/home' },
  { label: 'Circle', icon: '🔮', href: '/circle' },
  { label: 'Reflections', icon: '🔖', href: '/reflections' },
  { label: "Du'a Wall", icon: '🤲', href: '/dua-wall' },
  { label: 'Profile', icon: '👤', href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-charcoal/10 pb-safe z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-rose-500' : 'text-charcoal/40'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-xs font-medium ${
                isActive ? 'text-rose-500' : 'text-charcoal/40'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
