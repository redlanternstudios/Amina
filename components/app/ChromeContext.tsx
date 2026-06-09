'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChromeContextValue = {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  bubbleOpen: boolean
  openBubble: () => void
  closeBubble: () => void
  toggleBubble: () => void
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const ChromeContext = createContext<ChromeContextValue | null>(null)

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Assalamu alaikum. I'm Amina, here to walk with you. Ask me anything — about faith, life, or whatever is on your heart.",
}

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openBubble = useCallback(() => setBubbleOpen(true), [])
  const closeBubble = useCallback(() => setBubbleOpen(false), [])
  const toggleBubble = useCallback(() => setBubbleOpen((v) => !v), [])

  return (
    <ChromeContext.Provider
      value={{
        sidebarOpen,
        openSidebar,
        closeSidebar,
        bubbleOpen,
        openBubble,
        closeBubble,
        toggleBubble,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChromeContext.Provider>
  )
}

export function useChrome() {
  const ctx = useContext(ChromeContext)
  if (!ctx) throw new Error('useChrome must be used within ChromeProvider')
  return ctx
}
