'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatItem {
  id: string
  title: string
  date: string
}

interface ChatContextType {
  chatHistory: ChatItem[]
  setChatHistory: (history: ChatItem[]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { id: '1', title: 'How to build a web application', date: '2 hours ago' },
    { id: '2', title: 'React best practices', date: '1 day ago' },
    { id: '3', title: 'TypeScript basics', date: '3 days ago' },
    { id: '4', title: 'Next.js routing', date: '1 week ago' },
  ])

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory }}>
      {children}
    </ChatContext.Provider>
  )
}