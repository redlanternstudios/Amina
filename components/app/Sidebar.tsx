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
    openBubble()
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore — still route to auth
    }
    closeSidebar()
    router.push('/auth')
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
        className={`fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden={!sidebarOpen}
        className={`fixed top-0 left-0 z-[70] h-dvh w-[82%] max-w-xs bg-cream flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderRight: '1px solid var(--amina-hairline)', boxShadow: 'var(--amina-shadow-nav)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--amina-hairline)' }}>
          <AminaWordmark size="sm" tone="gradient" showSignature={false} className="!items-start !text-left" />
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
          <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-charcoal/40">Menu</p>
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                aria-current={active ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left transition-colors"
                style={{
                  background: active ? 'var(--amina-ivory)' : 'transparent',
                  color: active ? 'var(--amina-primary-action)' : 'var(--amina-charcoal)',
                  border: active ? '1px solid var(--amina-hairline)' : '1px solid transparent',
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-[15px] font-medium">{item.label}</span>
              </button>
            )
          })}

          <p className="px-3 pt-5 pb-2 text-[11px] uppercase tracking-wider text-charcoal/40">Quick actions</p>
          <button
            onClick={askAmina}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left text-charcoal"
          >
            <Sparkles size={20} strokeWidth={1.5} className="text-rose-amina" />
            <span className="text-[15px] font-medium">Ask Amina</span>
          </button>
          <button
            onClick={() => go('/profile')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left text-charcoal"
          >
            <Bell size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Notifications</span>
          </button>
          <button
            onClick={() => go('/profile')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left text-charcoal"
          >
            <ShieldCheck size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Privacy</span>
          </button>
        </nav>

        {/* Footer / logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--amina-hairline)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-rose-amina"
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
