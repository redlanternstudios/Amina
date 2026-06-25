'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${className ?? ''}`}
      style={{
        background: 'var(--amina-warm-ivory)',
        border: '1px solid var(--amina-hairline)',
        color: 'var(--amina-soft-charcoal)',
      }}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={1.5} />
      ) : (
        <Moon size={17} strokeWidth={1.5} />
      )}
    </button>
  )
}
