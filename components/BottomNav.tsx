'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/guidance', label: 'Guidance', icon: '📖' },
  { href: '/reflections', label: 'Reflections', icon: '📝' },
  { href: '/circle', label: 'Circle', icon: '👥' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-charcoal/10 pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                active ? 'text-rose-amina' : 'text-charcoal/40'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-xs font-medium ${ active ? 'text-rose-amina' : 'text-charcoal/40' }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
