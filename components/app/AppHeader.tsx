'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Menu, ChevronLeft, Home } from 'lucide-react'
import { ReactNode } from 'react'
import { useChrome } from './ChromeContext'

type AppHeaderProps = {
  title?: string
  /** Render the Amina wordmark in the center instead of a plain title */
  brand?: boolean
  /** Optional element rendered on the far right (e.g. notifications, search) */
  right?: ReactNode
}

export default function AppHeader({ title, brand, right }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { openSidebar } = useChrome()

  const isHome = pathname === '/home'

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-2 px-3 py-3 bg-cream/85 backdrop-blur-md"
      style={{ borderBottom: '1px solid var(--amina-hairline)' }}
    >
      {/* Left cluster: menu + back/home */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={openSidebar}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/70"
          style={{ border: '1px solid var(--amina-hairline)' }}
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>

        {!isHome && (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/70"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        )}

        {!isHome && (
          <button
            onClick={() => router.push('/home')}
            aria-label="Go home"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ivory text-charcoal/70"
            style={{ border: '1px solid var(--amina-hairline)' }}
          >
            <Home size={17} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Center title */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {brand ? (
          <img
            src="/images/amina-logo.png"
            alt="Amina"
            className="object-cover rounded-full"
            style={{ height: 38, width: 38 }}
          />
        ) : (
          <h1 className="font-display text-xl text-charcoal truncate">{title}</h1>
        )}
      </div>

      {/* Right slot (kept same width as left for centering balance) */}
      <div className="flex items-center justify-end gap-1 flex-shrink-0 min-w-[2.25rem]">
        {right}
      </div>
    </header>
  )
}
