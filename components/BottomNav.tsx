'use client'

import { usePathname, useRouter } from 'next/navigation'
import { MessageCircle, BookOpen, Heart, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Amina', icon: MessageCircle, href: '/home' },
  { label: 'Reflections', icon: BookOpen, href: '/reflections' },
  { label: "Du'a Wall", icon: Heart, href: '/dua-wall' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none" style={{ background: '#07080D' }}>
      <div
        className="pointer-events-auto flex items-center justify-around gap-0 w-full"
        style={{
          background: '#07080D',
          height: '64px',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
          paddingTop: '8px',
        }}
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/profile' && pathname.startsWith(item.href))
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors relative"
              style={{
                color: isActive ? '#F7F2EE' : '#8A8A8A',
              }}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#D92532',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
