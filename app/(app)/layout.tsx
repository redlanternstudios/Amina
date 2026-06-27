'use client'

import { usePathname } from 'next/navigation'
import { ChromeProvider } from '@/components/app/ChromeContext'
import Sidebar from '@/components/app/Sidebar'
import AminaBubble from '@/components/app/AminaBubble'
import BottomNav from '@/components/BottomNav'
import RevenueCatProvider from '@/components/app/RevenueCatProvider'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Chat pages manage their own full-height layout — no nav chrome
  const isChat = pathname?.startsWith('/chat/')

  return (
    <ChromeProvider>
      <RevenueCatProvider>
        <div className={`min-h-dvh bg-cream flex flex-col${isChat ? '' : ' pb-20'}`}>
          {children}
        </div>
        {!isChat && <Sidebar />}
        {!isChat && <AminaBubble />}
        {!isChat && <BottomNav />}
      </RevenueCatProvider>
    </ChromeProvider>
  )
}
