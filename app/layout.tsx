import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader, Lora } from 'next/font/google'
import { ThemeProvider } from '@/components/app/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

// Amina's voice font — warm, literary, unmistakably feminine
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-amina-voice',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Amina — Faith-centered reflection for women',
  description: 'A safe space for faith, reflection, and growth. You are seen, heard, and supported.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Amina',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F7F2E8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${lora.variable} bg-cream`}>
      <body className="bg-cream text-charcoal font-body antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
