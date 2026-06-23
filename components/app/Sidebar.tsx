'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  Home, BookOpen, NotebookPen, Users, User,
  Sparkles, Bell, ShieldCheck, LogOut, X,
} from 'lucide-react'
import { useChrome } from './ChromeContext'
import AminaWordmark from '@/components/brand/AminaWordmark'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Guidance', icon: BookOpen, href: '/guidance' },
  { label: 'Reflections', icon: NotebookPen, href: '/reflections' },
  { label: 'The Circle', icon: Users, href: '/circle' },
  { label: 'Profile & Settings', icon: User, href: '/profile' },
]

export default function Sidebar() {
  const { sidebarOpen, closeSidebar, openBubble } = useChrome()
  const pathname = usePathname()
  const router = useRouter()

  function go(href: string) {
    router.push(href)
    closeSidebar()
  }

  function askAmina() {
    closeSidebar()
    setTimeout(openBubble, 320)
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* still route */ }
    closeSidebar()
    router.push('/auth')
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={closeSidebar}
        aria-hidden
        className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className="fixed top-0 left-0 z-[70] h-dvh w-[82%] max-w-xs bg-cream flex flex-col"
        style={{
          borderRight: '1px solid var(--amina-hairline)',
          boxShadow: '6px 0 40px rgba(60,40,30,0.18)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          visibility: sidebarOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--amina-hairline)' }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/images/amina-logo.png"
              alt=""
              aria-hidden
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <AminaWordmark size="sm" tone="gradient" showSignature={false} />
          </div>
          <button
            onClick={closeSidebar}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/60"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-charcoal/40 font-medium">
            Menu
          </p>
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                aria-current={active ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left transition-colors duration-150"
                style={{
                  background: active ? 'var(--amina-ivory)' : 'transparent',
                  color: active ? 'var(--amina-primary-action)' : 'var(--amina-charcoal)',
                  border: active ? '1px solid var(--amina-hairline)' : '1px solid transparent',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-[15px]">{item.label}</span>
              </button>
            )
          })}

          <p className="px-3 pt-5 pb-2 text-[11px] uppercase tracking-wider text-charcoal/40 font-medium">
            Quick actions
          </p>
          <button
            onClick={askAmina}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left"
            style={{ color: 'var(--amina-charcoal)' }}
          >
            <Sparkles size={20} strokeWidth={1.5} style={{ color: 'var(--amina-primary-action)' }} />
            <span className="text-[15px] font-medium">Ask Amina</span>
          </button>
          <button
            onClick={() => go('/profile')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left"
            style={{ color: 'var(--amina-charcoal)' }}
          >
            <Bell size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Notifications</span>
          </button>
          <button
            onClick={() => go('/profile')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left"
            style={{ color: 'var(--amina-charcoal)' }}
          >
            <ShieldCheck size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Privacy</span>
          </button>
        </nav>

        {/* Footer */}
        <div
          className="px-3 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--amina-hairline)' }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
            style={{ color: 'var(--amina-primary-action)' }}
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Log out</span>
          </button>
          <p className="px-3 pt-2 text-[11px] text-charcoal/30">by RedLantern Studios™</p>
        </div>
      </aside>
    </>
  )
}
