import { ChromeProvider } from '@/components/app/ChromeContext'
import Sidebar from '@/components/app/Sidebar'
import AminaBubble from '@/components/app/AminaBubble'
import BottomNav from '@/components/BottomNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChromeProvider>
      <div className="min-h-dvh bg-cream flex flex-col pb-20">
        {children}
      </div>
      <Sidebar />
      <AminaBubble />
      <BottomNav />
    </ChromeProvider>
  )
}
